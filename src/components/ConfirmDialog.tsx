import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    cancelButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-desc"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => !loading && onCancel()}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs dark:bg-black/75"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#26262C] dark:bg-[#111114]"
          >
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              aria-label="Close confirmation dialog"
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] disabled:opacity-50 dark:text-[#A1A1AA] dark:hover:bg-[#18181C] dark:hover:text-[#F5F5F7]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="flex items-start gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  variant === 'danger'
                    ? 'bg-[#FF2E93]/12 text-[#D91B77] dark:text-[#FF62AF]'
                    : 'bg-[#2A52BE]/15 text-[#2A52BE] dark:text-[#5B82E8]'
                }`}
              >
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1 pr-6">
                <h2
                  id="confirm-dialog-title"
                  className="text-base font-semibold text-slate-900 dark:text-[#F5F5F7]"
                >
                  {title}
                </h2>
                <p
                  id="confirm-dialog-desc"
                  className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-[#A1A1AA]"
                >
                  {description}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A52BE] disabled:opacity-50 dark:border-[#26262C] dark:bg-[#18181C] dark:text-[#A1A1AA] dark:hover:text-[#F5F5F7]"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 dark:focus-visible:ring-offset-[#111114] ${
                  variant === 'danger'
                    ? 'bg-[#FF2E93] hover:bg-[#E02480] focus-visible:ring-[#FF2E93]'
                    : 'bg-[#2A52BE] hover:bg-[#345FD1] focus-visible:ring-[#2A52BE]'
                }`}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                <span>{confirmLabel}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
