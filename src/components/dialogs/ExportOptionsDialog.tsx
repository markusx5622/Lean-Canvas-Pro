import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileDown, User2, AlignLeft, Tag, Lock } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ExportOptions {
  preparedFor: string;
  subtitle: string;
  version: string;
  confidential: boolean;
}

interface ExportOptionsDialogProps {
  canvasName: string;
  onConfirm: (options: ExportOptions) => void;
  onCancel: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ExportOptionsDialog({ canvasName, onConfirm, onCancel }: ExportOptionsDialogProps) {
  const [preparedFor, setPreparedFor] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [version, setVersion] = useState('');
  const [confidential, setConfidential] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ preparedFor: preparedFor.trim(), subtitle: subtitle.trim(), version: version.trim(), confidential });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.96, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.96, y: 16 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-options-title"
          className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                <FileDown size={17} className="text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
              </div>
              <div>
                <h2 id="export-options-title" className="font-display text-[16px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Exportar PDF
                </h2>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 truncate max-w-[200px]">
                  {canvasName}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              aria-label="Cancelar"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 pb-6 flex flex-col gap-4">
            <p className="text-[12.5px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed -mt-1">
              Añade información opcional para personalizar el documento exportado.
            </p>

            {/* Prepared for */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="export-prepared-for" className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                <User2 size={11} strokeWidth={2.5} />
                Preparado para
              </label>
              <input
                id="export-prepared-for"
                type="text"
                value={preparedFor}
                onChange={(e) => setPreparedFor(e.target.value)}
                placeholder="Ej: Accel Partners, Cliente ABC…"
                maxLength={80}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] text-slate-800 dark:text-slate-200 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Subtitle */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="export-subtitle" className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                <AlignLeft size={11} strokeWidth={2.5} />
                Subtítulo del documento
              </label>
              <input
                id="export-subtitle"
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ej: Business Model Overview · Q2 2026"
                maxLength={100}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] text-slate-800 dark:text-slate-200 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Version / Stage */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="export-version" className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                <Tag size={11} strokeWidth={2.5} />
                Versión / Etapa
              </label>
              <input
                id="export-version"
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="Ej: Seed Round · v1.0 · Draft"
                maxLength={60}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] text-slate-800 dark:text-slate-200 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Confidential toggle */}
            <label
              htmlFor="export-confidential"
              className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Lock size={13} strokeWidth={2.5} className={confidential ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'} />
                <div>
                  <span className="block text-[13px] font-semibold text-slate-800 dark:text-slate-200">
                    Marcar como confidencial
                  </span>
                  <span className="block text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                    Añade un aviso de confidencialidad al pie del PDF
                  </span>
                </div>
              </div>
              <div className="relative shrink-0">
                <input
                  id="export-confidential"
                  type="checkbox"
                  checked={confidential}
                  onChange={(e) => setConfidential(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-9 h-5 rounded-full transition-colors ${confidential ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${confidential ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
            </label>

            {/* Actions */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_12px_-2px_rgba(79,70,229,0.4)] transition-all active:scale-95"
              >
                <FileDown size={14} strokeWidth={2.5} />
                Generar PDF
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
