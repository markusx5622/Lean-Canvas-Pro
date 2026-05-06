import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Rocket, Users, Loader2, CheckCircle2, AlertCircle, LogIn } from 'lucide-react';
import { getInvitationByToken, acceptInvitation, type InvitationPublicInfo } from '../lib/invitationService';
import { trackInvitationAccepted } from '../lib/analytics';
import { useAuth } from '../contexts/AuthContext';

// ── Types ─────────────────────────────────────────────────────────────────────

type PageState =
  | { kind: 'loading' }
  | { kind: 'invalid' }
  | { kind: 'info'; info: InvitationPublicInfo }
  | { kind: 'accepting' }
  | { kind: 'accepted'; workspaceId: string }
  | { kind: 'error'; message: string };

// ── Component ─────────────────────────────────────────────────────────────────

export function AcceptInvitePage({ token }: { token: string }) {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<PageState>({ kind: 'loading' });

  // Fetch invitation metadata.
  useEffect(() => {
    if (authLoading) return;
    getInvitationByToken(token)
      .then((info) => {
        if (!info) {
          setState({ kind: 'invalid' });
        } else {
          setState({ kind: 'info', info });
        }
      })
      .catch(() => setState({ kind: 'invalid' }));
  }, [token, authLoading]);

  const handleAccept = async () => {
    setState({ kind: 'accepting' });
    try {
      const result = await acceptInvitation(token);
      trackInvitationAccepted();
      setState({ kind: 'accepted', workspaceId: result.workspace_id });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      let friendly: string;
      if (msg.includes('email_mismatch')) {
        friendly =
          'Tu cuenta no coincide con el correo de la invitación. Inicia sesión con la cuenta correcta e inténtalo de nuevo.';
      } else if (msg.includes('invalid_or_expired_token')) {
        friendly = 'Esta invitación ya no es válida o ha expirado.';
      } else {
        friendly = 'Ocurrió un error al aceptar la invitación. Inténtalo de nuevo.';
      }
      setState({ kind: 'error', message: friendly });
    }
  };

  const goToApp = () => {
    window.location.href = '/';
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F4F5F8] dark:bg-slate-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-[20px] bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/40">
            <Rocket size={26} strokeWidth={2.5} className="text-white" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/50 dark:border-slate-800 p-7 flex flex-col gap-5 text-center">

          {/* Loading */}
          {(state.kind === 'loading' || authLoading) && (
            <div className="flex flex-col items-center gap-4 py-4">
              <Loader2 size={28} className="animate-spin text-indigo-500" />
              <p className="text-[14px] text-slate-500 dark:text-slate-400 font-medium">
                Verificando invitación…
              </p>
            </div>
          )}

          {/* Invalid / expired */}
          {state.kind === 'invalid' && !authLoading && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
                <AlertCircle size={22} className="text-rose-500" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="font-display text-[18px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Invitación no válida
                </h2>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed">
                  Este enlace de invitación no existe, ya fue utilizado o ha expirado.
                </p>
              </div>
              <button
                onClick={goToApp}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[14px] transition-all active:scale-[0.98]"
              >
                Ir a Lean Canvas Pro
              </button>
            </div>
          )}

          {/* Show invitation info */}
          {state.kind === 'info' && !authLoading && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                <Users size={22} className="text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[12px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                  Te han invitado a
                </p>
                <h2 className="font-display text-[20px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {state.info.workspace_name}
                </h2>
                <p className="text-[12.5px] text-slate-500 dark:text-slate-400 font-medium mt-2">
                  Para&nbsp;
                  <strong className="text-slate-700 dark:text-slate-300">{state.info.email}</strong>
                </p>
              </div>

              {user ? (
                // Logged in — show accept button.
                <div className="w-full flex flex-col gap-2.5">
                  <button
                    onClick={handleAccept}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[14px] shadow-[0_4px_14px_-4px_rgba(79,70,229,0.4)] transition-all active:scale-[0.98]"
                  >
                    Aceptar invitación
                  </button>
                  <button
                    onClick={goToApp}
                    className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-xl text-[14px] transition-all active:scale-[0.98]"
                  >
                    Rechazar
                  </button>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    Sesión activa como&nbsp;
                    <strong className="text-slate-600 dark:text-slate-400">{user.email}</strong>
                  </p>
                </div>
              ) : (
                // Not logged in — prompt to sign in.
                <div className="w-full flex flex-col gap-3">
                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200/60 dark:border-amber-500/20 text-left">
                    <LogIn size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                    <p className="text-[12px] text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
                      Necesitas iniciar sesión con&nbsp;
                      <strong>{state.info.email}</strong> para aceptar esta invitación.
                    </p>
                  </div>
                  <button
                    onClick={goToApp}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[14px] transition-all active:scale-[0.98]"
                  >
                    Iniciar sesión
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Accepting spinner */}
          {state.kind === 'accepting' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <Loader2 size={28} className="animate-spin text-indigo-500" />
              <p className="text-[14px] text-slate-500 dark:text-slate-400 font-medium">
                Uniéndote al workspace…
              </p>
            </div>
          )}

          {/* Accepted */}
          {state.kind === 'accepted' && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 size={22} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="font-display text-[18px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                  ¡Te has unido!
                </h2>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed">
                  Ya eres miembro del workspace. Ahora puedes ver y editar sus lienzos.
                </p>
              </div>
              <button
                onClick={goToApp}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[14px] shadow-[0_4px_14px_-4px_rgba(79,70,229,0.4)] transition-all active:scale-[0.98]"
              >
                Ir al workspace
              </button>
            </div>
          )}

          {/* Error */}
          {state.kind === 'error' && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
                <AlertCircle size={22} className="text-rose-500" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="font-display text-[18px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                  No se pudo aceptar
                </h2>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed">
                  {state.message}
                </p>
              </div>
              <button
                onClick={goToApp}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[14px] transition-all active:scale-[0.98]"
              >
                Ir a Lean Canvas Pro
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-[12px] text-slate-400 dark:text-slate-600 font-medium mt-6">
          Lean Canvas Pro
        </p>
      </motion.div>
    </div>
  );
}
