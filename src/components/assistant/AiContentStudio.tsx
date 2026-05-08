import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Copy, Check, Sparkles, AlertCircle, Info, ChevronRight, BarChart2, FileText, Lightbulb, Presentation } from 'lucide-react';
import type { CanvasContext } from '../../lib/assistantService';
import { CONTENT_ACTIONS, type AiContentType } from '../../lib/aiContentPrompts';
import { runStrategicChecks, generateReadinessReport, type StrategicCheck, type ReadinessStatus } from '../../lib/localStrategicTools';

interface AiContentStudioProps {
  canvasContext: CanvasContext;
  onBack: () => void;
  onGenerated?: (type: AiContentType) => void;
}

interface GenerationState {
  result: string | null;
  copied: boolean;
}

const INITIAL_STATE: GenerationState = {
  result: null,
  copied: false,
};

// ── Severity helpers ──────────────────────────────────────────────────────────

function severityIcon(severity: StrategicCheck['severity']) {
  if (severity === 'critical') return <AlertCircle size={14} className="text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" strokeWidth={2.4} />;
  if (severity === 'warning') return <AlertCircle size={14} className="text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" strokeWidth={2.4} />;
  return <Info size={14} className="text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" strokeWidth={2.4} />;
}

function severityBg(severity: StrategicCheck['severity']) {
  if (severity === 'critical') return 'border-rose-200 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-950/30';
  if (severity === 'warning') return 'border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30';
  return 'border-blue-200 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-950/30';
}

function severityLabel(severity: StrategicCheck['severity']) {
  if (severity === 'critical') return 'text-rose-700 dark:text-rose-300';
  if (severity === 'warning') return 'text-amber-700 dark:text-amber-300';
  return 'text-blue-700 dark:text-blue-300';
}

// ── Readiness helpers ─────────────────────────────────────────────────────────

