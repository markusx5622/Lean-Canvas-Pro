import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link2, Copy, Trash2, Loader2, CheckCircle2, AlertCircle, EyeOff } from 'lucide-react';
import type { UseCanvasSharingReturn } from '../hooks/useCanvasSharing';
import { ConfirmDialog } from './dialogs/ConfirmDialog';

interface ShareModalProps {
  canvasName: string;
  sharing: UseCanvasSharingReturn;
  onClose: () => void;
}

export function ShareModal({ canvasName, sharing, onClose }: ShareModalProps) {
  const { share, loading, creating, revoking, error, generateLink, revokeLink } = sharing;

  const [copied, setCopied] = useState(false);
  const [showManualCopy, setShowManualCopy] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  const shareUrl = share
    ? `${window.location.origin}/share/${share.token}`
    : null;

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API failed — show inline manual copy UI
      setShowManualCopy(true);
    }
  };

  const handleRevoke = () => {
    setShowRevokeConfirm(true);
  };

  return (
    <>
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
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800"
      >
        {/* Header */}
        <div className="p-6 pb-0 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center">
              <Link2 size={20} className="text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-display text-[18px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                Compartir canvas
              </h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate max-w-[260px]">
                {canvasName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Read-only notice */}
          <div className="flex items-start gap-3 p-3.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20">
            <EyeOff size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" strokeWidth={2.5} />
            <p className="text-[12.5px] text-amber-800 dark:text-amber-300 font-medium leading-snug">
              El enlace es <strong>solo lectura</strong>. Los destinatarios podrán ver el canvas pero no editarlo ni acceder a tus otros lienzos.
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-100 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-[12.5px] font-medium"
              >
                <AlertCircle size={14} strokeWidth={2.5} className="shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={24} className="animate-spin text-slate-400" />
            </div>
          ) : share ? (
            /* Active share link */
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Enlace activo
              </label>
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="flex-1 text-[12.5px] text-slate-700 dark:text-slate-300 font-medium truncate select-all">
                  {shareUrl}
                </span>
                <button
                  onClick={handleCopy}
                  title="Copiar enlace"
                  className="shrink-0 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"
                >
                  {copied
                    ? <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                    : <Copy size={16} strokeWidth={2.5} />}
                </button>
              </div>

              {/* Manual copy fallback (shown when clipboard API is unavailable) */}
              <AnimatePresence>
                {showManualCopy && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-2 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20 overflow-hidden"
                  >
                    <p className="text-[12px] text-amber-800 dark:text-amber-300 font-medium">
                      Copia el enlace manualmente:
                    </p>
                    <input
                      readOnly
                      value={shareUrl ?? ''}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-500/30 rounded-lg text-[12px] text-slate-700 dark:text-slate-300 font-mono focus:outline-none select-all"
                    />
                    <button
                      onClick={() => setShowManualCopy(false)}
                      className="text-[12px] text-amber-700 dark:text-amber-400 font-bold hover:underline text-right"
                    >
                      Cerrar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-[14px] active:scale-[0.98]"
              >
                {copied
                  ? <><CheckCircle2 size={16} strokeWidth={2.5} /> ¡Copiado!</>
                  : <><Copy size={16} strokeWidth={2.5} /> Copiar enlace</>}
              </button>
              <button
                onClick={handleRevoke}
                disabled={revoking}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold rounded-xl transition-colors text-[13px] border border-rose-200 dark:border-rose-500/30 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {revoking
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Trash2 size={14} strokeWidth={2.5} />}
                Revocar enlace
              </button>
            </div>
          ) : (
            /* No share yet */
            <div className="flex flex-col gap-3">
              <p className="text-[13.5px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Genera un enlace único para que otros puedan ver este canvas en modo lectura.
              </p>
              <button
                onClick={generateLink}
                disabled={creating}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-[14px] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_16px_-4px_rgba(79,70,229,0.4)]"
              >
                {creating
                  ? <Loader2 size={16} className="animate-spin" />
                  : <Link2 size={16} strokeWidth={2.5} />}
                {creating ? 'Generando...' : 'Generar enlace de solo lectura'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>

    {/* Revoke confirm dialog */}
    <AnimatePresence>
      {showRevokeConfirm && (
        <ConfirmDialog
          title="Revocar enlace"
          message="¿Revocar el enlace? Quien tenga el enlace actual ya no podrá ver el canvas."
          confirmLabel="Revocar"
          variant="danger"
          onConfirm={async () => {
            setShowRevokeConfirm(false);
            await revokeLink();
          }}
          onCancel={() => setShowRevokeConfirm(false)}
        />
      )}
    </AnimatePresence>
    </>
  );
}
