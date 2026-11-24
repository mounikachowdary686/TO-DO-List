import { AnimatePresence } from 'motion/react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { Todo } from '../types/todo';
import { EmptyState } from './EmptyState';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Todo[];
  loading: boolean;
  error: string | null;
  hasActiveFilters: boolean;
  onToggle: (task: Todo) => void;
  onEdit: (task: Todo) => void;
  onDelete: (task: Todo) => void;
  onCreateTask: () => void;
  onResetFilters: () => void;
  onRetry: () => void;
}

export function TaskList({
  tasks,
  loading,
  error,
  hasActiveFilters,
  onToggle,
  onEdit,
  onDelete,
  onCreateTask,
  onResetFilters,
  onRetry,
}: TaskListProps) {
  if (loading) {
    return (
      <div aria-busy="true" aria-label="Loading tasks" className="space-y-3">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-[#26262C] dark:bg-[#111114]"
          >
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5 h-5 w-5 shrink-0 animate-pulse rounded-md bg-slate-200 dark:bg-[#18181C]" />
              <div className="flex-1 space-y-2.5">
                <div className="flex items-center justify-between gap-4">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-[#18181C]" />
                  <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100 dark:bg-[#18181C]" />
                </div>
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-[#18181C]/80" />
                <div className="flex items-center gap-3 pt-1">
                  <div className="h-3 w-16 animate-pulse rounded bg-slate-100 dark:bg-[#18181C]/80" />
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-100 dark:bg-[#18181C]/80" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center rounded-xl border border-[#FF2E93]/35 bg-white px-6 py-12 text-center dark:border-[#FF2E93]/35 dark:bg-[#111114]"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF2E93]/10 text-[#D91B77] dark:text-[#FF62AF]">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-[#F5F5F7]">
          Unable to load your tasks
        </h3>
        <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-[#A1A1AA]">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2A52BE] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#345FD1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE]"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          <span>Try again</span>
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        hasActiveFilters={hasActiveFilters}
        onCreateTask={onCreateTask}
        onResetFilters={onResetFilters}
      />
    );
  }

  return (
    <ul aria-label="Task list" className="space-y-2.5">
      <AnimatePresence initial={false}>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </ul>
  );
}
