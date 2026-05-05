import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Rocket, EyeOff, Loader2 } from 'lucide-react';
import { getCanvasByShareToken, type SharedCanvasRow } from '../lib/shareService';
import { BLOCK_META } from '../data/blocks';

// ── Read-only block card ─────────────────────────────────────────────────────

function ReadOnlyBlock({
  blockId,
  index,
  value,
  additionalClasses = '',
}: {
  blockId: number;
  index: number;
  value: string;
  additionalClasses?: string;
}) {
  const meta = BLOCK_META[blockId];
  if (!meta) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex flex-col overflow-hidden rounded-[20px] bg-white dark:bg-slate-800 shadow-[0_4px_16px_rgb(0,0,0,0.02)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)] border border-slate-200/80 dark:border-slate-700 ${additionalClasses}`}
    >
      {/* Colored accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-[20px] ${meta.accentBar} opacity-60`} />
      <div className={`absolute top-0 left-0 w-48 h-48 bg-gradient-to-br ${meta.color} opacity-60 rounded-full blur-3xl -translate-x-12 -translate-y-12 pointer-events-none`} />
      <div className="p-5 relative flex flex-col h-full z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${meta.accentIconBg} shadow-sm border border-slate-100/50 dark:border-slate-700/50 ${meta.iconColor}`}>
            {meta.icon}
          </div>
        </div>
        <h3 className="font-display text-[16px] font-extrabold text-slate-900 dark:text-white tracking-tight mb-2.5">
          {meta.title}
        </h3>
        <div className="flex-1 overflow-hidden">
          {value.trim() ? (
            <p className="text-[13.5px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
              {value}
            </p>
          ) : (
            <p className="text-[12.5px] text-slate-300 dark:text-slate-600 font-medium italic">
              Sin contenido
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function SharedCanvasView({ token }: { token: string }) {
  const [canvas, setCanvas] = useState<SharedCanvasRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getCanvasByShareToken(token)
      .then((row) => {
        if (!row) {
          setNotFound(true);
        } else {
          setCanvas(row);
        }
      })
      .catch((err: unknown) => {
        console.error('[SharedCanvasView] Failed to load canvas:', err);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F5F8] dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  if (notFound || !canvas) {
    return (
      <div className="min-h-screen bg-[#F4F5F8] dark:bg-slate-900 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
          <EyeOff size={32} className="text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
        </div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Enlace no disponible
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs font-medium leading-relaxed">
          Este enlace de compartir no existe o ha sido revocado por su propietario.
        </p>
        <a
          href="/"
          className="mt-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-[14px]"
        >
          Ir a Lean Canvas Pro
        </a>
      </div>
    );
  }

  const data = canvas.data as Record<string, string | undefined>;

  return (
    <div className="min-h-screen bg-[#F4F5F8] dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 overflow-x-hidden">
      {/* Top bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-[100] bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700 px-6 py-3 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-[12px] shadow-md shadow-indigo-600/30">
            <Rocket size={16} strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[9px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
              Lean Canvas Pro
            </div>
            <div className="font-display text-[15px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {canvas.name}
            </div>
          </div>
        </div>

        {/* Read-only badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-extrabold uppercase tracking-wider shrink-0">
          <EyeOff size={12} strokeWidth={2.5} />
          Solo lectura
        </div>
      </motion.div>

      {/* Canvas grid */}
      <div className="max-w-[1360px] mx-auto px-4 md:px-8 py-6 flex flex-col gap-5 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-10 md:grid-rows-[minmax(200px,auto)_minmax(200px,auto)] gap-5">
          <ReadOnlyBlock blockId={1} index={0} value={data['1'] ?? ''} additionalClasses="md:col-span-2 md:row-span-2" />
          <ReadOnlyBlock blockId={4} index={1} value={data['4'] ?? ''} additionalClasses="md:col-span-2 md:col-start-3 md:row-start-1" />
          <ReadOnlyBlock blockId={8} index={2} value={data['8'] ?? ''} additionalClasses="md:col-span-2 md:col-start-3 md:row-start-2" />
          <ReadOnlyBlock blockId={3} index={3} value={data['3'] ?? ''} additionalClasses="md:col-span-2 md:col-start-5 md:row-span-2" />
          <ReadOnlyBlock blockId={9} index={4} value={data['9'] ?? ''} additionalClasses="md:col-span-2 md:col-start-7 md:row-start-1" />
          <ReadOnlyBlock blockId={5} index={5} value={data['5'] ?? ''} additionalClasses="md:col-span-2 md:col-start-7 md:row-start-2" />
          <ReadOnlyBlock blockId={2} index={6} value={data['2'] ?? ''} additionalClasses="md:col-span-2 md:col-start-9 md:row-span-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-10 gap-5">
          <ReadOnlyBlock blockId={7} index={7} value={data['7'] ?? ''} additionalClasses="md:col-span-5 md:h-[180px]" />
          <ReadOnlyBlock blockId={6} index={8} value={data['6'] ?? ''} additionalClasses="md:col-span-5 md:h-[180px]" />
        </div>

        <p className="text-center text-[12px] text-slate-400 dark:text-slate-600 font-medium mt-2">
          Vista de solo lectura · Creado con{' '}
          <a href="/" className="text-indigo-500 hover:underline">Lean Canvas Pro</a>
        </p>
      </div>
    </div>
  );
}
