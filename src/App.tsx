/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { Loader2, Plus } from 'lucide-react';
import { AuthPage } from './components/AuthPage';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Filters } from './components/Filters';
import { Header } from './components/Header';
import { TaskList } from './components/TaskList';
import { TaskModal } from './components/TaskModal';
import { Toast } from './components/Toast';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { useTheme } from './hooks/useTheme';
import type {
  Category,
  Priority,
  SortBy,
  SortOrder,
  StatusFilter,
  ToastMessage,
  Todo,
  TodoInput,
} from './types/todo';
import { PRIORITY_STYLES, parseLocalDate } from './utils/taskHelpers';

type ConfirmState =
  | { type: 'delete-one'; task: Todo }
  | { type: 'clear-completed'; count: number }
  | null;

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastTimersRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const existingTimer = toastTimersRef.current.get(id);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
      toastTimersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: 'success' | 'error' | 'info', title: string, description?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, type, title, description }]);

      const timer = window.setTimeout(() => {
        dismissToast(id);
      }, 4000);
      toastTimersRef.current.set(id, timer);
    },
    [dismissToast]
  );

  useEffect(() => {
    const timers = toastTimersRef.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    stats,
    refetch,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    clearCompleted,
  } = useTasks(user?.id, addToast);

  // Filter & sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortBy>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // UI & modal state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Todo | null>(null);
  const [submittingTask, setSubmittingTask] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const openNewTaskModal = useCallback(() => {
    setEditingTask(null);
    setTaskModalOpen(true);
  }, []);

  const openEditTaskModal = useCallback((task: Todo) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  }, []);

  const closeTaskModal = useCallback(() => {
    setTaskModalOpen(false);
    setEditingTask(null);
  }, []);

  // Keyboard shortcuts: N -> new task, / -> focus search
  useEffect(() => {
    if (!user) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (taskModalOpen || confirmState !== null) return;

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isTyping =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target?.isContentEditable;

      if (isTyping) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        openNewTaskModal();
      } else if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user, taskModalOpen, confirmState, openNewTaskModal]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('All');
    setPriorityFilter('All');
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
      statusFilter !== 'all' ||
      categoryFilter !== 'All' ||
      priorityFilter !== 'All'
  );

  const filteredAndSortedTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = tasks.filter((task) => {
      if (statusFilter === 'active' && task.is_completed) {
        return false;
      }
      if (statusFilter === 'completed' && !task.is_completed) {
        return false;
      }
      if (categoryFilter !== 'All' && task.category !== categoryFilter) {
        return false;
      }
      if (priorityFilter !== 'All' && task.priority !== priorityFilter) {
        return false;
      }
      if (query) {
        const titleMatch = task.title.toLowerCase().includes(query);
        const descMatch = task.description?.toLowerCase().includes(query) ?? false;
        if (!titleMatch && !descMatch) {
          return false;
        }
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'created_at') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'priority') {
        const weightA = PRIORITY_STYLES[a.priority]?.weight ?? 2;
        const weightB = PRIORITY_STYLES[b.priority]?.weight ?? 2;
        comparison = weightA - weightB;
      } else if (sortBy === 'due_date') {
        if (!a.due_date && !b.due_date) {
          comparison = 0;
        } else if (!a.due_date) {
          return 1;
        } else if (!b.due_date) {
          return -1;
        } else {
          comparison =
            parseLocalDate(a.due_date).getTime() - parseLocalDate(b.due_date).getTime();
        }
      }

      if (comparison === 0) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [tasks, statusFilter, categoryFilter, priorityFilter, searchQuery, sortBy, sortOrder]);

  const handleTaskSubmit = async (input: TodoInput) => {
    setSubmittingTask(true);
    try {
      const ok = editingTask
        ? await updateTask(editingTask.id, input)
        : await createTask(input);
      if (ok) {
        closeTaskModal();
      }
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmState) return;
    setConfirmLoading(true);
    try {
      if (confirmState.type === 'delete-one') {
        await deleteTask(confirmState.task.id);
      } else {
        await clearCompleted();
      }
      setConfirmState(null);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleSignOut = async () => {
    const res = await signOut();
    if (res.error) {
      addToast('error', 'Sign out failed', res.error);
    } else {
      addToast('info', 'Signed out', 'See you next time.');
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      {authLoading ? (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-[#0A0A0B]">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-[#2A52BE] dark:text-[#5B82E8]" />
            <span className="text-sm font-medium text-slate-600 dark:text-[#A1A1AA]">
              Loading TaskFlow...
            </span>
          </div>
        </div>
      ) : !user ? (
        <>
          <AuthPage
            onSignIn={signIn}
            onSignUp={signUp}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
          <Toast toasts={toasts} onDismiss={dismissToast} />
        </>
      ) : (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0A0A0B] dark:text-[#F5F5F7]">
          {/* Simple Top Bar */}
          <Header
            userEmail={user.email ?? 'Account'}
            theme={theme}
            onToggleTheme={toggleTheme}
            onSignOut={handleSignOut}
          />

          {/* Centered Single Column (max-w 720px) */}
          <main className="mx-auto w-full max-w-[720px] space-y-5 px-4 pt-8 pb-16 sm:px-6">
            {/* My Tasks Heading + Thin Progress Bar */}
            <section aria-label="Tasks header and completion progress">
              <div className="flex items-baseline justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F5F5F7]">
                  My Tasks
                </h1>
                <p className="font-mono text-xs tabular-nums text-slate-500 dark:text-[#A1A1AA]">
                  {stats.completed}/{stats.total} completed · {stats.completionRate}%
                </p>
              </div>

              <div
                role="progressbar"
                aria-valuenow={stats.completionRate}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Task completion progress"
                className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-[#18181C]"
              >
                <div
                  className="h-full rounded-full bg-[#2A52BE] transition-all duration-300 ease-out"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </section>

            {/* Add-Task Row with Neon Rose Glow */}
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white p-2.5 pl-4 dark:border-[#26262C] dark:bg-[#111114]">
              <button
                type="button"
                onClick={openNewTaskModal}
                className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left text-sm text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none dark:text-[#A1A1AA] dark:hover:text-[#F5F5F7]"
              >
                <span className="truncate">Add a new task...</span>
                <kbd className="hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-400 sm:inline-block dark:border-[#26262C] dark:bg-[#18181C] dark:text-[#A1A1AA]">
                  N
                </kbd>
              </button>

              <button
                type="button"
                onClick={openNewTaskModal}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#2A52BE] px-4 text-sm font-semibold text-white shadow-[0_0_20px_-4px_rgba(255,46,147,0.5)] ring-1 ring-[#FF2E93]/40 transition-all hover:bg-[#345FD1] hover:shadow-[0_0_24px_-2px_rgba(255,46,147,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] focus-visible:ring-offset-2 whitespace-nowrap shrink-0 dark:focus-visible:ring-offset-[#111114]"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Add task</span>
              </button>
            </div>

            {/* Search & Filter Tabs */}
            <Filters
              searchQuery={searchQuery}
              searchInputRef={searchInputRef}
              statusFilter={statusFilter}
              categoryFilter={categoryFilter}
              priorityFilter={priorityFilter}
              sortBy={sortBy}
              sortOrder={sortOrder}
              completedCount={stats.completed}
              hasActiveFilters={hasActiveFilters}
              onSearchChange={setSearchQuery}
              onStatusChange={setStatusFilter}
              onCategoryChange={setCategoryFilter}
              onPriorityChange={setPriorityFilter}
              onSortByChange={setSortBy}
              onToggleSortOrder={() =>
                setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
              }
              onResetFilters={handleResetFilters}
              onRequestClearCompleted={() =>
                setConfirmState({ type: 'clear-completed', count: stats.completed })
              }
            />

            {/* Task List */}
            <TaskList
              tasks={filteredAndSortedTasks}
              loading={tasksLoading}
              error={tasksError}
              hasActiveFilters={hasActiveFilters}
              onToggle={toggleTask}
              onEdit={openEditTaskModal}
              onDelete={(task) => setConfirmState({ type: 'delete-one', task })}
              onCreateTask={openNewTaskModal}
              onResetFilters={handleResetFilters}
              onRetry={() => refetch(true)}
            />
          </main>

          <TaskModal
            isOpen={taskModalOpen}
            editingTask={editingTask}
            submitting={submittingTask}
            onSubmit={handleTaskSubmit}
            onClose={closeTaskModal}
          />

          <ConfirmDialog
            isOpen={confirmState !== null}
            title={
              confirmState?.type === 'clear-completed'
                ? 'Clear all completed tasks?'
                : 'Delete task?'
            }
            description={
              confirmState?.type === 'clear-completed'
                ? `This will permanently remove ${confirmState.count} completed ${
                    confirmState.count === 1 ? 'task' : 'tasks'
                  } from your workspace. This action cannot be undone.`
                : confirmState?.type === 'delete-one'
                  ? `Are you sure you want to delete "${confirmState.task.title}"? This action cannot be undone.`
                  : ''
            }
            confirmLabel={
              confirmState?.type === 'clear-completed' ? 'Clear completed' : 'Delete task'
            }
            variant="danger"
            loading={confirmLoading}
            onConfirm={handleConfirmAction}
            onCancel={() => !confirmLoading && setConfirmState(null)}
          />

          <Toast toasts={toasts} onDismiss={dismissToast} />
        </div>
      )}
    </MotionConfig>
  );
}
