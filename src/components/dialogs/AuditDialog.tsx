import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import type { EvaluationResult } from '../../evaluator/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuditDialogProps {
  auditResult: EvaluationResult;
  onClose: () => void;
}

// ── Sub-score bar helper ──────────────────────────────────────────────────────

function SubScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
      <div className="flex justify-between mb-1.5">
        <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
        <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-200">{value}</span>
      </div>
      <div className="h-1 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AuditDialog({ auditResult, onClose }: AuditDialogProps) {
  const { summary, blocks } = auditResult;

  const scoreColorClass =
    summary.overallScore >= 80
      ? 'text-emerald-600'
      : summary.overallScore >= 60
        ? 'text-indigo-600'
        : summary.overallScore >= 40
          ? 'text-amber-500'
          : 'text-rose-500';

  const verdictColorClass =
    summary.overallScore >= 80
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
      : summary.overallScore >= 60
        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
        : summary.overallScore >= 40
          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
          : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700"
        >
          {/* Header */}
          <div className="bg-indigo-600 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-white font-extrabold text-lg flex items-center gap-2">
                  Auditoría Estratégica <Sparkles size={16} className="text-indigo-200" />
                </h3>
                <p className="text-indigo-100 text-[13px] font-medium">Motor heurístico local · Sin IA externa</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white p-2 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto overscroll-contain">

            {/* Score overview */}
            <div className="flex items-center gap-5 mb-5 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="text-center shrink-0">
                <div className={`text-5xl font-extrabold ${scoreColorClass}`}>{summary.overallScore}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">/ 100</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[11px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full ${verdictColorClass}`}>
                    {summary.verdict}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{summary.filledBlocks}/9 bloques</span>
                </div>
                <p className="text-[13px] text-slate-700 dark:text-slate-200 font-medium leading-snug">{summary.headline}</p>
              </div>
            </div>

            {/* Sub-score bars */}
            <div className="mb-5 grid grid-cols-2 gap-2.5">
              <SubScoreBar label="Completitud" value={summary.completenessScore} />
              <SubScoreBar label="Claridad" value={summary.clarityScore} />
              <SubScoreBar label="Concreción" value={summary.specificityScore} />
              <SubScoreBar label="Coherencia" value={summary.consistencyScore} />
              <SubScoreBar label="Preparación" value={summary.strategicReadinessScore} />
            </div>

            {/* Next priority */}
            <div className="mb-5 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/30 rounded-xl">
              <div className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1.5">🎯 Próxima acción prioritaria</div>
              <p className="text-[13px] text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{summary.nextPriority}</p>
            </div>

            {/* Strengths */}
            {summary.topStrengths.length > 0 && (
              <div className="mb-5">
                <h4 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">✅ Fortalezas</h4>
                <div className="flex flex-col gap-2">
                  {summary.topStrengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-[13px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-500/20 rounded-xl p-3">
                      <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-emerald-500" strokeWidth={2.5} />
                      <span className="font-medium leading-snug">{s.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top issues */}
            {summary.topIssues.length > 0 && (
              <div className="mb-5">
                <h4 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">⚠️ Hallazgos principales</h4>
                <div className="flex flex-col gap-2">
                  {summary.topIssues.map((issue, i) => (
                    <div key={i} className={`rounded-xl p-3 border text-[13px] ${issue.severity === 'critical' ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300' : issue.severity === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300' : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
                      <div className="flex items-start gap-2.5">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" strokeWidth={2.5} />
                        <div>
                          <p className="font-medium leading-snug">{issue.message}</p>
                          {issue.hint && <p className="mt-1 text-[12px] opacity-80 font-medium">{issue.hint}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cross-block issues */}
            {summary.crossBlockIssues.length > 0 && (
              <div className="mb-5">
                <h4 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">🔗 Inconsistencias entre bloques</h4>
                <div className="flex flex-col gap-2">
                  {summary.crossBlockIssues.map((issue, i) => (
                    <div key={i} className={`rounded-xl p-3 border text-[13px] ${issue.severity === 'critical' ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300'}`}>
                      <p className="font-medium leading-snug">{issue.message}</p>
                      {issue.hint && <p className="mt-1 text-[12px] opacity-80 font-medium">{issue.hint}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div className="mb-5 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20 rounded-xl">
              <div className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1.5">💡 Recomendación estratégica</div>
              <p className="text-[13px] text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{summary.recommendation}</p>
            </div>

            {/* Per-block results */}
            <div>
              <h4 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">📊 Resultados por bloque</h4>
              <div className="flex flex-col gap-1.5">
                {blocks.map((block) => (
                  <div key={block.blockId} className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200 flex-1 truncate">{block.blockName}</span>
                    {block.filled ? (
                      <>
                        <div className="w-24 h-1 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden shrink-0">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${block.score}%` }} />
                        </div>
                        <span className={`text-[11px] font-extrabold w-8 text-right shrink-0 ${block.score >= 70 ? 'text-emerald-600' : block.score >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>{block.score}</span>
                      </>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Vacío</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 px-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-[14px]"
            >
              Entendido
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
