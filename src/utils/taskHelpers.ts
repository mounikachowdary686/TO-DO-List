import confetti from 'canvas-confetti';
import type { Category, Priority } from '../types/todo';

export const CATEGORIES: Category[] = [
  'Work',
  'Personal',
  'Study',
  'Health',
  'Shopping',
  'Other',
];

export const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];

export interface CategoryStyle {
  dot: string;
  text: string;
  activeBg: string;
  ring: string;
}

export const CATEGORY_STYLES: Record<Category, CategoryStyle> = {
  Work: {
    dot: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
    activeBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    ring: 'focus:ring-blue-500',
  },
  Personal: {
    dot: 'bg-violet-500',
    text: 'text-violet-600 dark:text-violet-400',
    activeBg: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
    ring: 'focus:ring-violet-500',
  },
  Study: {
    dot: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    activeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    ring: 'focus:ring-amber-500',
  },
  Health: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    activeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    ring: 'focus:ring-emerald-500',
  },
  Shopping: {
    dot: 'bg-pink-500',
    text: 'text-pink-600 dark:text-pink-400',
    activeBg: 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300',
    ring: 'focus:ring-pink-500',
  },
  Other: {
    dot: 'bg-slate-400 dark:bg-slate-500',
    text: 'text-slate-600 dark:text-slate-400',
    activeBg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    ring: 'focus:ring-slate-500',
  },
};

export interface PriorityStyle {
  pill: string;
  weight: number;
  label: Priority;
}

export const PRIORITY_STYLES: Record<Priority, PriorityStyle> = {
  Low: {
    pill: 'bg-[#2A52BE]/12 text-[#2A52BE] border-[#2A52BE]/30 dark:bg-[#2A52BE]/20 dark:text-[#5B82E8] dark:border-[#2A52BE]/45',
    weight: 1,
    label: 'Low',
  },
  Medium: {
    pill: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-[#5B82E8]/15 dark:text-[#98A6FF] dark:border-[#7C6FF6]/40',
    weight: 2,
    label: 'Medium',
  },
  High: {
    pill: 'bg-[#FF2E93]/10 text-[#D91B77] border-[#FF2E93]/30 dark:bg-[#FF2E93]/15 dark:text-[#FF62AF] dark:border-[#FF2E93]/40',
    weight: 3,
    label: 'High',
  },
};

/**
 * Parse a YYYY-MM-DD date string into a local Date at midnight to avoid UTC offset issues.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function getStartOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTomorrowISO(): string {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const y = tomorrow.getFullYear();
  const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const d = String(tomorrow.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDayDiffFromToday(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const target = parseLocalDate(dateStr);
  const today = getStartOfToday();
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((target.getTime() - today.getTime()) / msPerDay);
}

export function isOverdue(dateStr: string | null, isCompleted: boolean): boolean {
  if (!dateStr || isCompleted) return false;
  const diff = getDayDiffFromToday(dateStr);
  return diff !== null && diff < 0;
}

export function isDueToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return getDayDiffFromToday(dateStr) === 0;
}

export function isUpcoming(dateStr: string | null, isCompleted: boolean): boolean {
  if (!dateStr || isCompleted) return false;
  const diff = getDayDiffFromToday(dateStr);
  return diff !== null && diff > 0;
}

export interface DueDateDisplay {
  text: string;
  badgeText: string | null;
  status: 'overdue' | 'today' | 'soon' | 'future' | 'none';
}

export function formatDueDateInfo(dateStr: string | null, isCompleted: boolean): DueDateDisplay {
  if (!dateStr) {
    return { text: '', badgeText: null, status: 'none' };
  }

  const diff = getDayDiffFromToday(dateStr);
  const parsed = parseLocalDate(dateStr);
  const formattedShort = parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: parsed.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });

  if (diff === null) {
    return { text: formattedShort, badgeText: null, status: 'future' };
  }

  if (diff < 0) {
    const days = Math.abs(diff);
    const relative = days === 1 ? 'Yesterday' : `${days} days ago`;
    return {
      text: `${relative} (${formattedShort})`,
      badgeText: isCompleted ? null : days === 1 ? '1 day overdue' : `${days} days overdue`,
      status: isCompleted ? 'future' : 'overdue',
    };
  }

  if (diff === 0) {
    return {
      text: 'Due today',
      badgeText: isCompleted ? null : 'Due today',
      status: isCompleted ? 'future' : 'today',
    };
  }

  if (diff === 1) {
    return {
      text: 'Due tomorrow',
      badgeText: null,
      status: 'soon',
    };
  }

  if (diff <= 7) {
    const weekday = parsed.toLocaleDateString(undefined, { weekday: 'short' });
    return {
      text: `Due ${weekday}, ${formattedShort}`,
      badgeText: null,
      status: 'soon',
    };
  }

  return {
    text: `Due ${formattedShort}`,
    badgeText: null,
    status: 'future',
  };
}

export function triggerCompletionConfetti(originElement?: HTMLElement | null): void {
  if (typeof window === 'undefined') return;
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  let origin = { x: 0.5, y: 0.6 };
  if (originElement) {
    const rect = originElement.getBoundingClientRect();
    origin = {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    };
  }

  try {
    confetti({
      particleCount: 28,
      spread: 55,
      startVelocity: 22,
      gravity: 0.9,
      scalar: 0.75,
      ticks: 90,
      origin,
      colors: ['#FF2E93', '#2A52BE', '#5B82E8', '#818CF8', '#F5F5F7'],
      disableForReducedMotion: true,
    });
  } catch {
    // Ignore confetti errors in headless/restricted environments
  }
}
