import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Code, Linkedin } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AboutDialogProps {
  onClose: () => void;
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
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 w-full max-w-[800px] rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800 relative flex flex-col md:flex-row gap-6 p-8 md:p-12 items-center"
        >
          <div className="flex-1">
            <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Sobre este proyecto</h2>

            <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-4">
              Lean Canvas Pro es una poderosa plataforma de modelado de negocio y validación temprana de ideas. Permite construir lienzos estratégicos, auditar hipótesis con un motor heurístico local y exportar la información del modelo rápidamente.
            </p>

            <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Desarrollado por <strong className="text-slate-900 dark:text-white">Marc Cubero</strong> en el ecosistema emprendedor y de innovación de la{' '}
              <strong className="text-slate-900 dark:text-white">Universidad Europea de Valencia</strong>. El enfoque es práctico y profesional: una herramienta pensada para acompañar a directivos, CEOs y founders desde su &quot;Early stage&quot; al éxito en España. Aporta verdadero valor al ecosistema con métricas y auditorías heurísticas 100% locales; todo ello respaldando la toma de decisiones con análisis estructurado, sin depender de APIs externas.
            </p>
          </div>

          <div className="w-full md:w-[280px] flex flex-col gap-3 shrink-0">
            <a
              href="https://github.com/markusx5622/Lean-Canvas-Pro"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-3.5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all group font-medium text-[13px] text-slate-700 dark:text-slate-300 shadow-sm"
            >
              <Code size={18} className="text-blue-500 group-hover:scale-110 transition-transform" />
              <span>Ver repositorio</span>
            </a>
            <a
              href="https://www.linkedin.com/in/marc-cubero-cantavella-bb04542a7"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-3.5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all group font-medium text-[13px] text-slate-700 dark:text-slate-300 shadow-sm"
            >
              <Linkedin size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
              <span>Perfil de LinkedIn</span>
            </a>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            title="Cerrar"
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
