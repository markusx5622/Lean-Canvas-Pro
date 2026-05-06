import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, BookOpen, MessageSquare, Rocket, ShieldCheck, AlertCircle } from 'lucide-react';
import type { BlockDefinition } from '../../data/blocks';
import type { BlockFeedback } from '../../evaluator/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface MobileEditorProps {
  selectedBlock: BlockDefinition;
  editorText: string;
  onChangeText: (text: string) => void;
  activeTab: 'guide' | 'examples';
  onChangeTab: (tab: 'guide' | 'examples') => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  blockAuditResult: BlockFeedback | null;
  onAuditBlock: () => void;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MobileEditor({
  selectedBlock,
  editorText,
  onChangeText,
  activeTab,
  onChangeTab,
  saveStatus,
  blockAuditResult,
  onAuditBlock,
  onClose,
}: MobileEditorProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="md:hidden fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex flex-col justify-end cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      >
        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-white dark:bg-slate-800 rounded-t-[32px] h-[92vh] w-full flex flex-col shadow-2xl p-6 cursor-auto relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={`Editor: ${selectedBlock.title}`}
        >
          {/* Drag handle */}
          <div aria-hidden="true" className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />

          {/* Block header */}
          <div className="mt-5 flex items-center gap-4 mb-5 shrink-0">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${selectedBlock.color} ${selectedBlock.iconColor} shadow-inner border border-white dark:border-slate-700`}>
              {selectedBlock.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500 font-extrabold mb-0.5">
                BLOQUE 0{selectedBlock.order}
              </div>
              <h2 className="font-display text-[20px] font-extrabold text-slate-900 dark:text-white leading-none tracking-tight truncate">
                {selectedBlock.title}
              </h2>
            </div>
          </div>

          {/* Guide / Examples tabs */}
          <div role="tablist" aria-label="Contenido del bloque" className="flex bg-slate-50 dark:bg-slate-700/80 p-1.5 rounded-xl mb-4 shrink-0 border border-slate-200/60 dark:border-slate-700 shadow-inner dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
            <button
              role="tab"
              aria-selected={activeTab === 'guide'}
              onClick={() => onChangeTab('guide')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[13px] font-bold rounded-lg transition-all duration-200 ${activeTab === 'guide' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <BookOpen size={14} strokeWidth={2.5} aria-hidden="true" /> Guía
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'examples'}
              onClick={() => onChangeTab('examples')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[13px] font-bold rounded-lg transition-all duration-200 ${activeTab === 'examples' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <MessageSquare size={14} strokeWidth={2.5} aria-hidden="true" /> Ejemplos
            </button>
          </div>

          {/* Tab content — 22vh gives enough room for guide/examples without pushing the textarea off screen */}
          <div className="mb-4 overflow-y-auto shrink-0 max-h-[22vh] overscroll-contain pr-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="text-[13px]"
              >
                {activeTab === 'guide' && (
                  <>
                    <p className="text-slate-600 dark:text-slate-300 mb-4 font-medium leading-relaxed">{selectedBlock.details}</p>
                    <h4 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Preguntas clave</h4>
                    <ul className="flex flex-col gap-2">
                      {selectedBlock.questions.map((q, idx) => (
                        <li key={idx} className="text-slate-700 dark:text-slate-300 flex items-start gap-2 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-slate-300 dark:bg-slate-600" /> {q}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {activeTab === 'examples' && (
                  <div className="flex flex-col gap-3">
                    {selectedBlock.examples.map((ex, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-700/80 border border-slate-200/70 dark:border-slate-700 rounded-xl p-3 shadow-sm">
                        <div className="font-extrabold text-slate-900 dark:text-white text-[10px] mb-1.5 flex items-center gap-1.5 tracking-wider uppercase">
                          <Rocket size={12} className="text-slate-400 dark:text-slate-500" /> CASO DE ÉXITO: {ex.company}
                        </div>
                        <p className="text-[12.5px] text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap font-medium">{ex.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Textarea + save status header */}
          <div className="flex items-center justify-between mb-2 shrink-0">
            <label htmlFor="mobile-editor-textarea" className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
              Tus notas estratégicas
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={onAuditBlock}
                disabled={!editorText.trim()}
                className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-2 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <ShieldCheck size={11} /> Auditar
              </button>
              {saveStatus === 'saving' && <span className="text-[10px] font-bold text-slate-400 animate-pulse uppercase tracking-wider">Guardando...</span>}
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-700">
                  <CheckCircle2 size={11} strokeWidth={2.5} /> Guardado
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-full border border-rose-100 dark:border-rose-700">
                  <AlertCircle size={11} strokeWidth={2.5} /> Error
                </span>
              )}
            </div>
          </div>

          <textarea
            id="mobile-editor-textarea"
            className={`flex-1 w-full p-4 mb-3 bg-slate-50 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-[15px] font-medium text-slate-800 dark:text-slate-200 leading-relaxed focus:bg-white focus:dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:dark:ring-offset-slate-900 ${selectedBlock.ringColor} resize-none shadow-inner dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]`}
            placeholder="Escribe tus ideas..."
            value={editorText}
            onChange={(e) => onChangeText(e.target.value)}
          />

          {/* Inline block audit result */}
          <AnimatePresence>
            {blockAuditResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 p-3.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shrink-0"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-wider">
                    <ShieldCheck size={12} /> Análisis
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${blockAuditResult.score >= 70 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : blockAuditResult.score >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'}`}>
                    Score: {blockAuditResult.score}
                  </span>
                </div>
                {blockAuditResult.strengths.length > 0 && (
                  <div className="mb-1.5 flex flex-col gap-1">
                    {blockAuditResult.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11.5px] text-emerald-700 dark:text-emerald-300 font-medium">
                        <CheckCircle2 size={11} className="shrink-0 mt-0.5 text-emerald-500" strokeWidth={2.5} />
                        <span>{s.message}</span>
                      </div>
                    ))}
                  </div>
                )}
                {blockAuditResult.issues.length > 0 && (
                  <div className="flex flex-col gap-1">
                    {blockAuditResult.issues.slice(0, 3).map((issue, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11.5px] font-medium">
                        <AlertCircle size={11} className={`shrink-0 mt-0.5 ${issue.severity === 'critical' ? 'text-rose-500' : issue.severity === 'warning' ? 'text-amber-500' : 'text-slate-400'}`} strokeWidth={2.5} />
                        <span className="text-slate-700 dark:text-slate-300">{issue.message}{issue.hint ? ` — ${issue.hint}` : ''}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={onClose}
            className="w-full py-4 bg-slate-900 dark:bg-slate-700 text-white font-bold rounded-2xl active:scale-95 transition-all text-[15px] flex items-center justify-center gap-2 shadow-lg tracking-tight shrink-0"
          >
            <CheckCircle2 size={20} strokeWidth={2.5} /> Guardar y Cerrar
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
