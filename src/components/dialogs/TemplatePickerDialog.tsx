import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutTemplate, X, ArrowRight, Sparkles } from 'lucide-react';
import { TEMPLATES, type CanvasTemplate } from '../../data/templates';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TemplatePickerDialogProps {
  onSelectTemplate: (template: CanvasTemplate) => void;
  onSelectBlank: () => void;
  onCancel: () => void;
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface TemplateCardProps {
  template: CanvasTemplate;
  isSelected: boolean;
  onClick: () => void;
}

function TemplateCard({ template, isSelected, onClick }: TemplateCardProps) {
  const filledBlocks = Object.keys(template.data).length;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left w-full rounded-2xl p-4 border-2 transition-all duration-200 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        isSelected
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-md shadow-indigo-100 dark:shadow-indigo-500/5'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
    >
      {isSelected && (
        <span
          aria-hidden="true"
          className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center"
        >
          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="text-2xl leading-none mt-0.5 shrink-0"
        >
          {template.emoji}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-extrabold text-[14px] text-slate-900 dark:text-white tracking-tight">
              {template.name}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
              {template.category}
            </span>
          </div>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1 line-clamp-2">
            {template.description}
          </p>
          <p className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 mt-2">
            {filledBlocks} / 9 bloques pre-rellenados
          </p>
        </div>
      </div>
    </button>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TemplatePickerDialog({
  onSelectTemplate,
  onSelectBlank,
  onCancel,
}: TemplatePickerDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedId === null) {
      onSelectBlank();
      return;
    }
    const tpl = TEMPLATES.find((t) => t.id === selectedId);
    if (tpl) onSelectTemplate(tpl);
  };

  const selectedTemplate = selectedId ? TEMPLATES.find((t) => t.id === selectedId) : null;

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
          role="dialog"
          aria-modal="true"
          aria-labelledby="template-picker-title"
          className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 shrink-0">
                <LayoutTemplate size={18} className="text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
              </div>
              <div>
                <h3 id="template-picker-title" className="font-display text-[17px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                  Nuevo lienzo
                </h3>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Elige un template o empieza desde cero
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              aria-label="Cerrar"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-6 py-5">
            {/* Blank option */}
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className={`relative text-left w-full rounded-2xl p-4 border-2 transition-all duration-200 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 mb-4 ${
                selectedId === null
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-md shadow-indigo-100 dark:shadow-indigo-500/5'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {selectedId === null && (
                <span
                  aria-hidden="true"
                  className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center"
                >
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="text-2xl leading-none shrink-0">✨</span>
                <div>
                  <span className="font-display font-extrabold text-[14px] text-slate-900 dark:text-white tracking-tight">
                    Lienzo en blanco
                  </span>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Empieza desde cero con todos los bloques vacíos.
                  </p>
                </div>
              </div>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Sparkles size={11} strokeWidth={2.5} />
                Templates
              </span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Template grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEMPLATES.map((tpl) => (
                <TemplateCard
                  key={tpl.id}
                  template={tpl}
                  isSelected={selectedId === tpl.id}
                  onClick={() => setSelectedId(tpl.id)}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2.5 px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl font-bold text-[14px] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-[2] py-3 rounded-xl font-bold text-[14px] bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_4px_14px_-4px_rgba(79,70,229,0.4)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {selectedTemplate ? `Usar plantilla "${selectedTemplate.name}"` : 'Crear en blanco'}
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
