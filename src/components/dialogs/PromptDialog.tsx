import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit2 } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PromptDialogProps {
  title: string;
  label?: string;
  initialValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PromptDialog({
  title,
  label,
  initialValue = '',
  confirmLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: PromptDialogProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Slight delay (80 ms) so the entry animation starts before the keyboard is triggered
    const FOCUS_DELAY_MS = 80;
    const id = setTimeout(() => inputRef.current?.focus(), FOCUS_DELAY_MS);
    return () => clearTimeout(id);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onConfirm(value.trim());
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.95, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 16 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800 p-6 flex flex-col gap-5"
        >
          {/* Icon + title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-indigo-50 dark:bg-indigo-500/10">
              <Edit2 size={18} className="text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
            </div>
            <h3 className="font-display text-[17px] font-extrabold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h3>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {label && (
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {label}
              </label>
            )}
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[14px] font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <div className="flex flex-row-reverse gap-2.5">
              <button
                type="submit"
                disabled={!value.trim()}
                className="flex-1 py-3 rounded-xl font-bold text-[14px] bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_4px_14px_-4px_rgba(79,70,229,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {confirmLabel}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl font-bold text-[14px] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
              >
                {cancelLabel}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
