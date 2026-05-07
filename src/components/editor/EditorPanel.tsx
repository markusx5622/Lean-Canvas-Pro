import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, MessageSquare, Rocket, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, MousePointerClick } from 'lucide-react';
import type { BlockDefinition } from '../../data/blocks';
import type { BlockFeedback } from '../../evaluator/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface EditorPanelProps {
  selectedBlock: BlockDefinition | undefined;
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

export function EditorPanel({
  selectedBlock,
  editorText,
  onChangeText,
  activeTab,
  onChangeTab,
  saveStatus,
  blockAuditResult,
  onAuditBlock,
  onClose,
}: EditorPanelProps) {
  return (
    <div className="lg:w-[440px] shrink-0 sticky top-5 h-[calc(100vh-40px)] hidden md:block overflow-hidden relative rounded-[28px]">
      <AnimatePresence mode="wait">
        {selectedBlock ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0, x: 40, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="bg-white dark:bg-slate-800 border rounded-[28px] border-slate-200/80 dark:border-slate-700 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-7 flex flex-col h-full w-full relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${selectedBlock.color}`} />

            {/* Close / back to overview button */}
            <button
              onClick={onClose}
              aria-label="Volver a la vista general"
              className="absolute top-4 right-4 z-20 flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-600 px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
            >
              <ArrowLeft size={12} strokeWidth={2.5} /> Vista general
            </button>

            {/* Block header */}
            <div className="flex items-start gap-4 mb-6 shrink-0 pt-2">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${selectedBlock.color} ${selectedBlock.iconColor} shadow-inner border border-stone-50 dark:border-slate-700 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white dark:bg-slate-800 opacity-40 blur-md rounded-full scale-150" />
                <div className="relative z-10">{selectedBlock.icon}</div>
              </div>
              <div className="flex-1 pt-1">
                <div className="text-[10px] uppercase tracking-[2px] text-slate-400 font-extrabold mb-1">
                  BLOQUE 0{selectedBlock.order}
                </div>
                <h2 className="font-display text-[26px] font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                  {selectedBlock.title}
                </h2>
              </div>
            </div>

            {/* Guide / Examples tabs */}
            <div role="tablist" aria-label="Contenido del bloque" className="flex bg-slate-50 dark:bg-slate-700/80 p-1.5 rounded-xl mb-6 shrink-0 border border-slate-200/60 dark:border-slate-700 shadow-inner dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
              <button
                role="tab"
                aria-selected={activeTab === 'guide'}
                onClick={() => onChangeTab('guide')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-bold rounded-lg transition-all duration-300 ${activeTab === 'guide' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <BookOpen size={16} strokeWidth={2.5} aria-hidden="true" /> Guía
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'examples'}
                onClick={() => onChangeTab('examples')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-bold rounded-lg transition-all duration-300 ${activeTab === 'examples' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <MessageSquare size={16} strokeWidth={2.5} aria-hidden="true" /> Ejemplos
              </button>
            </div>

            {/* Tab content */}
            <div className="mb-6 overflow-y-auto shrink-0 max-h-[170px] custom-scrollbar overscroll-contain pr-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="text-[13px]"
                >
                  {activeTab === 'guide' && (
                    <>
                      <p className="text-slate-600 dark:text-slate-300 mb-5 font-medium leading-relaxed">{selectedBlock.details}</p>
                      <h4 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Preguntas clave</h4>
                      <ul className="flex flex-col gap-2.5">
                        {selectedBlock.questions.map((q, idx) => (
                          <li key={idx} className="text-slate-700 dark:text-slate-300 flex items-start gap-2.5 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-slate-300 dark:bg-slate-600" /> {q}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {activeTab === 'examples' && (
                    <div className="flex flex-col gap-3">
                      {selectedBlock.examples.map((ex, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-700/80 border border-slate-200/70 dark:border-slate-700 rounded-xl p-4 shadow-sm dark:shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
                          <div className="font-extrabold text-slate-900 dark:text-white text-[11px] mb-2 flex items-center gap-1.5 tracking-wider uppercase">
                            <Rocket size={14} className="text-slate-400 dark:text-slate-500" /> CASO DE ÉXITO: {ex.company}
                          </div>
                          <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap font-medium">{ex.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Text editor */}
            <div className="flex flex-col flex-1 relative border-t border-slate-100 dark:border-slate-700 pt-6 mt-auto">
              <div className="flex justify-between items-center mb-3 shrink-0">
                <label htmlFor="editorCanvas" className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                  Tus notas estratégicas
                </label>
                <div className="h-5 flex items-center justify-end gap-3">
                  <button
                    onClick={onAuditBlock}
                    disabled={!editorText.trim()}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    <ShieldCheck size={12} />
                    Auditar bloque
                  </button>
                  {saveStatus === 'saving' && <span className="text-[10px] font-bold text-slate-400 animate-pulse uppercase tracking-wider">Guardando...</span>}
                  {saveStatus === 'saved' && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-700">
                      <CheckCircle2 size={12} strokeWidth={2.5} /> Guardado
                    </span>
                  )}
                  {saveStatus === 'error' && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2.5 py-0.5 rounded-full border border-rose-100 dark:border-rose-700">
                      <AlertCircle size={12} strokeWidth={2.5} /> Error al guardar
                    </span>
                  )}
                </div>
              </div>

              <textarea
                id="editorCanvas"
                className={`flex-1 w-full p-4 bg-slate-50/80 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-[14px] font-medium text-slate-800 dark:text-slate-200 leading-relaxed focus:bg-white focus:dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:dark:ring-offset-slate-900 ${selectedBlock.ringColor} focus:border-transparent transition-all resize-none placeholder-slate-400 dark:placeholder-slate-500 shadow-inner dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]`}
                placeholder={'Escribe tus ideas aquí...\nHaz clic en \'Auditar bloque\' para recibir análisis al instante.'}
                value={editorText}
                onChange={(e) => onChangeText(e.target.value)}
              />

              {/* Inline block audit result */}
              <AnimatePresence>
                {blockAuditResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: 10, height: 0 }}
                    className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-[11px] uppercase tracking-wider">
                        <ShieldCheck size={13} /> Análisis del bloque
                      </div>
                      <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${blockAuditResult.score >= 70 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : blockAuditResult.score >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'}`}>
                        Score: {blockAuditResult.score}
                      </span>
                    </div>
                    {blockAuditResult.strengths.length > 0 && (
                      <div className="mb-2 flex flex-col gap-1.5">
                        {blockAuditResult.strengths.map((s, i) => (
                          <div key={i} className="flex items-start gap-2 text-[12px] text-emerald-700 dark:text-emerald-300 font-medium">
                            <CheckCircle2 size={12} className="shrink-0 mt-0.5 text-emerald-500" strokeWidth={2.5} />
                            <span>{s.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {blockAuditResult.issues.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        {blockAuditResult.issues.slice(0, 3).map((issue, i) => (
                          <div key={i} className="flex items-start gap-2 text-[12px] font-medium">
                            <AlertCircle size={12} className={`shrink-0 mt-0.5 ${issue.severity === 'critical' ? 'text-rose-500' : issue.severity === 'warning' ? 'text-amber-500' : 'text-slate-400'}`} strokeWidth={2.5} />
                            <span className="text-slate-700 dark:text-slate-300">{issue.message}{issue.hint ? ` — ${issue.hint}` : ''}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="bg-white/60 dark:bg-slate-800/60 border rounded-[28px] border-slate-200/60 dark:border-slate-700/60 border-dashed flex flex-col items-center justify-center h-full w-full relative overflow-hidden"
          >
            <div className="flex flex-col items-center gap-4 px-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700/80 flex items-center justify-center">
                <MousePointerClick size={26} className="text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-display text-[15px] font-extrabold text-slate-500 dark:text-slate-400 tracking-tight mb-1.5">
                  Selecciona un bloque
                </p>
                <p className="text-[13px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed max-w-[200px]">
                  Haz clic en cualquier bloque del lienzo para empezar a editar y auditar.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
