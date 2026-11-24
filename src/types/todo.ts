export type Category = 'Work' | 'Personal' | 'Study' | 'Health' | 'Shopping' | 'Other';

export type Priority = 'Low' | 'Medium' | 'High';

export type StatusFilter = 'all' | 'active' | 'completed';

export type NavView = 'all' | 'today' | 'upcoming' | 'completed';

export type SortBy = 'created_at' | 'due_date' | 'priority';

export type SortOrder = 'asc' | 'desc';

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: Category;
  priority: Priority;
  due_date: string | null;
  is_completed: boolean;
  created_at: string;
}

export interface TodoInput {
  title: string;
  description: string | null;
  category: Category;
  priority: Priority;
  due_date: string | null;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  todayCount: number;
  upcomingCount: number;
  categoryCounts: Record<Category, number>;
}
