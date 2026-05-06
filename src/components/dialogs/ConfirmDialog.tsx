import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Info } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 'danger' uses a red confirm button; 'default' uses indigo */
  variant?: 'danger' | 'default';
  /** If true, no cancel button is shown (acts as an alert/info dialog) */
  alertOnly?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  alertOnly = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const handleBackdrop = () => {
    if (alertOnly) onConfirm();
    else onCancel?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
        onClick={handleBackdrop}
      >
        <motion.div
          initial={{ scale: 0.95, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 16 }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800 p-6 flex flex-col gap-5"
        >
          {/* Icon + title */}
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${variant === 'danger' ? 'bg-rose-50 dark:bg-rose-500/10' : 'bg-indigo-50 dark:bg-indigo-500/10'}`}>
              {variant === 'danger'
                ? <AlertTriangle size={20} className="text-rose-600 dark:text-rose-400" strokeWidth={2.5} />
                : <Info size={20} className="text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />}
            </div>
            <div className="flex-1 pt-0.5">
              <h3 id="confirm-dialog-title" className="font-display text-[17px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                {title}
              </h3>
              <p className="text-[13.5px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed mt-1.5">
                {message}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className={`flex gap-2.5 ${alertOnly ? '' : 'flex-row-reverse'}`}>
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 rounded-xl font-bold text-[14px] transition-all active:scale-[0.98] ${
                variant === 'danger'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-[0_4px_14px_-4px_rgba(225,29,72,0.4)]'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_4px_14px_-4px_rgba(79,70,229,0.4)]'
              }`}
            >
              {confirmLabel}
            </button>
            {!alertOnly && (
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl font-bold text-[14px] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
              >
                {cancelLabel}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
