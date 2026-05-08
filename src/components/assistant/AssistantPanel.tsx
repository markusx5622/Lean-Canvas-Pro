import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, RefreshCw } from 'lucide-react';
import type { CanvasContext } from '../../lib/assistantService';
import { runStrategicChecks } from '../../lib/localStrategicTools';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AssistantPanelProps {
  canvasContext: CanvasContext;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AssistantPanel({ canvasContext, onClose }: AssistantPanelProps) {
  const [showAll, setShowAll] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const checks = runStrategicChecks(canvasContext);
  const displayed = showAll ? checks : checks.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-end p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 32 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-panel-title"
        className="bg-slate-900 dark:bg-slate-950 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-700/60 dark:border-slate-800 flex flex-col h-[85vh] max-h-[700px]"
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-slate-700/60 dark:border-slate-800 bg-slate-900 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-500/15 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles size={19} className="text-indigo-400" strokeWidth={2.5} />
            </div>
            <div>
              <h3
                id="assistant-panel-title"
                className="font-display text-[15px] font-extrabold text-white tracking-tight leading-tight"
              >
                Análisis estratégico
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate max-w-[220px]">
                {canvasContext.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {checks.length > 5 && (
              <button
                onClick={() => setShowAll((v) => !v)}
                aria-label={showAll ? 'Mostrar menos' : 'Ver todos los avisos'}
                title={showAll ? 'Mostrar menos' : 'Ver todos'}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all"
              >
                <RefreshCw size={15} strokeWidth={2.5} />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Cerrar panel"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all"
            >
              <X size={17} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          <AnimatePresence>
            {checks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full gap-4 text-center py-8"
              >
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                  <Sparkles size={28} className="text-emerald-400" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-slate-200 font-bold text-[15px]">Canvas estratégicamente sólido</p>
                  <p className="text-slate-500 text-[12px] mt-1.5 max-w-[260px]">
                    No se detectaron problemas críticos ni avisos en este canvas.
                  </p>
                </div>
              </motion.div>
            ) : (
              displayed.map((check, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: i * 0.04 }}
                  className={`rounded-2xl border px-4 py-3 flex flex-col gap-1 ${
                    check.severity === 'critical'
                      ? 'border-rose-700/40 bg-rose-950/40'
                      : check.severity === 'warning'
                      ? 'border-amber-700/40 bg-amber-950/40'
                      : 'border-blue-700/40 bg-blue-950/40'
                  }`}
                >
                  <p className={`font-bold text-[13px] ${
                    check.severity === 'critical' ? 'text-rose-300' :
                    check.severity === 'warning' ? 'text-amber-300' : 'text-blue-300'
                  }`}>
                    {check.severity === 'critical' ? '🔴' : check.severity === 'warning' ? '🟡' : '🔵'} {check.title}
                  </p>
                  <p className="text-slate-400 text-[12px] leading-relaxed">{check.description}</p>
                  {check.blockTitle && (
                    <p className="text-[11px] text-slate-500 mt-0.5">Bloque: {check.blockTitle}</p>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {checks.length > 5 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="text-[12px] text-slate-400 hover:text-slate-300 font-medium text-center py-2"
            >
              Ver {checks.length - 5} aviso{checks.length - 5 > 1 ? 's' : ''} más…
            </button>
          )}
        </div>

        {/* Footer note */}
        <div className="px-4 pb-4 pt-3 shrink-0 border-t border-slate-700/60 dark:border-slate-800 bg-slate-900 dark:bg-slate-950">
          <p className="text-[10px] text-slate-600 text-center">
            Análisis heurístico local · sin IA externa · resultados instantáneos
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

