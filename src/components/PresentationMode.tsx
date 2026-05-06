import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Rocket, ChevronLeft, ChevronRight, EyeOff } from 'lucide-react';
import { BLOCK_META } from '../data/blocks';
import type { CanvasData } from '../hooks/useCanvases';

// Canvas block order (follows the visual grid layout)
const BLOCK_ORDER = [1, 4, 8, 3, 9, 5, 2, 7, 6];

// ── Types ─────────────────────────────────────────────────────────────────────

interface PresentationModeProps {
  canvasName: string;
  canvasData: CanvasData;
  onClose: () => void;
}

// ── Clickable read-only block card ────────────────────────────────────────────

function PresentationBlock({
  blockId,
  index,
  value,
  additionalClasses = '',
  onClick,
}: {
  blockId: number;
  index: number;
  value: string;
  additionalClasses?: string;
  onClick: () => void;
}) {
  const meta = BLOCK_META[blockId];
  if (!meta) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${meta.title}${value.trim() ? '' : ' (sin contenido)'} · ampliar`}
      className={`group relative flex flex-col overflow-hidden rounded-[20px] bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 cursor-pointer hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all duration-300 ${additionalClasses}`}
      style={{ '--glow-color': meta.glowColor } as React.CSSProperties}
    >
      {/* Colored accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-[20px] ${meta.accentBar} opacity-70 group-hover:opacity-100 group-hover:h-[4px] transition-all duration-300`} />
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
            <p className="text-[13.5px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium line-clamp-[8]">
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

// ── Focused single-block overlay ──────────────────────────────────────────────

