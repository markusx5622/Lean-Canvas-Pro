import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import type { BlockDefinition } from '../../data/blocks';

// ── Types ─────────────────────────────────────────────────────────────────────

interface MobileEditorProps {
  selectedBlock: BlockDefinition;
  editorText: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MobileEditor({ selectedBlock, editorText, onChangeText, onClose }: MobileEditorProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="md:hidden fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex flex-col justify-end cursor-pointer"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-white dark:bg-slate-800 rounded-t-[32px] h-[85vh] w-full flex flex-col shadow-2xl p-6 cursor-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-4" />

          <div className="mt-5 flex items-center gap-4 mb-6 shrink-0">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${selectedBlock.color} ${selectedBlock.iconColor} shadow-inner border border-white dark:border-slate-700`}>
              {selectedBlock.icon}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[1.5px] text-slate-400 dark:text-slate-500 font-extrabold mb-0.5">
                BLOQUE 0{selectedBlock.order}
              </div>
              <h2 className="font-display text-[22px] font-extrabold text-slate-900 dark:text-white leading-none tracking-tight">
                {selectedBlock.title}
              </h2>
            </div>
          </div>

          <textarea
            className={`flex-1 w-full p-4 mb-5 bg-slate-50 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-[15px] font-medium text-slate-800 dark:text-slate-200 leading-relaxed focus:bg-white focus:dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:dark:ring-offset-slate-900 ${selectedBlock.ringColor} resize-none shadow-inner dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]`}
            placeholder="Escribe tus ideas..."
            value={editorText}
            onChange={(e) => onChangeText(e.target.value)}
          />

          <button
            onClick={onClose}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl active:scale-95 transition-all text-[15px] flex items-center justify-center gap-2 shadow-lg tracking-tight"
          >
            <CheckCircle2 size={20} strokeWidth={2.5} /> Guardar y Cerrar
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
