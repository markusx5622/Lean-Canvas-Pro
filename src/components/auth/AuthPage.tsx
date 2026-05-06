import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Mail, Lock, AlertCircle, CheckCircle2, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ParticleBackground } from '../../ParticleBackground';

type Mode = 'signin' | 'signup';

interface FormState {
  email: string;
  password: string;
}

export function AuthPage({ theme }: { theme: 'light' | 'dark' }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const { email, password } = form;

    if (mode === 'signup') {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error);
      } else {
        setSuccessMsg(
          'Cuenta creada. Revisa tu correo para confirmar tu dirección antes de iniciar sesión.'
        );
        setMode('signin');
        setForm(prev => ({ ...prev, password: '' }));
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
      // On success the AuthContext listener updates the user automatically.
    }

    setLoading(false);
  };

  const switchMode = () => {
    setMode(m => (m === 'signin' ? 'signup' : 'signin'));
    setError(null);
    setSuccessMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F8] dark:bg-slate-950 font-sans flex flex-col items-center justify-center px-4 overflow-hidden relative">
      <ParticleBackground theme={theme} />

      {/* Background glow blobs */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px]" />
        <div className="absolute top-[30%] -right-[15%] w-[40%] h-[60%] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-[20%] w-[60%] h-[40%] rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
          className="mb-8 relative"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 dark:opacity-30 rounded-[28px]" />
          <div className="relative bg-white dark:bg-slate-800/80 backdrop-blur-xl p-4 rounded-[24px] shadow-sm border border-slate-200/50 dark:border-slate-700/50">
            <Rocket size={40} className="text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold text-xs tracking-wide uppercase mb-4 border border-indigo-100 dark:border-indigo-500/20">
            <Sparkles size={12} aria-hidden="true" /> Lean Canvas Pro
          </div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {mode === 'signin' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
            {mode === 'signin'
              ? 'Inicia sesión para continuar con tu espacio de trabajo.'
              : 'Regístrate gratis para empezar a modelar tu startup.'}
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.22, duration: 0.5 }}
          className="w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700 rounded-3xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.4)] p-8"
        >
          <AnimatePresence mode="wait">
            {successMsg && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-start gap-3 p-4 mb-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl text-emerald-800 dark:text-emerald-300 text-[13px] font-medium"
              >
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-500" strokeWidth={2.5} />
                <span>{successMsg}</span>
              </motion.div>
            )}
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-start gap-3 p-4 mb-5 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-500/30 rounded-2xl text-rose-800 dark:text-rose-300 text-[13px] font-medium"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" strokeWidth={2.5} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" strokeWidth={2.5} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 rounded-xl text-[14px] font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" strokeWidth={2.5} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 rounded-xl text-[14px] font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={16} strokeWidth={2.5} /> : <Eye size={16} strokeWidth={2.5} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="mt-2 w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-colors shadow-[0_8px_24px_-4px_rgba(79,70,229,0.3)] hover:shadow-[0_12px_32px_-4px_rgba(79,70,229,0.45)] text-[15px]"
            >
              {loading ? (
                <>
                  <svg aria-hidden="true" className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>{mode === 'signin' ? 'Iniciando sesión...' : 'Creando cuenta...'}</span>
                </>
              ) : mode === 'signin' ? (
                'Iniciar sesión'
              ) : (
                'Crear cuenta'
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Mode switcher */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6 text-[13px] text-slate-500 dark:text-slate-400 font-medium"
        >
          {mode === 'signin' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            onClick={switchMode}
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline transition-colors"
          >
            {mode === 'signin' ? 'Regístrate gratis' : 'Inicia sesión'}
          </button>
        </motion.p>
      </div>
    </div>
  );
}
