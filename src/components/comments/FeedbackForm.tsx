import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquarePlus, CheckCircle2, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
import { addComment } from '../../lib/commentService';
import { trackFeedbackSubmitted } from '../../lib/analytics';
import { BLOCKS } from '../../data/blocks';

interface FeedbackFormProps {
  /** The share token from the URL — used to authenticate the submission. */
  shareToken: string;
}

/**
 * Form rendered in the SharedCanvasView that lets anyone with a share link
 * leave structured feedback for the canvas owner.
 * Requires no authentication — uses the SECURITY DEFINER RPC.
 */
export function FeedbackForm({ shareToken }: FeedbackFormProps) {
  const [authorName, setAuthorName] = useState('');
  const [body, setBody] = useState('');
  const [blockId, setBlockId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !body.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await addComment(shareToken, blockId, authorName.trim(), body.trim());
      trackFeedbackSubmitted(blockId !== null);
      setSuccess(true);
      setAuthorName('');
      setBody('');
      setBlockId(null);
    } catch (err: unknown) {
      console.error('[FeedbackForm] submit failed:', err);
      setError('No se pudo enviar el comentario. Comprueba tu conexión e inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3 py-8 px-6 text-center"
      >
        <CheckCircle2 size={36} className="text-emerald-500" strokeWidth={1.5} />
        <h3 className="font-display text-[16px] font-extrabold text-slate-900 dark:text-white tracking-tight">
          ¡Gracias por tu feedback!
        </h3>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium max-w-xs leading-relaxed">
          El propietario del canvas recibirá tu comentario y podrá revisarlo desde su cuenta.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-2 text-[12px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
        >
          Dejar otro comentario
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Author */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="feedback-author" className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          Tu nombre *
        </label>
        <input
          id="feedback-author"
          type="text"
          required
          maxLength={120}
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Ej: Ana García (mentora)"
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all font-medium"
        />
      </div>

      {/* Block selector (optional) */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="feedback-block" className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          Bloque (opcional)
        </label>
        <div className="relative">
          <select
            id="feedback-block"
            value={blockId ?? ''}
            onChange={(e) => setBlockId(e.target.value === '' ? null : Number(e.target.value))}
            className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all font-medium pr-9 cursor-pointer"
          >
            <option value="">Comentario general</option>
            {BLOCKS.sort((a, b) => a.order - b.order).map((b) => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="feedback-body" className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          Comentario *
        </label>
        <textarea
          id="feedback-body"
          required
          maxLength={2000}
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="¿Qué opinas sobre este canvas? ¿Qué mejorarías?"
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all font-medium resize-none leading-relaxed"
        />
        <div className="text-right text-[11px] text-slate-400 dark:text-slate-600 font-medium">
          {body.length}/2000
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-100 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-[12.5px] font-medium overflow-hidden"
          >
            <AlertCircle size={14} strokeWidth={2.5} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={submitting || !authorName.trim() || !body.trim()}
        className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-[14px] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_16px_-4px_rgba(79,70,229,0.4)]"
      >
        {submitting
          ? <Loader2 size={16} className="animate-spin" />
          : <MessageSquarePlus size={16} strokeWidth={2.5} />}
        {submitting ? 'Enviando...' : 'Enviar feedback'}
      </button>
    </form>
  );
}
