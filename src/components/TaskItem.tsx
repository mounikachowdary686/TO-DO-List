import { useRef } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  ArrowDown,
  Calendar,
  Check,
  Clock,
  Equal,
  Flag,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { Priority, Todo } from '../types/todo';
import {
  CATEGORY_STYLES,
  PRIORITY_STYLES,
  formatDueDateInfo,
  triggerCompletionConfetti,
} from '../utils/taskHelpers';

interface TaskItemProps {
  task: Todo;
  onToggle: (task: Todo) => void;
  onEdit: (task: Todo) => void;
  onDelete: (task: Todo) => void;
}

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const checkboxRef = useRef<HTMLButtonElement>(null);

  const categoryStyle = CATEGORY_STYLES[task.category] ?? CATEGORY_STYLES.Other;
  const priorityStyle = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.Medium;
  const dueInfo = formatDueDateInfo(task.due_date, task.is_completed);

  const handleToggle = () => {
    if (!task.is_completed) {
      triggerCompletionConfetti(checkboxRef.current);
    }
    onToggle(task);
  };

  const renderPriorityIcon = (priority: Priority) => {
    if (priority === 'Low') return <ArrowDown className="h-3 w-3" aria-hidden="true" />;
    if (priority === 'Medium') return <Equal className="h-3 w-3" aria-hidden="true" />;
    return <Flag className="h-3 w-3" aria-hidden="true" />;
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      className={`group rounded-xl border p-4 transition-colors ${
        task.is_completed
          ? 'border-slate-200/70 bg-slate-50/70 dark:border-[#26262C]/70 dark:bg-[#111114]/60'
          : dueInfo.status === 'overdue'
            ? 'border-[#FF2E93]/35 bg-white hover:border-[#FF2E93]/55 dark:border-[#FF2E93]/35 dark:bg-[#111114] dark:hover:border-[#FF2E93]/60'
            : 'border-slate-200/90 bg-white hover:border-slate-300 dark:border-[#26262C] dark:bg-[#111114] dark:hover:border-[#36363F]'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Cerulean Animated Checkbox */}
        <button
          ref={checkboxRef}
          type="button"
          role="checkbox"
          aria-checked={task.is_completed}
          aria-label={
            task.is_completed
              ? `Mark "${task.title}" as active`
              : `Mark "${task.title}" as completed`
          }
          onClick={handleToggle}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#111114] ${
            task.is_completed
              ? 'animate-check-pop border-[#2A52BE] bg-[#2A52BE] text-white'
              : 'border-slate-300 bg-white hover:border-[#2A52BE] dark:border-[#3A3A44] dark:bg-[#18181C] dark:hover:border-[#5B82E8]'
          }`}
        >
          <Check
            className={`h-3.5 w-3.5 stroke-[3] transition-transform duration-150 ${
              task.is_completed ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
            }`}
            aria-hidden="true"
          />
        </button>

        {/* Task Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3
              className={`text-sm font-semibold leading-snug break-words transition-colors sm:text-[15px] ${
                task.is_completed
                  ? 'text-slate-400 line-through dark:text-[#A1A1AA]/55'
                  : 'text-slate-900 dark:text-[#F5F5F7]'
              }`}
            >
              {task.title}
            </h3>

            {/* Priority Tag */}
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap shrink-0 ${priorityStyle.pill}`}
            >
              {renderPriorityIcon(task.priority)}
              <span>{task.priority}</span>
            </span>
          </div>

          {task.description && (
            <p
              className={`mt-1 line-clamp-2 text-xs leading-relaxed sm:text-sm ${
                task.is_completed
                  ? 'text-slate-400 dark:text-[#A1A1AA]/45'
                  : 'text-slate-600 dark:text-[#A1A1AA]'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Metadata Row */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-[#A1A1AA]">
              <span
                className={`h-2 w-2 rounded-full ${categoryStyle.dot}`}
                aria-hidden="true"
              />
              <span>{task.category}</span>
            </span>

            {dueInfo.status !== 'none' && (
              <>
                <span className="text-slate-300 dark:text-[#26262C]" aria-hidden="true">
                  ·
                </span>

                {dueInfo.status === 'overdue' && dueInfo.badgeText ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-[#FF2E93]/35 bg-[#FF2E93]/10 px-2 py-0.5 font-semibold text-[#D91B77] dark:text-[#FF62AF]">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{dueInfo.badgeText}</span>
                  </span>
                ) : dueInfo.status === 'today' && dueInfo.badgeText ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-[#2A52BE]/30 bg-[#2A52BE]/12 px-2 py-0.5 font-semibold text-[#2A52BE] dark:border-[#2A52BE]/45 dark:bg-[#2A52BE]/20 dark:text-[#5B82E8]">
                    <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{dueInfo.badgeText}</span>
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 font-medium ${
                      task.is_completed
                        ? 'text-slate-400 dark:text-[#A1A1AA]/55'
                        : 'text-slate-500 dark:text-[#A1A1AA]'
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{dueInfo.text}</span>
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1 sm:opacity-75 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(task)}
            aria-label={`Edit "${task.title}"`}
            title="Edit task"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-[#2A52BE]/12 hover:text-[#2A52BE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] dark:text-[#A1A1AA] dark:hover:bg-[#2A52BE]/20 dark:hover:text-[#5B82E8]"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            aria-label={`Delete "${task.title}"`}
            title="Delete task"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-[#FF2E93]/12 hover:text-[#D91B77] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2E93] dark:text-[#A1A1AA] dark:hover:bg-[#FF2E93]/15 dark:hover:text-[#FF62AF]"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.li>
  );
}
