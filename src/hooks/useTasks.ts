import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../supabaseClient.js';
import type { Category, TaskStats, Todo, TodoInput } from '../types/todo';
import { CATEGORIES, isDueToday, isOverdue, isUpcoming } from '../utils/taskHelpers';

interface NotifyFn {
  (type: 'success' | 'error' | 'info', title: string, description?: string): void;
}

export function useTasks(userId: string | undefined, onNotify: NotifyFn) {
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const notifyRef = useRef(onNotify);
  notifyRef.current = onNotify;

  const fetchTasks = useCallback(async (showSpinner = true) => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    if (showSpinner) {
      setLoading(true);
    }
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setTasks((data as Todo[]) || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load your tasks.';
      setError(message);
      notifyRef.current('error', 'Could not load tasks', message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks(true);
  }, [fetchTasks]);

  // Realtime sync across tabs and devices
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`todos-realtime-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const incoming = payload.new as Todo;
            setTasks((prev) => {
              if (prev.some((t) => t.id === incoming.id)) {
                return prev.map((t) => (t.id === incoming.id ? incoming : t));
              }
              return [incoming, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Todo;
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as { id?: string })?.id;
            if (deletedId) {
              setTasks((prev) => prev.filter((t) => t.id !== deletedId));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const createTask = useCallback(
    async (input: TodoInput): Promise<boolean> => {
      if (!userId) return false;

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const optimisticTask: Todo = {
        id: tempId,
        user_id: userId,
        title: input.title.trim(),
        description: input.description?.trim() ? input.description.trim() : null,
        category: input.category,
        priority: input.priority,
        due_date: input.due_date || null,
        is_completed: false,
        created_at: new Date().toISOString(),
      };

      setTasks((prev) => [optimisticTask, ...prev]);

      try {
        const { data, error: insertError } = await supabase
          .from('todos')
          .insert({
            user_id: userId,
            title: optimisticTask.title,
            description: optimisticTask.description,
            category: optimisticTask.category,
            priority: optimisticTask.priority,
            due_date: optimisticTask.due_date,
            is_completed: false,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        const saved = data as Todo;
        setTasks((prev) => {
          // Avoid duplicates if Realtime event arrived slightly earlier
          const withoutDuplicate = prev.filter((t) => t.id !== saved.id);
          return withoutDuplicate.map((t) => (t.id === tempId ? saved : t));
        });

        notifyRef.current('success', 'Task added', `"${saved.title}" is now on your list.`);
        return true;
      } catch (err) {
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
        const message = err instanceof Error ? err.message : 'Failed to save, please retry.';
        notifyRef.current('error', 'Failed to add task', message);
        return false;
      }
    },
    [userId]
  );

  const updateTask = useCallback(
    async (id: string, input: TodoInput): Promise<boolean> => {
      const previousTasks = tasks;
      const cleanedTitle = input.title.trim();
      const cleanedDesc = input.description?.trim() ? input.description.trim() : null;
      const cleanedDueDate = input.due_date || null;

      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                title: cleanedTitle,
                description: cleanedDesc,
                category: input.category,
                priority: input.priority,
                due_date: cleanedDueDate,
              }
            : t
        )
      );

      try {
        const { data, error: updateError } = await supabase
          .from('todos')
          .update({
            title: cleanedTitle,
            description: cleanedDesc,
            category: input.category,
            priority: input.priority,
            due_date: cleanedDueDate,
          })
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        const saved = data as Todo;
        setTasks((prev) => prev.map((t) => (t.id === id ? saved : t)));
        notifyRef.current('success', 'Task updated');
        return true;
      } catch (err) {
        setTasks(previousTasks);
        const message = err instanceof Error ? err.message : 'Failed to save, please retry.';
        notifyRef.current('error', 'Failed to update task', message);
        return false;
      }
    },
    [tasks]
  );

  const toggleTask = useCallback(
    async (task: Todo): Promise<boolean> => {
      const nextCompleted = !task.is_completed;
      const previousTasks = tasks;

      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, is_completed: nextCompleted } : t))
      );

      try {
        const { error: toggleError } = await supabase
          .from('todos')
          .update({ is_completed: nextCompleted })
          .eq('id', task.id);

        if (toggleError) {
          throw toggleError;
        }

        notifyRef.current(
          'success',
          nextCompleted ? 'Task completed' : 'Task marked active',
          nextCompleted ? `"${task.title}" checked off.` : undefined
        );
        return true;
      } catch (err) {
        setTasks(previousTasks);
        const message = err instanceof Error ? err.message : 'Failed to save, please retry.';
        notifyRef.current('error', 'Could not update status', message);
        return false;
      }
    },
    [tasks]
  );

  const deleteTask = useCallback(
    async (id: string): Promise<boolean> => {
      const previousTasks = tasks;
      const target = tasks.find((t) => t.id === id);

      setTasks((prev) => prev.filter((t) => t.id !== id));

      try {
        const { error: deleteError } = await supabase.from('todos').delete().eq('id', id);

        if (deleteError) {
          throw deleteError;
        }

        notifyRef.current('success', 'Task deleted', target ? `"${target.title}" removed.` : undefined);
        return true;
      } catch (err) {
        setTasks(previousTasks);
        const message = err instanceof Error ? err.message : 'Failed to delete task, please retry.';
        notifyRef.current('error', 'Delete failed', message);
        return false;
      }
    },
    [tasks]
  );

  const clearCompleted = useCallback(async (): Promise<boolean> => {
    const completedIds = tasks.filter((t) => t.is_completed).map((t) => t.id);
    if (completedIds.length === 0) return true;

    const previousTasks = tasks;
    setTasks((prev) => prev.filter((t) => !t.is_completed));

    try {
      const { error: clearError } = await supabase
        .from('todos')
        .delete()
        .in('id', completedIds);

      if (clearError) {
        throw clearError;
      }

      notifyRef.current(
        'success',
        'Completed tasks cleared',
        `Removed ${completedIds.length} completed ${completedIds.length === 1 ? 'task' : 'tasks'}.`
      );
      return true;
    } catch (err) {
      setTasks(previousTasks);
      const message = err instanceof Error ? err.message : 'Failed to clear completed tasks.';
      notifyRef.current('error', 'Clear failed', message);
      return false;
    }
  }, [tasks]);

  const stats: TaskStats = useMemo(() => {
    const categoryCounts = CATEGORIES.reduce(
      (acc, cat) => {
        acc[cat] = 0;
        return acc;
      },
      {} as Record<Category, number>
    );

    let completed = 0;
    let overdue = 0;
    let todayCount = 0;
    let upcomingCount = 0;

    for (const task of tasks) {
      if (task.category in categoryCounts) {
        categoryCounts[task.category] += 1;
      } else {
        categoryCounts.Other += 1;
      }

      if (task.is_completed) {
        completed += 1;
      } else {
        if (isOverdue(task.due_date, task.is_completed)) {
          overdue += 1;
        }
        if (isDueToday(task.due_date)) {
          todayCount += 1;
        }
        if (isUpcoming(task.due_date, task.is_completed)) {
          upcomingCount += 1;
        }
      }
    }

    const total = tasks.length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      overdue,
      completionRate,
      todayCount,
      upcomingCount,
      categoryCounts,
    };
  }, [tasks]);

  return {
    tasks,
    loading,
    error,
    stats,
    refetch: fetchTasks,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    clearCompleted,
  };
}
