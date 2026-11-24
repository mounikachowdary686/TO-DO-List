import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import type { Todo, TodoInput } from '../types/todo';
import { TaskForm } from './TaskForm';

interface TaskModalProps {
  isOpen: boolean;
  editingTask: Todo | null;
  submitting?: boolean;
  onSubmit: (input: TodoInput) => Promise<void> | void;
  onClose: () => void;
}

export function TaskModal({
  isOpen,
  editingTask,
  submitting = false,
  onSubmit,
  onClose,
}: TaskModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => !submitting && onClose()}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs dark:bg-black/75"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#26262C] dark:bg-[#111114]"
          >
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-[#26262C]">
              <div>
                <h2
                  id="task-modal-title"
                  className="text-lg font-bold tracking-tight text-slate-900 dark:text-[#F5F5F7]"
                >
                  {editingTask ? 'Edit task' : 'Create new task'}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-[#A1A1AA]">
                  {editingTask
                    ? 'Update details, priority, or due date.'
                    : 'Add a task to your list.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                aria-label="Close modal"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] disabled:opacity-50 dark:text-[#A1A1AA] dark:hover:bg-[#18181C] dark:hover:text-[#F5F5F7]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <TaskForm
              key={editingTask?.id ?? 'new-task'}
              initialTask={editingTask}
              submitting={submitting}
              onSubmit={onSubmit}
              onCancel={onClose}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
