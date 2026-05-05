import React from 'react';
import { motion } from 'motion/react';
import { Rocket, ArrowLeft, FileText } from 'lucide-react';

export function LegalPage() {
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
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
              <FileText size={20} />
            </div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
              Legal
            </p>
          </div>
          <h1 className="font-display text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            Aviso Legal
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-10">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-[15px] leading-relaxed">

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Identificación del titular</h2>
              <div className="bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 space-y-1.5 text-slate-600 dark:text-slate-400">
                <p><strong className="text-slate-700 dark:text-slate-300">Producto:</strong> Lean Canvas Pro</p>
                <p><strong className="text-slate-700 dark:text-slate-300">Repositorio:</strong>{' '}
                  <a href="https://github.com/markusx5622/Lean-Canvas-Pro" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    github.com/markusx5622/Lean-Canvas-Pro
                  </a>
                </p>
                <p><strong className="text-slate-700 dark:text-slate-300">Licencia:</strong> MIT License</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. Objeto y ámbito</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Lean Canvas Pro es una herramienta web de código abierto destinada a facilitar la creación,
                edición y análisis de modelos de negocio basados en el framework Lean Canvas. El uso del
                servicio implica la aceptación de los presentes términos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Condiciones de uso</h2>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 list-disc list-inside">
                <li>El usuario se compromete a utilizar el servicio de forma lícita y conforme a la buena fe.</li>
                <li>Queda prohibido cualquier uso que perjudique, inutilice o sobrecargue la plataforma.</li>
                <li>El contenido introducido por el usuario es de su exclusiva responsabilidad.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Propiedad intelectual</h2>
              <p className="text-slate-600 dark:text-slate-400">
                El código fuente de Lean Canvas Pro está disponible bajo licencia MIT. Esto significa que puede
                ser usado, copiado, modificado y distribuido libremente, siempre que se incluya el aviso de
                copyright original. Los lienzos creados por los usuarios son propiedad exclusiva de éstos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Limitación de responsabilidad</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Lean Canvas Pro se proporciona «tal cual» sin garantías de ningún tipo. El titular no se
                responsabiliza de la pérdida de datos, interrupciones del servicio ni decisiones de negocio
                tomadas con base en el contenido generado por la herramienta.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Legislación aplicable</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Este aviso legal se rige por la legislación española vigente. Para cualquier controversia,
                las partes se someten a los juzgados y tribunales competentes de España, salvo que la ley
                aplicable establezca otro fuero.
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
