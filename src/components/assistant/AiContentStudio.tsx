import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Copy, Check, Loader2, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { sendAssistantMessage } from '../../lib/assistantService';
import type { CanvasContext } from '../../lib/assistantService';
import { AI_CONTENT_ACTIONS, type AiContentType } from '../../lib/aiContentPrompts';

interface AiContentStudioProps {
  canvasContext: CanvasContext;
  onBack: () => void;
  onGenerated?: (type: AiContentType) => void;
}

interface GenerationState {
  loading: boolean;
  result: string | null;
  error: string | null;
  copied: boolean;
}

const INITIAL_STATE: GenerationState = {
  loading: false,
  result: null,
  error: null,
  copied: false,
};

export function AiContentStudio({ canvasContext, onBack, onGenerated }: AiContentStudioProps) {
  const [stateByType, setStateByType] = useState<Record<AiContentType, GenerationState>>({
    executiveSummary: INITIAL_STATE,
    elevatorPitch: INITIAL_STATE,
    landingPageText: INITIAL_STATE,
  });

  const generateContent = async (type: AiContentType, prompt: string) => {
    setStateByType((prev) => ({
      ...prev,
      [type]: { ...prev[type], loading: true, error: null },
    }));
    try {
      const reply = await sendAssistantMessage([{ role: 'user', content: prompt }], canvasContext);
      setStateByType((prev) => ({
        ...prev,
        [type]: { ...prev[type], loading: false, result: reply, error: null, copied: false },
      }));
      onGenerated?.(type);
    } catch (err) {
      setStateByType((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          loading: false,
          error: err instanceof Error ? err.message : 'Error desconocido al generar contenido.',
        },
      }));
    }
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-indigo-500 dark:text-indigo-400">
              AI Content Studio
            </p>
            <h2 className="font-display text-[22px] md:text-[26px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Convierte tu Lean Canvas en contenido listo para usar
            </h2>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              Genera piezas estratégicas con el contexto de <span className="font-bold text-slate-800 dark:text-slate-200">{canvasContext.name}</span>. Cada resultado se puede regenerar y copiar al instante.
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

        <div className="grid gap-4 lg:grid-cols-3">
          {AI_CONTENT_ACTIONS.map((action) => {
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
                  onClick={() => generateContent(action.type, action.prompt)}
                  disabled={item.loading}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {item.loading ? (
                    <>
                      <Loader2 size={14} strokeWidth={2.4} className="animate-spin" />
                      Generando…
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} strokeWidth={2.4} />
                      Generar
                    </>
                  )}
                </button>

                {item.error && (
                  <div className="flex items-start gap-2 rounded-xl border border-rose-200 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-950/30 px-3 py-2 text-[12px] text-rose-700 dark:text-rose-300">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" strokeWidth={2.2} />
                    <span>{item.error}</span>
                  </div>
                )}

                {item.result && (
                  <>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-3 text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap min-h-[170px]">
                      {item.result}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => generateContent(action.type, action.prompt)}
                        disabled={item.loading}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-60"
                      >
                        <RefreshCw size={13} strokeWidth={2.4} />
                        Regenerar
                      </button>
                      <button
                        onClick={() => copyContent(action.type)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/25 transition-all"
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
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

