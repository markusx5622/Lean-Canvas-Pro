import React from 'react';
import { motion } from 'motion/react';
import {
  Rocket, Sparkles, CheckCircle2, BarChart2, ShieldCheck, Code,
  Users, Zap, Layers, Download, Share2, Clock, ArrowRight,
  FileText, MousePointerClick, Target, BookOpen,
} from 'lucide-react';
import { ParticleBackground } from '../ParticleBackground';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SplashPageProps {
  theme: 'light' | 'dark';
  onEnter: () => void;
  prefersReducedMotion: boolean | null | undefined;
}

// ── Reusable section wrapper with scroll-triggered animation ──────────────────

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ y: 32, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: React.ReactNode; subtitle?: string }) {
  return (
    <div className="text-center mb-12">
      <p className="text-xs font-extrabold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-3">{eyebrow}</p>
      <h2 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">{title}</h2>
      {subtitle && (
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-[15px] leading-relaxed font-medium">{subtitle}</p>
      )}
    </div>
  );
}

// ── Feature card ──────────────────────────────────────────────────────────────

function FeatureCard({
  icon, title, description, iconBg, iconText, gradient,
}: {
  icon: React.ReactNode; title: string; description: string;
  iconBg: string; iconText: string; gradient: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 p-8 rounded-3xl relative overflow-hidden group shadow-sm hover:shadow-xl dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-shadow duration-300"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className={`w-12 h-12 ${iconBg} ${iconText} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="font-bold text-slate-900 dark:text-white text-[17px] mb-3 relative z-10">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 text-[14px] leading-relaxed font-medium relative z-10">{description}</p>
    </motion.div>
  );
}

// ── Primary CTA button ────────────────────────────────────────────────────────

