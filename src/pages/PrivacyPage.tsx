import React from 'react';
import { motion } from 'motion/react';
import { Rocket, ArrowLeft, ShieldCheck } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F4F5F8] dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm font-semibold"
          >
            <ArrowLeft size={16} />
            Volver al inicio
          </a>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-sm">
            <Rocket size={16} className="text-indigo-600 dark:text-indigo-400" />
            Lean Canvas Pro
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Page title */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-500 dark:text-emerald-400">
              Privacidad
            </p>
          </div>
          <h1 className="font-display text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            Política de Privacidad
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-10">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-[15px] leading-relaxed">

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Responsable del tratamiento</h2>
              <div className="bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 space-y-1.5 text-slate-600 dark:text-slate-400">
                <p><strong className="text-slate-700 dark:text-slate-300">Producto:</strong> Lean Canvas Pro</p>
                <p><strong className="text-slate-700 dark:text-slate-300">Repositorio:</strong>{' '}
                  <a href="https://github.com/markusx5622/Lean-Canvas-Pro" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    github.com/markusx5622/Lean-Canvas-Pro
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Datos que recopilamos</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Lean Canvas Pro recopila únicamente los datos estrictamente necesarios para prestar el servicio:
              </p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 list-disc list-inside">
                <li><strong className="text-slate-700 dark:text-slate-300">Dirección de correo electrónico</strong> — utilizada para la autenticación mediante Supabase Auth.</li>
                <li><strong className="text-slate-700 dark:text-slate-300">Contenido de los lienzos</strong> — almacenado en Supabase bajo tu cuenta y protegido por Row-Level Security (RLS).</li>
                <li><strong className="text-slate-700 dark:text-slate-300">Preferencias de interfaz</strong> — guardadas localmente en el navegador (localStorage), sin transmitirse a servidores externos.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Finalidad del tratamiento</h2>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 list-disc list-inside">
                <li>Autenticar y gestionar tu cuenta de usuario.</li>
                <li>Almacenar y sincronizar tus lienzos en la nube.</li>
                <li>Recordar preferencias de tema (claro/oscuro) entre sesiones.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Base legal</h2>
              <p className="text-slate-600 dark:text-slate-400">
                El tratamiento de tus datos se basa en la ejecución del contrato de uso del servicio (art. 6.1.b RGPD)
                y, en su caso, en el consentimiento explícito prestado durante el registro (art. 6.1.a RGPD).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Terceros sub-encargados</h2>
              <div className="bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 text-slate-600 dark:text-slate-400">
                <p className="mb-2">
                  <strong className="text-slate-700 dark:text-slate-300">Supabase, Inc.</strong> — Proveedor de base de datos y autenticación.
                  Consulta su política en{' '}
                  <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    supabase.com/privacy
                  </a>.
                </p>
                <p>
                  No compartimos tus datos con terceros para fines publicitarios ni comerciales.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Conservación de datos</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Tus datos se conservan mientras mantengas una cuenta activa. Al eliminar tu cuenta, todos los
                datos asociados (lienzos y snapshots) serán eliminados de los servidores de Supabase en el
                plazo establecido por su política de retención.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">7. Tus derechos</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                De acuerdo con el RGPD (UE) 2016/679, tienes derecho a:
              </p>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 list-disc list-inside">
                <li>Acceder a tus datos personales.</li>
                <li>Rectificar datos inexactos.</li>
                <li>Solicitar la supresión de tus datos («derecho al olvido»).</li>
                <li>Oponerte o limitar el tratamiento.</li>
                <li>Solicitar la portabilidad de tus datos.</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-400 mt-3">
                Para ejercer estos derechos, puedes abrir un issue en el repositorio de GitHub o ponerte en
                contacto a través de LinkedIn.
              </p>
            </section>

          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800 mt-8">
        <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-500">
          <div className="flex items-center gap-1.5">
            <Rocket size={14} className="text-slate-400 dark:text-slate-600" />
            <span>Lean Canvas Pro © {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="/legal" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">Aviso Legal</a>
            <a href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">Privacidad</a>
            <a href="/cookies" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
