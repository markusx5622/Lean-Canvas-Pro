import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit2, CheckCircle2 } from 'lucide-react';
import type { BlockDefinition } from '../../data/blocks';

// ── Types ─────────────────────────────────────────────────────────────────────

interface BlockCardProps {
  data: BlockDefinition;
  index: number;
  isActive: boolean;
  hasContent: boolean;
  canvasDataValue: string;
  additionalClasses?: string;
  onClick: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BlockCard({
  data,
  index,
  isActive,
  hasContent,
  canvasDataValue,
  additionalClasses = '',
  onClick,
}: BlockCardProps) {
  return (
    <motion.div
      layoutId={`block-${data.id}`}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={!isActive ? { y: -5, scale: 1.02, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } } : {}}
      whileTap={!isActive ? { scale: 0.98, transition: { duration: 0.15 } } : {}}
      onClick={onClick}
      className={`group relative flex flex-col cursor-pointer overflow-hidden rounded-[20px] transition-all duration-300
        ${isActive
          ? `bg-white dark:bg-slate-800 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.12)] dark:shadow-[0_15px_40px_-5px_rgba(0,0,0,0.4)] ring-2 ring-offset-2 dark:ring-offset-slate-900 ${data.ringColor} z-20`
          : 'bg-white dark:bg-slate-800 shadow-[0_4px_16px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.10)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] border border-slate-200/80 dark:border-slate-700 hover:border-slate-300/80 dark:hover:border-slate-600'
        } ${additionalClasses}`}
    >
      {/* Colored accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 rounded-t-[20px] ${data.accentBar} transition-all duration-300
          ${isActive ? 'h-[4px] opacity-100' : 'h-[3px] opacity-50 group-hover:opacity-80 group-hover:h-[4px]'}`}
      />

      <div className={`absolute top-0 left-0 w-48 h-48 bg-gradient-to-br ${data.color} opacity-60 group-hover:opacity-100 rounded-full blur-3xl -translate-x-12 -translate-y-12 pointer-events-none border-none transition-all duration-500`} />

      <div className="p-6 relative h-full flex flex-col z-10 w-full">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${data.accentIconBg} shadow-sm border border-slate-100/50 dark:border-slate-700/50 ${data.iconColor} transition-transform duration-300 group-hover:scale-110`}>
            {data.icon}
          </div>
          <div className="flex items-center gap-1.5">
            <AnimatePresence>
              {hasContent && (
                <motion.span
                  key="filled-dot"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className={`${data.iconColor} opacity-70`}
                >
                  <CheckCircle2 size={13} strokeWidth={2.5} />
                </motion.span>
              )}
            </AnimatePresence>
            <span className="bg-slate-100/80 dark:bg-slate-700/80 text-slate-400 dark:text-slate-500 font-bold text-[10px] w-6 h-6 flex items-center justify-center rounded-full border border-slate-200/50 dark:border-slate-700 shadow-inner dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
              {data.order}
            </span>
          </div>
        </div>

        <h3 className="font-display text-[17px] font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">{data.title}</h3>

        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {hasContent ? (
              <motion.div
                key="content"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-[14px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium line-clamp-[9] pr-1"
              >
                {canvasDataValue}
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="group h-full flex flex-col relative"
              >
                <p className="text-[13px] text-slate-400 dark:text-slate-500 leading-snug line-clamp-5 group-hover:opacity-0 transition-opacity duration-300 font-medium">
                  {data.description}
                </p>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="flex items-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg py-1.5 px-3.5 rounded-full text-[11px] font-bold tracking-wide transition-transform group-hover:scale-105 duration-300">
                    <Edit2 size={12} strokeWidth={2.5} /> Escribir
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
