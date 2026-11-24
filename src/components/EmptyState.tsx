import { Plus, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  hasActiveFilters: boolean;
  onCreateTask: () => void;
  onResetFilters: () => void;
}

export function EmptyState({
  hasActiveFilters,
  onCreateTask,
  onResetFilters,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200/80 bg-white px-6 py-14 text-center dark:border-[#26262C] dark:bg-[#111114]">
      {/* Custom vector illustration */}
      <div className="mb-5 flex h-24 w-24 items-center justify-center">
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
          aria-hidden="true"
        >
          <circle
            cx="60"
            cy="60"
            r="52"
            className="fill-[#2A52BE]/10 dark:fill-[#2A52BE]/15"
          />
          <rect
            x="28"
            y="26"
            width="64"
            height="72"
            rx="10"
            className="fill-white stroke-slate-200 dark:fill-[#18181C] dark:stroke-[#26262C]"
            strokeWidth="2"
          />
          <rect x="44" y="20" width="32" height="10" rx="5" fill="#2A52BE" />
          <rect x="38" y="42" width="12" height="12" rx="4" fill="#2A52BE" />
          <path
            d="M41.5 48L43.5 50L47.5 45.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="56"
            y="45"
            width="26"
            height="6"
            rx="3"
            className="fill-slate-200 dark:fill-[#26262C]"
          />
          <rect
            x="38"
            y="62"
            width="12"
            height="12"
            rx="4"
            stroke="#5B82E8"
            strokeWidth="1.5"
            className="fill-[#2A52BE]/10 dark:fill-[#2A52BE]/20"
          />
          <rect
            x="56"
            y="65"
            width="22"
            height="6"
            rx="3"
            className="fill-slate-200 dark:fill-[#26262C]"
          />
          <rect
            x="38"
            y="82"
            width="12"
            height="12"
            rx="4"
            stroke="#FF2E93"
            strokeWidth="1.5"
            className="fill-[#FF2E93]/10 dark:fill-[#FF2E93]/15"
          />
          <rect
            x="56"
            y="85"
            width="18"
            height="6"
            rx="3"
            className="fill-slate-200 dark:fill-[#26262C]"
          />
        </svg>
      </div>

      {hasActiveFilters ? (
        <>
          <h3 className="text-base font-semibold text-slate-900 dark:text-[#F5F5F7]">
            No matching tasks found
          </h3>
          <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-[#A1A1AA]">
            Nothing matches your current search or filter settings.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] dark:border-[#26262C] dark:bg-[#18181C] dark:text-[#A1A1AA] dark:hover:text-[#F5F5F7]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Reset filters</span>
            </button>
            <button
              type="button"
              onClick={onCreateTask}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2A52BE] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_-4px_rgba(255,46,147,0.45)] ring-1 ring-[#FF2E93]/35 transition-colors hover:bg-[#345FD1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE]"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add task</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-base font-semibold text-slate-900 dark:text-[#F5F5F7]">
            Your task list is clear ✨
          </h3>
          <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-[#A1A1AA]">
            Add your first task to start tracking priorities and due dates.
          </p>
          <button
            type="button"
            onClick={onCreateTask}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2A52BE] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_-4px_rgba(255,46,147,0.45)] ring-1 ring-[#FF2E93]/35 transition-colors hover:bg-[#345FD1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Create your first task</span>
          </button>
        </>
      )}
    </div>
  );
}