function statusConfig(status: ReadinessStatus) {
  if (status === 'listo') return {
    label: 'Listo para presentar',
    emoji: '✅',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50',
    text: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  };
  if (status === 'refinamiento') return {
    label: 'Necesita refinamiento',
    emoji: '🔶',
    bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50',
    text: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  };
  return {
    label: 'En fase inicial',
    emoji: '🔴',
    bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50',
    text: 'text-rose-700 dark:text-rose-300',
    badge: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400',
  };
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 75 ? 'bg-emerald-500' : score >= 45 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">{label}</span>
        <span className={`text-[12px] font-extrabold tabular-nums ${score >= 75 ? 'text-emerald-600 dark:text-emerald-400' : score >= 45 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {score}/100
        </span>
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AiContentStudio({ canvasContext, onBack, onGenerated }: AiContentStudioProps) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'generation' | 'readiness'>('analysis');
  const [stateByType, setStateByType] = useState<Record<AiContentType, GenerationState>>({
    executiveSummary: INITIAL_STATE,
    elevatorPitch: INITIAL_STATE,
    landingPageText: INITIAL_STATE,
  });

  const checks = runStrategicChecks(canvasContext);
  const criticalCount = checks.filter((c) => c.severity === 'critical').length;
  const warningCount = checks.filter((c) => c.severity === 'warning').length;

  const readiness = generateReadinessReport(canvasContext);

  const generateContent = (type: AiContentType) => {
    const action = CONTENT_ACTIONS.find((a) => a.type === type);
    if (!action) return;
    const result = action.generate(canvasContext);
    setStateByType((prev) => ({
      ...prev,
      [type]: { result, copied: false },
    }));
    onGenerated?.(type);
  };

  const copyContent = async (type: AiContentType) => {
    const text = stateByType[type].result;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setStateByType((prev) => ({
        ...prev,
        [type]: { ...prev[type], copied: true },
      }));
      setTimeout(() => {
        setStateByType((prev) => ({
          ...prev,
          [type]: { ...prev[type], copied: false },
        }));
      }, 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — silent fail.
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 rounded-3xl border border-slate-200/70 dark:border-slate-700/70 bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl p-5 md:p-6 shadow-[0_8px_40px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
    >
      <div className="flex flex-col gap-4 md:gap-5">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-indigo-500 dark:text-indigo-400">
              Herramientas Estratégicas
            </p>
            <h2 className="font-display text-[22px] md:text-[26px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Análisis y contenido para <span className="text-indigo-600 dark:text-indigo-400">{canvasContext.name}</span>
            </h2>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              Lógica local basada en heurísticas · sin IA externa · sin cuotas · sin dependencias
            </p>
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-[13px] font-semibold self-start md:self-auto"
          >
            <ArrowLeft size={15} strokeWidth={2.5} />
            Volver al canvas
          </button>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="inline-flex items-center gap-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 p-1 self-start flex-wrap">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-bold transition-all ${
              activeTab === 'analysis'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart2 size={14} strokeWidth={2.4} />
            Análisis
            {criticalCount + warningCount > 0 && (
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${activeTab === 'analysis' ? 'bg-white/25 text-white' : 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400'}`}>
                {criticalCount + warningCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('generation')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-bold transition-all ${
              activeTab === 'generation'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText size={14} strokeWidth={2.4} />
            Generar contenido
          </button>
          <button
            onClick={() => setActiveTab('readiness')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-bold transition-all ${
              activeTab === 'readiness'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Presentation size={14} strokeWidth={2.4} />
            Preparar presentación
          </button>
        </div>

        {/* ── Analysis tab ────────────────────────────────────────────────── */}
        {activeTab === 'analysis' ? (
          <div className="flex flex-col gap-4">
            {/* Canvas readiness overview */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/70 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                  <BarChart2 size={18} className="text-indigo-500 dark:text-indigo-400" strokeWidth={2.4} />
                </div>
                <div>
                  <h3 className="font-display text-[16px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Estado del canvas
                  </h3>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400">
                    {canvasContext.filledCount} de {canvasContext.totalBlocks} bloques completados
                  </p>
                </div>
                {canvasContext.auditScore !== undefined && (
                  <span className={`ml-auto text-[13px] font-extrabold px-3 py-1 rounded-xl ${
                    canvasContext.auditScore >= 80 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                    canvasContext.auditScore >= 60 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                    'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                  }`}>
                    {canvasContext.auditScore}/100 · {canvasContext.auditVerdict}
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      canvasContext.filledCount === canvasContext.totalBlocks
                        ? 'bg-emerald-500'
                        : canvasContext.filledCount >= 6
                        ? 'bg-indigo-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.round((canvasContext.filledCount / canvasContext.totalBlocks) * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums w-8">
                  {Math.round((canvasContext.filledCount / canvasContext.totalBlocks) * 100)}%
                </span>
              </div>

              {/* Summary stats */}
              <div className="flex gap-3 flex-wrap">
                {criticalCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800/50">
                    <AlertCircle size={12} strokeWidth={2.4} />
                    {criticalCount} crítico{criticalCount > 1 ? 's' : ''}
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/50">
                    <AlertCircle size={12} strokeWidth={2.4} />
                    {warningCount} aviso{warningCount > 1 ? 's' : ''}
                  </span>
                )}
                {criticalCount === 0 && warningCount === 0 && (
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                    ✓ Sin problemas críticos
                  </span>
                )}
              </div>
            </div>

            {/* Strategic checks list */}
            {checks.length === 0 ? (
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/30 p-4 flex items-start gap-3">
                <span className="text-emerald-600 dark:text-emerald-400 text-xl">✓</span>
                <div>
                  <p className="font-bold text-[14px] text-emerald-700 dark:text-emerald-300">Canvas estratégicamente sólido</p>
                  <p className="text-[12px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                    No se detectaron problemas críticos ni avisos. Pasa a la pestaña «Generar contenido» para crear materiales.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {checks.map((check, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl border ${severityBg(check.severity)} p-3.5 flex items-start gap-3`}
                  >
                    {severityIcon(check.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-bold text-[13px] ${severityLabel(check.severity)}`}>
                          {check.title}
                        </p>
                        {check.blockTitle && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-400">
                            {check.blockTitle}
                          </span>
                        )}
                      </div>
                      <p className={`text-[12px] mt-0.5 leading-relaxed ${severityLabel(check.severity)} opacity-90`}>
                        {check.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Hint to generate content */}
            {canvasContext.filledCount >= 4 && (
              <button
                onClick={() => setActiveTab('generation')}
                className="inline-flex items-center gap-2 self-start text-[13px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                <Lightbulb size={15} strokeWidth={2.4} />
                Generar resumen, pitch o landing page
                <ChevronRight size={14} strokeWidth={2.4} />
              </button>
            )}
          </div>
        ) : activeTab === 'generation' ? (
          /* ── Generation tab ──────────────────────────────────────────────── */
          <div className="grid gap-4 lg:grid-cols-3">
            {CONTENT_ACTIONS.map((action) => {
              const item = stateByType[action.type];
              return (
                <article
                  key={action.type}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/70 p-4 flex flex-col gap-4"
                >
                  <div className="space-y-1.5">
                    <h3 className="font-display text-[16px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {action.title}
                    </h3>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {action.subtitle}
                    </p>
                  </div>

                  <button
                    onClick={() => generateContent(action.type)}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold transition-all"
                  >
                    <Sparkles size={14} strokeWidth={2.4} />
                    {item.result ? 'Regenerar' : 'Generar'}
                  </button>

                  {item.result && (
                    <>
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-3 text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap min-h-[170px]">
                        {item.result}
                      </div>
                      <button
                        onClick={() => copyContent(action.type)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/25 transition-all"
                      >
                        {item.copied ? (
                          <>
                            <Check size={13} strokeWidth={2.4} />
                            ¡Copiado!
                          </>
                        ) : (
                          <>
                            <Copy size={13} strokeWidth={2.4} />
                            {action.copyLabel}
                          </>
                        )}
                      </button>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          /* ── Readiness tab ───────────────────────────────────────────────── */
          (() => {
            const cfg = statusConfig(readiness.status);
            return (
              <div className="flex flex-col gap-4">
                {/* Status card */}
                <div className={`rounded-2xl border ${cfg.bg} p-4 flex flex-col gap-3`}>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white/60 dark:bg-slate-900/50 flex items-center justify-center text-xl">
                        {cfg.emoji}
                      </div>
                      <div>
                        <p className={`font-display text-[16px] font-extrabold tracking-tight ${cfg.text}`}>
                          {cfg.label}
                        </p>
                        <p className="text-[12px] text-slate-500 dark:text-slate-400">
                          Evaluación local · sin IA · resultados instantáneos
                        </p>
                      </div>
                    </div>
                    <span className={`text-[20px] font-extrabold tabular-nums px-3 py-1 rounded-xl ${cfg.badge}`}>
                      {readiness.overallScore}/100
                    </span>
                  </div>

                  {/* Score bars */}
                  <div className="flex flex-col gap-2.5 pt-1">
                    <ScoreBar label="Completitud" score={readiness.completenessScore} />
                    <ScoreBar label="Claridad estratégica" score={readiness.clarityScore} />
                  </div>
                </div>

                {/* Two-column layout for reasons + next steps */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Reasons */}
                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/70 p-4 flex flex-col gap-2">
                    <h3 className="font-display text-[14px] font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      <AlertCircle size={14} className="text-amber-500 dark:text-amber-400" strokeWidth={2.4} />
                      Estado actual
                    </h3>
                    <ul className="flex flex-col gap-1.5">
                      {readiness.reasons.map((r, i) => (
                        <li key={i} className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                          <span className="text-slate-400 dark:text-slate-500 mt-0.5 shrink-0">·</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Next steps */}
                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/70 p-4 flex flex-col gap-2">
                    <h3 className="font-display text-[14px] font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      <ChevronRight size={14} className="text-indigo-500 dark:text-indigo-400" strokeWidth={2.4} />
                      Siguientes pasos
                    </h3>
                    {readiness.nextSteps.length === 0 ? (
                      <p className="text-[12px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        ¡Sin pasos pendientes! El canvas está listo para presentar.
                      </p>
                    ) : (
                      <ol className="flex flex-col gap-1.5">
                        {readiness.nextSteps.map((s, i) => (
                          <li key={i} className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                            <span className="text-[10px] font-extrabold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-full px-1.5 py-0.5 shrink-0 mt-0.5 tabular-nums">
                              {i + 1}
                            </span>
                            {s}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>

                {/* Prioritised recommendations */}
                {readiness.recommendations.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <h3 className="font-display text-[14px] font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      <Lightbulb size={14} className="text-indigo-500 dark:text-indigo-400" strokeWidth={2.4} />
                      Recomendaciones priorizadas
                    </h3>
                    <div className="flex flex-col gap-2">
                      {readiness.recommendations.map((rec, i) => (
                        <div
                          key={i}
                          className={`rounded-2xl border p-3 flex items-start gap-3 ${
                            rec.priority === 'alta'
                              ? 'border-rose-200 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-950/30'
                              : rec.priority === 'media'
                              ? 'border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30'
                              : 'border-blue-200 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-950/30'
                          }`}
                        >
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 mt-0.5 uppercase tracking-wide ${
                            rec.priority === 'alta'
                              ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                              : rec.priority === 'media'
                              ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                              : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                          }`}>
                            {rec.priority}
                          </span>
                          <p className={`text-[12px] leading-relaxed ${
                            rec.priority === 'alta'
                              ? 'text-rose-700 dark:text-rose-300'
                              : rec.priority === 'media'
                              ? 'text-amber-700 dark:text-amber-300'
                              : 'text-blue-700 dark:text-blue-300'
                          }`}>
                            {rec.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA to generate content when ready */}
                {canvasContext.filledCount >= 4 && (
                  <button
                    onClick={() => setActiveTab('generation')}
                    className="inline-flex items-center gap-2 self-start text-[13px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    <Sparkles size={15} strokeWidth={2.4} />
                    Crear resumen ejecutivo, pitch o landing
                    <ChevronRight size={14} strokeWidth={2.4} />
                  </button>
                )}
              </div>
            );
          })()
        )}
      </div>
    </motion.section>
  );
}
