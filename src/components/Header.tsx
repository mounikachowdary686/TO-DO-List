import { Check, LogOut, Moon, Sun } from 'lucide-react';
import type { Theme } from '../hooks/useTheme';

interface HeaderProps {
  userEmail: string;
  theme: Theme;
  onToggleTheme: () => void;
  onSignOut: () => void;
}

export function Header({
  userEmail,
  theme,
  onToggleTheme,
  onSignOut,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-[#26262C] dark:bg-[#0A0A0B]/90">
      <div className="mx-auto flex h-16 w-full max-w-[720px] items-center justify-between gap-4 px-4 sm:px-6">
        {/* App Name */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2A52BE]">
            <Check className="h-4 w-4 stroke-[2.75] text-white" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-[#F5F5F7]">
            TaskFlow
          </span>
        </div>

        {/* Right: User email (optional on larger screens), Theme Toggle, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden max-w-[190px] truncate text-xs text-slate-500 sm:inline dark:text-[#A1A1AA]">
            {userEmail}
          </span>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] dark:border-[#26262C] dark:bg-[#111114] dark:text-[#A1A1AA] dark:hover:bg-[#18181C] dark:hover:text-[#F5F5F7]"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] whitespace-nowrap shrink-0 dark:border-[#26262C] dark:bg-[#111114] dark:text-[#A1A1AA] dark:hover:bg-[#18181C] dark:hover:text-[#F5F5F7]"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
