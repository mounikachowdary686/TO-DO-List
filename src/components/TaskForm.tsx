import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  ArrowDown,
  Equal,
  Flag,
  Loader2,
  X,
} from 'lucide-react';
import type { Category, Priority, Todo, TodoInput } from '../types/todo';
import {
  CATEGORIES,
  CATEGORY_STYLES,
  PRIORITIES,
  getTodayISO,
  getTomorrowISO,
} from '../utils/taskHelpers';

interface TaskFormProps {
  initialTask?: Todo | null;
  submitting?: boolean;
  onSubmit: (input: TodoInput) => Promise<void> | void;
  onCancel: () => void;
}

export function TaskForm({
  initialTask,
  submitting = false,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title ?? '');
  const [description, setDescription] = useState(initialTask?.description ?? '');
  const [category, setCategory] = useState<Category>(initialTask?.category ?? 'Work');
  const [priority, setPriority] = useState<Priority>(initialTask?.priority ?? 'Medium');
  const [dueDate, setDueDate] = useState(initialTask?.due_date ?? '');
  const [titleError, setTitleError] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();

    if (!trimmed) {
      setTitleError('Please enter a task title.');
      titleInputRef.current?.focus();
      return;
    }

    if (trimmed.length > 200) {
      setTitleError('Task title must be 200 characters or fewer.');
      titleInputRef.current?.focus();
      return;
    }

    setTitleError(null);
    await onSubmit({
      title: trimmed,
      description: description.trim() ? description.trim() : null,
      category,
      priority,
      due_date: dueDate || null,
    });
  };

  const renderPriorityIcon = (pri: Priority) => {
    if (pri === 'Low') return <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />;
    if (pri === 'Medium') return <Equal className="h-3.5 w-3.5" aria-hidden="true" />;
    return <Flag className="h-3.5 w-3.5" aria-hidden="true" />;
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Title */}
      <div>
        <label
          htmlFor="task-title"
          className="block text-sm font-medium text-slate-700 dark:text-[#A1A1AA]"
        >
          Title <span className="text-[#FF2E93]">*</span>
        </label>
        <input
          ref={titleInputRef}
          id="task-title"
          name="title"
          type="text"
          required
          maxLength={200}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError(null);
          }}
          placeholder="e.g. Finalise Q4 roadmap presentation"
          aria-invalid={Boolean(titleError)}
          aria-describedby={titleError ? 'task-title-error' : undefined}
          className={`mt-1.5 block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 dark:bg-[#18181C] dark:text-[#F5F5F7] dark:placeholder-[#A1A1AA]/50 ${
            titleError
              ? 'border-[#FF2E93] focus:border-[#FF2E93] focus:ring-[#FF2E93]/25'
              : 'border-slate-200 focus:border-[#2A52BE] focus:ring-[#2A52BE]/25 dark:border-[#26262C] dark:focus:border-[#5B82E8]'
          }`}
        />
        {titleError && (
          <p
            id="task-title-error"
            role="alert"
            className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-[#D91B77] dark:text-[#FF62AF]"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{titleError}</span>
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="task-description"
          className="block text-sm font-medium text-slate-700 dark:text-[#A1A1AA]"
        >
          Description <span className="font-normal opacity-60">(optional)</span>
        </label>
        <textarea
          id="task-description"
          name="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add context, links, or next steps..."
          className="mt-1.5 block w-full resize-y rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-[#2A52BE] focus:outline-none focus:ring-2 focus:ring-[#2A52BE]/25 dark:border-[#26262C] dark:bg-[#18181C] dark:text-[#F5F5F7] dark:placeholder-[#A1A1AA]/50 dark:focus:border-[#5B82E8]"
        />
      </div>

      {/* Category & Priority Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="task-category"
            className="block text-sm font-medium text-slate-700 dark:text-[#A1A1AA]"
          >
            Category
          </label>
          <div className="relative mt-1.5">
            <span
              className={`pointer-events-none absolute top-1/2 left-3.5 h-2.5 w-2.5 -translate-y-1/2 rounded-full ${CATEGORY_STYLES[category].dot}`}
              aria-hidden="true"
            />
            <select
              id="task-category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="block h-10 w-full rounded-lg border border-slate-200 bg-white pr-3.5 pl-8 text-sm font-medium text-slate-800 transition-colors focus:border-[#2A52BE] focus:outline-none focus:ring-2 focus:ring-[#2A52BE]/25 dark:border-[#26262C] dark:bg-[#18181C] dark:text-[#F5F5F7] dark:focus:border-[#5B82E8]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium text-slate-700 dark:text-[#A1A1AA]">
            Priority
          </span>
          <div
            role="radiogroup"
            aria-label="Task priority"
            className="mt-1.5 grid grid-cols-3 gap-1 rounded-lg border border-slate-200/80 bg-slate-100 p-1 dark:border-[#26262C] dark:bg-[#18181C]"
          >
            {PRIORITIES.map((pri) => {
              const selected = priority === pri;
              const activeColors =
                pri === 'High'
                  ? 'bg-[#FF2E93]/15 text-[#D91B77] ring-1 ring-[#FF2E93]/40 dark:bg-[#FF2E93]/20 dark:text-[#FF62AF]'
                  : pri === 'Medium'
                    ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300 dark:bg-[#5B82E8]/20 dark:text-[#98A6FF] dark:ring-[#7C6FF6]/45'
                    : 'bg-[#2A52BE] text-white';

              return (
                <button
                  key={pri}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setPriority(pri)}
                  className={`inline-flex h-8 items-center justify-center gap-1 rounded-md text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] ${
                    selected
                      ? activeColors
                      : 'text-slate-600 hover:text-slate-900 dark:text-[#A1A1AA] dark:hover:text-[#F5F5F7]'
                  }`}
                >
                  {renderPriorityIcon(pri)}
                  <span>{pri}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Due Date */}
      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="task-due-date"
            className="block text-sm font-medium text-slate-700 dark:text-[#A1A1AA]"
          >
            Due date <span className="font-normal opacity-60">(optional)</span>
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDueDate(getTodayISO())}
              className="rounded-md px-2 py-0.5 text-xs font-medium text-[#2A52BE] transition-colors hover:bg-[#2A52BE]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] dark:text-[#5B82E8] dark:hover:bg-[#2A52BE]/20"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setDueDate(getTomorrowISO())}
              className="rounded-md px-2 py-0.5 text-xs font-medium text-[#2A52BE] transition-colors hover:bg-[#2A52BE]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] dark:text-[#5B82E8] dark:hover:bg-[#2A52BE]/20"
            >
              Tomorrow
            </button>
            {dueDate && (
              <button
                type="button"
                onClick={() => setDueDate('')}
                aria-label="Clear due date"
                className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] dark:text-[#A1A1AA] dark:hover:bg-[#18181C]"
              >
                <X className="h-3 w-3" aria-hidden="true" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
        <input
          id="task-due-date"
          name="due_date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="mt-1.5 block h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 transition-colors focus:border-[#2A52BE] focus:outline-none focus:ring-2 focus:ring-[#2A52BE]/25 dark:border-[#26262C] dark:bg-[#18181C] dark:text-[#F5F5F7] dark:focus:border-[#5B82E8]"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-[#26262C]">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] disabled:opacity-50 dark:border-[#26262C] dark:bg-[#18181C] dark:text-[#A1A1AA] dark:hover:text-[#F5F5F7]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2A52BE] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#345FD1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] focus-visible:ring-offset-2 disabled:opacity-60 dark:focus-visible:ring-offset-[#111114]"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          <span>{initialTask ? 'Save changes' : 'Add task'}</span>
        </button>
      </div>
    </form>
  );
}