function PrimaryButton({ onClick, prefersReducedMotion, label = 'Empezar gratis', size = 'md' }: {
  onClick: () => void; prefersReducedMotion: boolean | null | undefined; label?: string; size?: 'md' | 'lg';
}) {
  const px = size === 'lg' ? 'px-10' : 'px-8';
  const py = size === 'lg' ? 'py-4 text-[16px]' : 'py-4';
  return (
    <div className="relative">
      <motion.div
        className="absolute inset-0 rounded-2xl bg-indigo-500"
        animate={prefersReducedMotion ? {} : { scale: [1, 1.12, 1], opacity: [0.35, 0, 0.35] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        style={{ pointerEvents: 'none' }}
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className={`group relative flex items-center justify-center gap-3 ${px} ${py} bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors shadow-[0_10px_30px_-5px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_40px_-5px_rgba(79,70,229,0.5)] overflow-hidden`}
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
        <span className="relative">{label}</span>
        <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
      </motion.button>
    </div>
  );
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

        {/* ── Logo ── */}
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

        {/* ── Hero text ── */}
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
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed mb-6">
            La suite definitiva para startups en etapas tempranas. Deja de perder ideas en hojas de cálculo —{' '}
            <strong className="text-slate-900 dark:text-white">modela tu negocio, detecta inconsistencias y pivota con claridad</strong>{' '}
            gracias a nuestra auditoría estratégica heurística.
          </p>

          {/* Audience tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {[
              { icon: <Rocket size={12} />, label: 'Founders en early-stage' },
              { icon: <Target size={12} />, label: 'Emprendedores que validan' },
              { icon: <BookOpen size={12} />, label: 'Estudiantes de negocio' },
              { icon: <Users size={12} />, label: 'Equipos de producto' },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[12px] font-semibold"
              >
                <span className="text-indigo-500 dark:text-indigo-400">{icon}</span>
                {label}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5, type: 'spring' }}
              className="w-full sm:w-auto"
            >
              <PrimaryButton onClick={onEnter} prefersReducedMotion={prefersReducedMotion} label="Empezar gratis" />
            </motion.div>
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

        {/* ── El problema ── */}
        <Section className="mb-24">
          <SectionHeading
            eyebrow="El problema"
            title={<>Modelar una startup debería ser<br className="hidden md:block" /> rápido, no frustrante</>}
            subtitle="Las hojas de cálculo son caóticas. Las herramientas de diseño son lentas. Los frameworks clásicos no están hechos para pivotar. Lean Canvas Pro resuelve todo eso en un solo lugar."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                emoji: '😵‍💫',
                problem: 'Sin estructura clara',
                solution: 'El Lean Canvas impone un formato probado: 9 bloques que cubren todos los ángulos de tu modelo de negocio sin que te pierdas.',
              },
              {
                emoji: '⚡',
                problem: 'Sin feedback inmediato',
                solution: 'La Auditoría Estratégica analiza tu lienzo al instante, detecta contradicciones entre bloques, puntúa tu modelo y sugiere mejoras concretas.',
              },
              {
                emoji: '☁️',
                problem: 'Sin persistencia real',
                solution: 'Tus lienzos se sincronizan en la nube y se cachean localmente. Cambia de dispositivo o de navegador sin perder nada.',
              },
            ].map(({ emoji, problem, solution }) => (
              <div
                key={problem}
                className="bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-7"
              >
                <div className="text-3xl mb-4">{emoji}</div>
                <h4 className="font-bold text-slate-900 dark:text-white text-[15px] mb-2">{problem}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-[13px] leading-relaxed font-medium">{solution}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Cómo funciona ── */}
        <Section className="mb-24">
          <SectionHeading
            eyebrow="Cómo funciona"
            title="De cero a modelo validado en 4 pasos"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { num: 1, icon: <FileText size={24} />, title: 'Crea tu lienzo', description: 'Nombra tu proyecto y gestiona múltiples lienzos para distintas ideas o iteraciones de pivot.' },
              { num: 2, icon: <MousePointerClick size={24} />, title: 'Rellena los bloques', description: 'Guías integradas y ejemplos reales de startups en cada bloque para no quedarte en blanco.' },
              { num: 3, icon: <BarChart2 size={24} />, title: 'Audita tu modelo', description: 'El motor heurístico analiza coherencia entre bloques, puntúa tu modelo y prioriza mejoras.' },
              { num: 4, icon: <Download size={24} />, title: 'Exporta y comparte', description: 'Genera un PDF profesional o comparte un enlace público con inversores o co-fundadores.' },
            ].map(({ num, icon, title, description }) => (
              <motion.div
                key={num}
                whileHover={{ y: -4 }}
                className="flex flex-col items-center text-center p-6 bg-white/70 dark:bg-slate-900/50 rounded-3xl border border-slate-200/60 dark:border-slate-800 group"
              >
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-4 text-sm font-extrabold shadow-md group-hover:scale-110 transition-transform duration-300">
                  {num}
                </div>
                <div className="mb-3 text-indigo-500 dark:text-indigo-400">{icon}</div>
                <h4 className="font-bold text-slate-900 dark:text-white text-[15px] mb-2">{title}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-[13px] leading-relaxed font-medium">{description}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ── Características ── */}
        <Section className="mb-24">
          <SectionHeading
            eyebrow="Características"
            title="Todo lo que necesitas para validar tu idea"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <CheckCircle2 size={24} strokeWidth={2.5} />,
                title: '9 Bloques Estratégicos',
                description: 'Problema, Solución, Propuesta Única, Segmentos, Canales, Métricas, Flujo de Ingresos, Costes y Ventaja Injusta — todo cubierto en una sola pantalla.',
                iconBg: 'bg-indigo-50 dark:bg-indigo-500/10',
                iconText: 'text-indigo-600 dark:text-indigo-400',
                gradient: 'from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 dark:to-indigo-500/10',
              },
              {
                icon: <BarChart2 size={24} strokeWidth={2.5} />,
                title: 'Auditoría Estratégica Local',
                description: 'Motor heurístico 100% local: puntuación, fortalezas, inconsistencias entre bloques y prioridades de mejora. Sin APIs externas ni latencia.',
                iconBg: 'bg-blue-50 dark:bg-blue-500/10',
                iconText: 'text-blue-600 dark:text-blue-400',
                gradient: 'from-blue-500/0 via-blue-500/0 to-blue-500/5 dark:to-blue-500/10',
              },
              {
                icon: <ShieldCheck size={24} strokeWidth={2.5} />,
                title: 'Persistencia Cloud Segura',
                description: 'Lienzos sincronizados en la nube con caché local como respaldo. Accede desde cualquier dispositivo sin perder datos entre sesiones.',
                iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
                iconText: 'text-emerald-600 dark:text-emerald-400',
                gradient: 'from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 dark:to-emerald-500/10',
              },
              {
                icon: <Layers size={24} strokeWidth={2.5} />,
                title: 'Múltiples Lienzos',
                description: 'Gestiona varios proyectos o versiones de pivot desde un mismo espacio de trabajo. Renombra o elimina lienzos en cualquier momento.',
                iconBg: 'bg-violet-50 dark:bg-violet-500/10',
                iconText: 'text-violet-600 dark:text-violet-400',
                gradient: 'from-violet-500/0 via-violet-500/0 to-violet-500/5 dark:to-violet-500/10',
              },
              {
                icon: <Download size={24} strokeWidth={2.5} />,
                title: 'Exportación a PDF',
                description: 'Genera un PDF profesional de tu lienzo en un clic. Ideal para presentaciones, decks de inversores o documentación interna.',
                iconBg: 'bg-rose-50 dark:bg-rose-500/10',
                iconText: 'text-rose-600 dark:text-rose-400',
                gradient: 'from-rose-500/0 via-rose-500/0 to-rose-500/5 dark:to-rose-500/10',
              },
              {
                icon: <Share2 size={24} strokeWidth={2.5} />,
                title: 'Compartir con enlace',
                description: 'Genera un enlace público de solo lectura de tu canvas para compartir el estado de tu modelo con mentores, inversores o el equipo.',
                iconBg: 'bg-teal-50 dark:bg-teal-500/10',
                iconText: 'text-teal-600 dark:text-teal-400',
                gradient: 'from-teal-500/0 via-teal-500/0 to-teal-500/5 dark:to-teal-500/10',
              },
            ].map((card) => (
              <FeatureCard key={card.title} {...card} />
            ))}
          </div>
        </Section>

        {/* ── Por qué es diferente ── */}
        <Section className="mb-24">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="relative">
              <p className="text-xs font-extrabold uppercase tracking-widest text-indigo-200 mb-3">Por qué es diferente</p>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-6">
                No es solo un canvas, es un sistema de pensamiento
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: <Zap size={16} />, text: 'Auditoría heurística local — sin depender de IA externa ni APIs de pago' },
                  { icon: <Clock size={16} />, text: 'Historial de snapshots automáticos — recupera versiones anteriores de tu modelo' },
                  { icon: <BookOpen size={16} />, text: 'Guías y ejemplos reales de startups integrados en cada bloque' },
                  { icon: <Target size={16} />, text: 'Diseñado para pivotar: crea o renombra lienzos en segundos' },
                  { icon: <Share2 size={16} />, text: 'Enlace público de solo lectura para compartir con tu equipo o inversores' },
                  { icon: <Code size={16} />, text: '100% Open Source — revisa el código, contribuye o adáptalo libremente' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <span className="shrink-0 mt-0.5 text-indigo-200">{icon}</span>
                    <span className="text-[14px] text-white/90 font-medium leading-relaxed">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── Bottom CTA ── */}
        <Section className="mb-16 flex flex-col items-center text-center">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Tu modelo de negocio empieza aquí
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-[15px] leading-relaxed font-medium mb-8">
            Gratis, sin tarjeta de crédito. Empieza en menos de un minuto y construye un modelo sólido desde el primer día.
          </p>
          <PrimaryButton onClick={onEnter} prefersReducedMotion={prefersReducedMotion} label="Empezar gratis" size="lg" />
        </Section>

        {/* ── Footer ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-4 pt-8 border-t border-slate-200/60 dark:border-slate-800 w-full flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 dark:text-slate-500 text-[13px] font-medium"
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
