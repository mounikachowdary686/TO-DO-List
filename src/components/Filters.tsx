import type { RefObject } from 'react';
import {
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import type { Category, Priority, SortBy, SortOrder, StatusFilter } from '../types/todo';
import { CATEGORIES, PRIORITIES } from '../utils/taskHelpers';

interface FiltersProps {
  searchQuery: string;
  searchInputRef: RefObject<HTMLInputElement | null>;
  statusFilter: StatusFilter;
  categoryFilter: Category | 'All';
  priorityFilter: Priority | 'All';
  sortBy: SortBy;
  sortOrder: SortOrder;
  completedCount: number;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (status: StatusFilter) => void;
  onCategoryChange: (category: Category | 'All') => void;
  onPriorityChange: (priority: Priority | 'All') => void;
  onSortByChange: (sortBy: SortBy) => void;
  onToggleSortOrder: () => void;
  onResetFilters: () => void;
  onRequestClearCompleted: () => void;
}

const STATUS_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
];

export function Filters({
  searchQuery,
  searchInputRef,
  statusFilter,
  categoryFilter,
  priorityFilter,
  sortBy,
  sortOrder,
  completedCount,
  hasActiveFilters,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onPriorityChange,
  onSortByChange,
  onToggleSortOrder,
  onResetFilters,
  onRequestClearCompleted,
}: FiltersProps) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200/90 bg-white p-3.5 dark:border-[#26262C] dark:bg-[#111114]">
      {/* Search + Status Tabs */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-[#A1A1AA]"
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            aria-label="Search tasks"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/70 pr-12 pl-9 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-[#2A52BE] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2A52BE]/25 dark:border-[#26262C] dark:bg-[#18181C] dark:text-[#F5F5F7] dark:placeholder-[#A1A1AA]/60 dark:focus:border-[#5B82E8] dark:focus:bg-[#18181C]"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] dark:text-[#A1A1AA] dark:hover:bg-[#26262C] dark:hover:text-[#F5F5F7]"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : (
            <kbd
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-400 sm:inline-block dark:border-[#26262C] dark:bg-[#111114] dark:text-[#A1A1AA]"
            >
              /
            </kbd>
          )}
        </div>

        {/* Status Filter Tabs (Cerulean active tab) */}
        <div
          role="group"
          aria-label="Filter by completion status"
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-100 p-1 dark:border-[#26262C] dark:bg-[#18181C]"
        >
          {STATUS_OPTIONS.map((option) => {
            const active = statusFilter === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onStatusChange(option.id)}
                aria-pressed={active}
                className={`rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] ${
                  active
                    ? 'bg-[#2A52BE] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-[#A1A1AA] dark:hover:text-[#F5F5F7]'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category, Priority, Sort & Clear Completed */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 dark:border-[#26262C]">
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value as Category | 'All')}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors focus:border-[#2A52BE] focus:outline-none focus:ring-2 focus:ring-[#2A52BE]/25 dark:border-[#26262C] dark:bg-[#18181C] dark:text-[#F5F5F7] dark:focus:border-[#5B82E8]"
          >
            <option value="All">All categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by priority"
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value as Priority | 'All')}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors focus:border-[#2A52BE] focus:outline-none focus:ring-2 focus:ring-[#2A52BE]/25 dark:border-[#26262C] dark:bg-[#18181C] dark:text-[#F5F5F7] dark:focus:border-[#5B82E8]"
          >
            <option value="All">All priorities</option>
            {PRIORITIES.map((pri) => (
              <option key={pri} value={pri}>
                {pri} priority
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-[#2A52BE] transition-colors hover:bg-[#2A52BE]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] whitespace-nowrap shrink-0 dark:text-[#5B82E8] dark:hover:bg-[#2A52BE]/20"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <ArrowDownUp
              className="h-3.5 w-3.5 text-slate-400 dark:text-[#A1A1AA]"
              aria-hidden="true"
            />
            <label htmlFor="sort-by-select" className="sr-only">
              Sort tasks by
            </label>
            <select
              id="sort-by-select"
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as SortBy)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors focus:border-[#2A52BE] focus:outline-none focus:ring-2 focus:ring-[#2A52BE]/25 dark:border-[#26262C] dark:bg-[#18181C] dark:text-[#F5F5F7] dark:focus:border-[#5B82E8]"
            >
              <option value="created_at">Created</option>
              <option value="due_date">Due date</option>
              <option value="priority">Priority</option>
            </select>

            <button
              type="button"
              onClick={onToggleSortOrder}
              aria-label={`Sort direction: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}. Click to toggle.`}
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] whitespace-nowrap shrink-0 dark:border-[#26262C] dark:bg-[#18181C] dark:text-[#A1A1AA] dark:hover:text-[#F5F5F7]"
            >
              {sortOrder === 'asc' ? (
                <>
                  <ArrowUp className="h-3 w-3" aria-hidden="true" />
                  <span>Asc</span>
                </>
              ) : (
                <>
                  <ArrowDown className="h-3 w-3" aria-hidden="true" />
                  <span>Desc</span>
                </>
              )}
            </button>
          </div>

          {completedCount > 0 && (
            <button
              type="button"
              onClick={onRequestClearCompleted}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#FF2E93]/30 bg-[#FF2E93]/10 px-2.5 text-xs font-medium text-[#D91B77] transition-colors hover:bg-[#FF2E93]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2E93] whitespace-nowrap shrink-0 dark:text-[#FF62AF] dark:hover:bg-[#FF2E93]/20"
            >
              <Trash2 className="h-3 w-3" aria-hidden="true" />
              <span>Clear completed ({completedCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
