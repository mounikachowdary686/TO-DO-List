import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import type { ToastMessage } from '../types/todo';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function Toast({ toasts, onDismiss }: ToastProps) {
  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isSuccess = toast.type === 'success';

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              role={isError ? 'alert' : 'status'}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg dark:border-[#26262C] dark:bg-[#18181C] dark:shadow-black/50"
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess && (
                  <CheckCircle2
                    className="h-5 w-5 text-[#2A52BE] dark:text-[#5B82E8]"
                    aria-hidden="true"
                  />
                )}
                {isError && (
                  <AlertCircle
                    className="h-5 w-5 text-[#D91B77] dark:text-[#FF2E93]"
                    aria-hidden="true"
                  />
                )}
                {!isSuccess && !isError && (
                  <Info
                    className="h-5 w-5 text-[#2A52BE] dark:text-[#5B82E8]"
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-[#F5F5F7]">
                  {toast.title}
                </p>
                {toast.description && (
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-[#A1A1AA]">
                    {toast.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss notification"
                className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] dark:text-[#A1A1AA] dark:hover:bg-[#26262C] dark:hover:text-[#F5F5F7]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
