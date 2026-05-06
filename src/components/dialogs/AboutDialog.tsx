import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Github, Linkedin, Layers, ShieldCheck, Download, Sparkles, MousePointerClick, ArrowRight } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AboutDialogProps {
  onClose: () => void;
}

// ── Feature pill ──────────────────────────────────────────────────────────────

function FeaturePill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5 text-[12px] font-semibold text-slate-600 dark:text-slate-300">
      <span className="text-indigo-500 dark:text-indigo-400">{icon}</span>
      {label}
    </div>
  );
}

// ── Quick-start step ──────────────────────────────────────────────────────────

function Step({ num, text }: { num: number; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-[11px] font-extrabold flex items-center justify-center">
        {num}
      </span>
      <span className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">{text}</span>
    </li>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AboutDialog({ onClose }: AboutDialogProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          role="dialog" aria-modal="true" aria-labelledby="about-dialog-title"
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 w-full max-w-[820px] max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800 relative"
        >
          {/* ── Header banner ── */}
          <div className="relative bg-gradient-to-br from-indigo-600 to-violet-600 px-8 pt-10 pb-8 rounded-t-3xl overflow-hidden">
            <div aria-hidden="true" className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-indigo-200" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-200">Lean Canvas Pro</span>
              </div>
              <h2 id="about-dialog-title" className="font-display text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
                Tu herramienta de modelado<br className="hidden md:block" /> estratégico
              </h2>
              <p className="text-[13px] text-indigo-100 leading-relaxed max-w-lg">
                Construye lienzos de negocio, valida hipótesis con auditorías heurísticas locales y exporta tu modelo, sin depender de APIs externas.
              </p>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="px-8 py-7 flex flex-col gap-7">

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              <FeaturePill icon={<Layers size={13} />} label="9 bloques del Lean Canvas" />
              <FeaturePill icon={<ShieldCheck size={13} />} label="Auditoría heurística 100% local" />
              <FeaturePill icon={<Download size={13} />} label="Exportación rápida" />
              <FeaturePill icon={<MousePointerClick size={13} />} label="Múltiples lienzos" />
            </div>

            {/* Two-column layout */}
            <div className="flex flex-col md:flex-row gap-6">

              {/* Quick start */}
              <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/60 p-5">
                <h3 className="text-[12px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Cómo empezar</h3>
                <ol className="flex flex-col gap-3">
                  <Step num={1} text="Crea un nuevo lienzo desde el panel lateral o el botón +" />
                  <Step num={2} text="Haz clic en cualquier bloque del canvas para abrirlo y rellenarlo" />
                  <Step num={3} text="Usa la pestaña Guía dentro de cada bloque para ver preguntas clave y ejemplos reales" />
                  <Step num={4} text="Lanza la Auditoría desde la barra superior para obtener tu puntuación y recomendaciones" />
                  <Step num={5} text="Exporta o comparte el lienzo cuando estés listo" />
                </ol>
              </div>

              {/* Tips + author */}
              <div className="flex flex-col gap-4 md:w-[260px] shrink-0">
                {/* Pro tip */}
                <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/60 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={13} className="text-indigo-500" />
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">Consejo Pro</span>
                  </div>
                  <p className="text-[12px] text-indigo-700 dark:text-indigo-300 leading-relaxed">
                    Rellena primero <strong>Problema</strong> y <strong>Segmentos</strong>. Son la base de todo modelo sólido; el resto fluye desde ahí.
                  </p>
                </div>

                {/* Author */}
                <div className="rounded-2xl border border-slate-100 dark:border-slate-700/60 p-4 bg-white dark:bg-slate-800/40">
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-1">Desarrollado por</p>
                  <p className="text-[14px] font-bold text-slate-800 dark:text-white">Marc Cubero</p>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                    Universidad Europea de Valencia · Ecosistema emprendedor
                  </p>
                </div>

                {/* External links */}
                <div className="flex flex-col gap-2">
                  <a
                    href="https://github.com/markusx5622/Lean-Canvas-Pro"
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all group text-[13px] font-medium text-slate-700 dark:text-slate-300 shadow-sm"
                  >
                    <Github size={16} className="text-slate-800 dark:text-white group-hover:scale-110 transition-transform shrink-0" />
                    <span className="flex-1">Ver repositorio</span>
                    <ArrowRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/marc-cubero-cantavella-bb04542a7"
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all group text-[13px] font-medium text-slate-700 dark:text-slate-300 shadow-sm"
                  >
                    <Linkedin size={16} className="text-blue-600 group-hover:scale-110 transition-transform shrink-0" />
                    <span className="flex-1">Perfil de LinkedIn</span>
                    <ArrowRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer CTA ── */}
          <div className="px-8 pb-7">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-[14px] transition-colors shadow-sm"
            >
              Empezar a construir
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Cerrar"
            title="Cerrar"
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
