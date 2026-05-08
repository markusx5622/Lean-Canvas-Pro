import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Copy, Check, RefreshCw } from 'lucide-react';
import type { CanvasContext } from '../../lib/assistantService';
import { generateExecutiveSummary } from '../../lib/localStrategicTools';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ExecutiveSummaryDialogProps {
  canvasContext: CanvasContext;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ExecutiveSummaryDialog({ canvasContext, onClose }: ExecutiveSummaryDialogProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    setSummary(generateExecutiveSummary(canvasContext));
  }, [canvasContext]);

  // Auto-generate when the dialog opens.
  useEffect(() => {
    generate();
  }, [generate]);

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — silent fail.
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exec-summary-title"
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200/60 dark:border-slate-700/60 flex flex-col max-h-[85vh]"
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-indigo-500 dark:text-indigo-400" strokeWidth={2} />
            </div>
            <div>
              <h3
                id="exec-summary-title"
                className="font-display text-[15px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight"
              >
                Resumen ejecutivo
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate max-w-[240px]">
                {canvasContext.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar resumen ejecutivo"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-all"
          >
            <X size={17} strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <AnimatePresence mode="wait">
            {summary && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4"
              >
                <p className="text-slate-700 dark:text-slate-200 text-[14px] leading-relaxed whitespace-pre-wrap">
                  {summary}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Generado localmente a partir del contenido del canvas · sin IA externa
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        {summary && (
          <div className="px-5 pb-5 pt-3 shrink-0 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3">
            <button
              onClick={generate}
              aria-label="Regenerar resumen"
              title="Regenerar"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-all"
            >
              <RefreshCw size={15} strokeWidth={2.5} />
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-[13px] tracking-tight active:scale-[0.97] shadow-sm shadow-indigo-600/20"
            >
              {copied ? (
                <>
                  <Check size={14} strokeWidth={2.5} />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy size={14} strokeWidth={2.5} />
                  Copiar resumen
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

