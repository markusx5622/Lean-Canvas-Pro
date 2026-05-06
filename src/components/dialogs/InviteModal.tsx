import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPlus, Mail, Copy, Check, X, Loader2, Users, Clock, AlertCircle } from 'lucide-react';
import { useWorkspaceInvitations } from '../../hooks/useWorkspaceInvitations';
import { trackInvitationSent } from '../../lib/analytics';
import type { WorkspaceRow } from '../../lib/workspaceService';

// ── Types ─────────────────────────────────────────────────────────────────────

interface InviteModalProps {
  workspace: WorkspaceRow;
  onClose: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildInviteUrl(token: string): string {
  return `${window.location.origin}/invite/${token}`;
}

function formatExpiry(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Expirada';
  if (days === 1) return 'Expira en 1 día';
  return `Expira en ${days} días`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function InviteModal({ workspace, onClose }: InviteModalProps) {
  const { invitations, loading, error, loadInvitations, invite, revoke } =
    useWorkspaceInvitations();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load pending invitations when the modal opens.
  useEffect(() => {
    loadInvitations(workspace.id);
  }, [workspace.id, loadInvitations]);

  useEffect(() => {
    const FOCUS_DELAY_MS = 80;
    const id = setTimeout(() => inputRef.current?.focus(), FOCUS_DELAY_MS);
    return () => clearTimeout(id);
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      await invite(workspace.id, email.trim());
      trackInvitationSent();
      setEmail('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('duplicate') || msg.includes('unique')) {
        setSubmitError('Ya existe una invitación pendiente para este correo en este workspace.');
      } else {
        setSubmitError('No se pudo enviar la invitación. Inténtalo de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async (token: string, invId: string) => {
    try {
      await navigator.clipboard.writeText(buildInviteUrl(token));
      setCopiedId(invId);
      setTimeout(() => setCopiedId((prev) => (prev === invId ? null : prev)), 2500);
    } catch {
      // Fallback: do nothing if clipboard is unavailable.
    }
  };

  const handleRevoke = async (invId: string) => {
    try {
      await revoke(invId);
    } catch {
      // Error handled silently; the list stays unchanged.
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 16 }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-modal-title"
          className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-indigo-50 dark:bg-indigo-500/10">
                <UserPlus size={18} className="text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
              </div>
              <div>
                <h3
                  id="invite-modal-title"
                  className="font-display text-[17px] font-extrabold text-slate-900 dark:text-white tracking-tight"
                >
                  Invitar a colaborar
                </h3>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {workspace.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 pb-6 flex flex-col gap-5 overflow-y-auto">
            {/* Invite form */}
            <form onSubmit={handleInvite} className="flex flex-col gap-3">
              <label
                htmlFor="invite-email"
                className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest"
              >
                Correo electrónico
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    ref={inputRef}
                    id="invite-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setSubmitError(null); }}
                    placeholder="colaborador@ejemplo.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[13.5px] font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !email.trim()}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[13px] shadow-[0_4px_14px_-4px_rgba(79,70,229,0.4)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {submitting ? (
                    <Loader2 size={14} strokeWidth={2.5} className="animate-spin" />
                  ) : (
                    <UserPlus size={14} strokeWidth={2.5} />
                  )}
                  Invitar
                </button>
              </div>

              {submitError && (
                <div className="flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-200/60 dark:border-rose-500/20">
                  <AlertCircle size={14} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                  <p className="text-[12.5px] text-rose-700 dark:text-rose-400 font-medium">{submitError}</p>
                </div>
              )}
            </form>

            {/* How it works note */}
            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
              <p className="text-[12px] text-indigo-700 dark:text-indigo-300 font-medium leading-relaxed">
                <strong>¿Cómo funciona?</strong> Se genera un enlace único de invitación. Compártelo
                con la persona invitada. Solo podrá aceptarlo quien inicie sesión con el correo indicado.
              </p>
            </div>

            {/* Pending invitations list */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users size={13} className="text-slate-400 dark:text-slate-500" strokeWidth={2.5} />
                <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Invitaciones pendientes
                </span>
              </div>

              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 size={18} className="animate-spin text-slate-300 dark:text-slate-600" />
                </div>
              ) : error ? (
                <p className="text-[12.5px] text-rose-600 dark:text-rose-400 text-center py-2">{error}</p>
              ) : invitations.length === 0 ? (
                <p className="text-[12.5px] text-slate-400 dark:text-slate-600 text-center py-3 font-medium">
                  No hay invitaciones pendientes.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {invitations.map((inv) => (
                    <li
                      key={inv.id}
                      className="flex items-center gap-3 px-3.5 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {inv.email}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={10} className="text-slate-400 dark:text-slate-500" />
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                            {formatExpiry(inv.expires_at)}
                          </span>
                        </div>
                      </div>

                      {/* Copy link */}
                      <button
                        onClick={() => handleCopy(inv.token, inv.id)}
                        aria-label="Copiar enlace de invitación"
                        title="Copiar enlace"
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all active:scale-90"
                      >
                        {copiedId === inv.id ? (
                          <Check size={14} strokeWidth={2.5} className="text-emerald-500" />
                        ) : (
                          <Copy size={14} strokeWidth={2.5} />
                        )}
                      </button>

                      {/* Revoke */}
                      <button
                        onClick={() => handleRevoke(inv.id)}
                        aria-label="Revocar invitación"
                        title="Revocar invitación"
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all active:scale-90"
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
