import React from 'react';
import { motion } from 'motion/react';
import { Rocket, ArrowLeft, Cookie } from 'lucide-react';

export function CookiesPage() {
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
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
              <Cookie size={20} />
            </div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-amber-500 dark:text-amber-400">
              Cookies
            </p>
          </div>
          <h1 className="font-display text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            Política de Cookies
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-10">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-[15px] leading-relaxed">

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. ¿Qué son las cookies?</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Las cookies son pequeños ficheros de texto que los sitios web almacenan en tu dispositivo al
                visitarlos. Permiten que el sitio recuerde información sobre tu visita para facilitar el uso
                en futuras sesiones.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Almacenamiento local utilizado</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Lean Canvas Pro <strong className="text-slate-700 dark:text-slate-300">no utiliza cookies de seguimiento ni publicidad</strong>.
                El almacenamiento local (<code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">localStorage</code>) se emplea exclusivamente para funciones técnicas esenciales:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/60">
                      <th className="text-left px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300 rounded-tl-xl">Clave</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300">Propósito</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300 rounded-tr-xl">Duración</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {[
                      {
                        key: 'lean-canvas-pro-theme',
                        purpose: 'Recuerda la preferencia de tema (claro/oscuro)',
                        duration: 'Persistente (hasta que el usuario la borre)',
                      },
                      {
                        key: 'lean-canvas-pro-cache-{userId}',
                        purpose: 'Caché local de lienzos para acceso sin conexión y reducción de latencia',
                        duration: 'Persistente (hasta que el usuario la borre)',
                      },
                      {
                        key: 'sb-*-auth-token (Supabase)',
                        purpose: 'Token de sesión de autenticación gestionado por Supabase Auth',
                        duration: 'Sesión / según configuración de Supabase',
                      },
                    ].map(({ key, purpose, duration }) => (
                      <tr key={key} className="bg-white/60 dark:bg-slate-900/40">
                        <td className="px-4 py-3 font-mono text-xs text-indigo-600 dark:text-indigo-400 align-top">{key}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 align-top">{purpose}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-500 align-top text-xs">{duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Cookies de terceros</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Lean Canvas Pro no incluye scripts de analítica de terceros (Google Analytics, Mixpanel, etc.)
                ni redes publicitarias. Las únicas peticiones externas son las realizadas a los servidores de
                Supabase para la autenticación y persistencia de datos, y a Google Fonts para cargar las
                tipografías Inter y Outfit.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Gestión y eliminación</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Puedes eliminar el almacenamiento local de Lean Canvas Pro en cualquier momento desde la
                configuración de tu navegador (Ajustes → Privacidad → Borrar datos del sitio). Ten en cuenta
                que eliminar los datos de caché no afecta a los lienzos almacenados en la nube, que
                permanecerán vinculados a tu cuenta.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Cambios en esta política</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Cualquier cambio en el uso del almacenamiento local se reflejará en esta página con una nueva
                fecha de actualización. Te recomendamos revisarla periódicamente.
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
