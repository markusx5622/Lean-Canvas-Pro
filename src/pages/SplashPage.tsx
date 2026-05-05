import React from 'react';
import { motion } from 'motion/react';
import { Rocket, Sparkles, CheckCircle2, BarChart2, ShieldCheck, Code } from 'lucide-react';
import { ParticleBackground } from '../ParticleBackground';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SplashPageProps {
  theme: 'light' | 'dark';
  onEnter: () => void;
  prefersReducedMotion: boolean | null | undefined;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SplashPage({ theme, onEnter, prefersReducedMotion }: SplashPageProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[500] flex flex-col pt-16 md:pt-24 items-center bg-[#F4F5F8] dark:bg-slate-950 overflow-y-auto overflow-x-hidden overscroll-contain hide-scrollbar"
    >
      <ParticleBackground theme={theme} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px]" />
        <div className="absolute top-[30%] -right-[15%] w-[40%] h-[60%] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-[0%] left-[20%] w-[60%] h-[40%] rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="max-w-5xl w-full px-6 flex flex-col items-center relative z-10 pb-20">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7, type: 'spring', bounce: 0.4 }}
          whileHover={{ scale: 1.12, rotate: 10 }}
          className="relative mb-8 cursor-pointer"
        >
          <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 dark:opacity-30 rounded-[28px]" />
          <div className="relative bg-white dark:bg-slate-800/80 backdrop-blur-xl p-5 rounded-[28px] shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center">
            <motion.div
              animate={prefersReducedMotion ? {} : { y: [0, -7, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            >
              <Rocket size={44} className="text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
            </motion.div>
          </div>
        </motion.div>

        {/* Hero text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center w-full"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold text-xs tracking-wide uppercase mb-6 border border-indigo-100 dark:border-indigo-500/20">
            <Sparkles size={14} /> Nueva Generación de Lean Canvas
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
            Lean Canvas{' '}
            <motion.span
              className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 inline-block"
              initial={{ opacity: 0, scale: 0.5, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6, type: 'spring', bounce: 0.6 }}
              whileHover={{ scale: 1.1 }}
            >Pro</motion.span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed mb-12">
            La suite definitiva para startups en etapas tempranas. Modela tu negocio, pivota rápido y{' '}
            <strong className="text-slate-900 dark:text-white">audita tu modelo con un motor heurístico local</strong>{' '}
            mediante nuestra exclusiva &ldquo;Auditoría Estratégica&rdquo;.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <div className="relative w-full sm:w-auto">
              <motion.div
                className="absolute inset-0 rounded-2xl bg-indigo-500"
                animate={prefersReducedMotion ? {} : { scale: [1, 1.12, 1], opacity: [0.35, 0, 0.35] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                style={{ pointerEvents: 'none' }}
              />
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5, type: 'spring' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={onEnter}
                className="group relative flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors shadow-[0_10px_30px_-5px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_40px_-5px_rgba(79,70,229,0.5)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                <span className="relative">Entrar al Espacio de Trabajo</span>
                <svg className="relative w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.button>
            </div>
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="https://github.com/markusx5622/Lean-Canvas-Pro"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md"
            >
              <Code size={20} className="text-slate-400 dark:text-slate-500" />
              <span>Ver Repositorio</span>
            </motion.a>
          </div>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
        >
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 p-8 rounded-3xl relative overflow-hidden group shadow-sm hover:shadow-xl dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-shadow duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 dark:to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20">
              <CheckCircle2 size={24} strokeWidth={2.5} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-[17px] mb-3 relative z-10">9 Bloques Estratégicos</h3>
            <p className="text-slate-600 dark:text-slate-400 text-[14px] leading-relaxed font-medium relative z-10">
              Estructura completa para desglosar tu modelo de negocio de manera visual e iterativa en una sola pantalla interactiva.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 p-8 rounded-3xl relative overflow-hidden group shadow-sm hover:shadow-xl dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-shadow duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/5 dark:to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20">
              <BarChart2 size={24} strokeWidth={2.5} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-[17px] mb-3 relative z-10">Auditoría Estratégica Local</h3>
            <p className="text-slate-600 dark:text-slate-400 text-[14px] leading-relaxed font-medium relative z-10">
              Motor heurístico 100% local que analiza tu canvas al instante: puntuación, fortalezas, inconsistencias entre bloques y prioridades de mejora. Sin APIs externas.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 p-8 rounded-3xl relative overflow-hidden group shadow-sm hover:shadow-xl dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-shadow duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 dark:to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20">
              <ShieldCheck size={24} strokeWidth={2.5} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-[17px] mb-3 relative z-10">Persistencia Cloud Segura</h3>
            <p className="text-slate-600 dark:text-slate-400 text-[14px] leading-relaxed font-medium relative z-10">
              Los lienzos se sincronizan con tu cuenta en la nube. Accede a tus datos desde cualquier dispositivo, sin perder nada si cambias de navegador.
            </p>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-20 pt-8 border-t border-slate-200/60 dark:border-slate-800 w-full flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 dark:text-slate-500 text-[13px] font-medium"
        >
          <div className="flex items-center gap-1.5">
            <Rocket size={14} className="text-slate-400 dark:text-slate-600" />
            <span>Lean Canvas Pro © {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/markusx5622/Lean-Canvas-Pro" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">GitHub</a>
            <a href="https://www.linkedin.com/in/marc-cubero-cantavella-bb04542a7" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">LinkedIn</a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
