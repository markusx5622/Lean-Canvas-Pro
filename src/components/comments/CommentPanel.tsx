import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Trash2, Loader2, AlertCircle, RefreshCw, X } from 'lucide-react';
import type { UseCanvasCommentsReturn } from '../../hooks/useCanvasComments';
import { BLOCK_META } from '../../data/blocks';

interface CommentPanelProps {
  canvasName: string;
  comments: UseCanvasCommentsReturn;
  onClose: () => void;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

/**
 * Modal panel that lets the canvas owner browse, read, and delete
 * comments submitted by external reviewers via the share link.
 */
export function CommentPanel({ canvasName, comments: commentsState, onClose }: CommentPanelProps) {
  const { comments, loading, deleting, error, refetch, removeComment } = commentsState;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="comment-panel-title"
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-6 pb-4 flex items-start justify-between shrink-0 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center">
              <MessageSquare size={20} className="text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
            </div>
            <div>
              <h3 id="comment-panel-title" className="font-display text-[18px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                Feedback recibido
              </h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate max-w-[260px]">
                {canvasName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 min-h-0">
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
                <span className="flex-1">{error}</span>
                <button
                  onClick={refetch}
                  aria-label="Reintentar"
                  title="Reintentar"
                  className="shrink-0 p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
                >
                  <RefreshCw size={13} strokeWidth={2.5} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-slate-400" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <MessageSquare size={26} className="text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
              </div>
              <p className="text-[14px] font-bold text-slate-600 dark:text-slate-400">
                Sin comentarios todavía
              </p>
              <p className="text-[12.5px] text-slate-400 dark:text-slate-500 font-medium max-w-[240px] leading-relaxed">
                El feedback externo de revisores aparecerá aquí cuando envíen comentarios.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3" role="list" aria-label="Lista de comentarios">
              <AnimatePresence initial={false}>
                {comments.map((comment) => {
                  const blockMeta = comment.block_id !== null ? BLOCK_META[comment.block_id] : null;
                  return (
                    <motion.li
                      key={comment.id}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-2 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60"
                    >
                      {/* Comment header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="font-bold text-[13px] text-slate-800 dark:text-slate-200 truncate">
                            {comment.author_name}
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <button
                          onClick={() => removeComment(comment.id)}
                          disabled={deleting === comment.id}
                          aria-label={`Eliminar comentario de ${comment.author_name}`}
                          title="Eliminar comentario"
                          className="shrink-0 p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleting === comment.id
                            ? <Loader2 size={13} className="animate-spin" />
                            : <Trash2 size={13} strokeWidth={2.5} />}
                        </button>
                      </div>

                      {/* Block badge */}
                      {blockMeta && (
                        <div className="inline-flex items-center gap-1.5 self-start px-2 py-0.5 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          <span className={`${blockMeta.iconColor}`} aria-hidden="true">
                            {blockMeta.icon}
                          </span>
                          {blockMeta.title}
                        </div>
                      )}

                      {/* Comment body */}
                      <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                        {comment.body}
                      </p>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {/* Footer */}
        {!loading && comments.length > 0 && (
          <div className="px-6 py-3 shrink-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[12px] text-slate-400 dark:text-slate-500 font-medium">
              {comments.length} {comments.length === 1 ? 'comentario' : 'comentarios'}
            </span>
            <button
              onClick={refetch}
              aria-label="Actualizar comentarios"
              title="Actualizar"
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RefreshCw size={13} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