function FocusedBlock({
  blockId,
  value,
  blockIndex,
  totalBlocks,
  onPrev,
  onNext,
  onClose,
}: {
  blockId: number;
  value: string;
  blockIndex: number;
  totalBlocks: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const meta = BLOCK_META[blockId];
  if (!meta) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-10 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 md:p-12"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 24 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-2xl w-full bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200/80 dark:border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-[4px] ${meta.accentBar}`} />
        <div className={`absolute top-0 left-0 w-72 h-72 bg-gradient-to-br ${meta.color} opacity-50 rounded-full blur-3xl -translate-x-24 -translate-y-24 pointer-events-none`} />

        <div className="p-8 relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${meta.accentIconBg} shadow-sm border border-slate-100/50 dark:border-slate-700/50 ${meta.iconColor}`}>
              {meta.icon}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Cerrar vista ampliada"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-5">
            {meta.title}
          </h2>

          <div className="min-h-[100px] max-h-[50vh] overflow-y-auto pr-1">
            {value.trim() ? (
              <p className="text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                {value}
              </p>
            ) : (
              <div className="flex flex-col items-center justify-center h-[100px] gap-3">
                <EyeOff size={28} className="text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
                <p className="text-[13px] text-slate-300 dark:text-slate-600 font-medium italic text-center">
                  Este bloque no tiene contenido todavía
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation footer */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 px-6 py-4">
          <button
            onClick={onPrev}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-bold text-[13px]"
            aria-label="Bloque anterior"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">Anterior</span>
          </button>
          <span className="text-[12px] font-extrabold text-slate-400 dark:text-slate-500 tabular-nums tracking-wide">
            {blockIndex + 1} / {totalBlocks}
          </span>
          <button
            onClick={onNext}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-bold text-[13px]"
            aria-label="Bloque siguiente"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main PresentationMode component ───────────────────────────────────────────

export function PresentationMode({ canvasName, canvasData, onClose }: PresentationModeProps) {
  const [focusedBlockId, setFocusedBlockId] = useState<number | null>(null);

  const focusedIndex = focusedBlockId !== null ? BLOCK_ORDER.indexOf(focusedBlockId) : -1;

  const handlePrev = useCallback(() => {
    const i = focusedIndex <= 0 ? BLOCK_ORDER.length - 1 : focusedIndex - 1;
    setFocusedBlockId(BLOCK_ORDER[i]);
  }, [focusedIndex]);

  const handleNext = useCallback(() => {
    const i = focusedIndex >= BLOCK_ORDER.length - 1 ? 0 : focusedIndex + 1;
    setFocusedBlockId(BLOCK_ORDER[i]);
  }, [focusedIndex]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (focusedBlockId !== null) setFocusedBlockId(null);
        else onClose();
        return;
      }
      if (focusedBlockId !== null) {
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'ArrowRight') handleNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focusedBlockId, handlePrev, handleNext, onClose]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const data = canvasData as Record<string, string | undefined>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[200] bg-[#F4F5F8] dark:bg-slate-950 flex flex-col overflow-hidden"
    >
      {/* Header bar */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700 px-6 py-3.5 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-[12px] shadow-md shadow-indigo-600/30">
            <Rocket size={16} strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[9px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
              Lean Canvas Pro · Modo Presentación
            </div>
            <div className="font-display text-[15px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {canvasName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium select-none">
            Haz clic en un bloque para ampliarlo
            <span className="mx-1 text-slate-200 dark:text-slate-700">·</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-[10px] border border-slate-200 dark:border-slate-600">←→</kbd>
            navegar
            <span className="mx-1 text-slate-200 dark:text-slate-700">·</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-[10px] border border-slate-200 dark:border-slate-600">Esc</kbd>
            salir
          </span>
          <button
            onClick={onClose}
            aria-label="Salir del modo presentación"
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Canvas grid (scrollable) */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="max-w-[1360px] mx-auto px-4 md:px-8 py-6 flex flex-col gap-5 pb-16">
          {/* Top 7 blocks */}
          <div className="grid grid-cols-1 md:grid-cols-10 md:grid-rows-[minmax(200px,auto)_minmax(200px,auto)] gap-5">
            <PresentationBlock blockId={1} index={0} value={data['1'] ?? ''} additionalClasses="md:col-span-2 md:row-span-2" onClick={() => setFocusedBlockId(1)} />
            <PresentationBlock blockId={4} index={1} value={data['4'] ?? ''} additionalClasses="md:col-span-2 md:col-start-3 md:row-start-1" onClick={() => setFocusedBlockId(4)} />
            <PresentationBlock blockId={8} index={2} value={data['8'] ?? ''} additionalClasses="md:col-span-2 md:col-start-3 md:row-start-2" onClick={() => setFocusedBlockId(8)} />
            <PresentationBlock blockId={3} index={3} value={data['3'] ?? ''} additionalClasses="md:col-span-2 md:col-start-5 md:row-span-2" onClick={() => setFocusedBlockId(3)} />
            <PresentationBlock blockId={9} index={4} value={data['9'] ?? ''} additionalClasses="md:col-span-2 md:col-start-7 md:row-start-1" onClick={() => setFocusedBlockId(9)} />
            <PresentationBlock blockId={5} index={5} value={data['5'] ?? ''} additionalClasses="md:col-span-2 md:col-start-7 md:row-start-2" onClick={() => setFocusedBlockId(5)} />
            <PresentationBlock blockId={2} index={6} value={data['2'] ?? ''} additionalClasses="md:col-span-2 md:col-start-9 md:row-span-2" onClick={() => setFocusedBlockId(2)} />
          </div>

          {/* Bottom 2 blocks */}
          <div className="grid grid-cols-1 md:grid-cols-10 gap-5">
            <PresentationBlock blockId={7} index={7} value={data['7'] ?? ''} additionalClasses="md:col-span-5 md:h-[180px]" onClick={() => setFocusedBlockId(7)} />
            <PresentationBlock blockId={6} index={8} value={data['6'] ?? ''} additionalClasses="md:col-span-5 md:h-[180px]" onClick={() => setFocusedBlockId(6)} />
          </div>

          <p className="text-center text-[12px] text-slate-400 dark:text-slate-600 font-medium mt-2">
            Haz clic en cualquier bloque para verlo en detalle
          </p>
        </div>

        {/* Focused block overlay (rendered inside the scrollable area so it covers it fully) */}
        <AnimatePresence>
          {focusedBlockId !== null && (
            <FocusedBlock
              blockId={focusedBlockId}
              value={String(data[String(focusedBlockId)] ?? '')}
              blockIndex={focusedIndex}
              totalBlocks={BLOCK_ORDER.length}
              onPrev={handlePrev}
              onNext={handleNext}
              onClose={() => setFocusedBlockId(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
