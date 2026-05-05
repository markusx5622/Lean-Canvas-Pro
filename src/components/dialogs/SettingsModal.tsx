import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Download, Upload, Info, Trash2, X } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SettingsModalProps {
  theme: 'light' | 'dark';
  canvasName: string;
  onToggleTheme: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
  onOpenAbout: () => void;
  onClearCanvas: () => void;
  onClose: () => void;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">
      {children}
    </h3>
  );
}

function SettingRow({
  icon,
  label,
  description,
  action,
  variant = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  action: React.ReactNode;
  variant?: 'default' | 'danger';
}) {
  return (
    <div className={`flex items-center justify-between gap-4 px-4 py-3 rounded-xl transition-colors ${variant === 'danger' ? 'hover:bg-rose-50 dark:hover:bg-rose-500/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${variant === 'danger' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className={`text-[13.5px] font-semibold leading-snug ${variant === 'danger' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
            {label}
          </div>
          {description && (
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-tight mt-0.5 truncate">
              {description}
            </div>
          )}
        </div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SettingsModal({
  theme,
  canvasName,
  onToggleTheme,
  onExportJson,
  onImportJson,
  onOpenAbout,
  onClearCanvas,
  onClose,
}: SettingsModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.96, y: 16 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800 relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div>
              <h2 className="font-display text-[17px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                Ajustes
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                Personalización y herramientas
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
            >
              <X size={17} strokeWidth={2.5} />
            </button>
          </div>

          {/* Sections */}
          <div className="px-3 pb-5 flex flex-col gap-5">

            {/* Apariencia */}
            <div>
              <SectionTitle>Apariencia</SectionTitle>
              <SettingRow
                icon={theme === 'dark' ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
                label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                description="Cambia el tema visual del workspace"
                action={
                  <button
                    onClick={() => { onToggleTheme(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                  >
                    {theme === 'dark' ? <Sun size={13} strokeWidth={2.5} /> : <Moon size={13} strokeWidth={2.5} />}
                    {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                  </button>
                }
              />
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-1" />

            {/* Datos */}
            <div>
              <SectionTitle>Datos</SectionTitle>
              <SettingRow
                icon={<Download size={16} strokeWidth={2} />}
                label="Exportar JSON"
                description={`Guardar copia de "${canvasName}"`}
                action={
                  <button
                    onClick={() => { onExportJson(); onClose(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                  >
                    <Download size={13} strokeWidth={2.5} />
                    Exportar
                  </button>
                }
              />
              <SettingRow
                icon={<Upload size={16} strokeWidth={2} />}
                label="Importar JSON"
                description="Cargar un lienzo desde archivo"
                action={
                  <button
                    onClick={() => { onImportJson(); onClose(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                  >
                    <Upload size={13} strokeWidth={2.5} />
                    Importar
                  </button>
                }
              />
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-1" />

            {/* Lienzo */}
            <div>
              <SectionTitle>Lienzo</SectionTitle>
              <SettingRow
                icon={<Trash2 size={16} strokeWidth={2} />}
                label="Borrar contenido"
                description="Elimina el texto de todos los bloques"
                variant="danger"
                action={
                  <button
                    onClick={() => { onClearCanvas(); onClose(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-100 dark:border-rose-500/20 transition-all active:scale-95"
                  >
                    <Trash2 size={13} strokeWidth={2.5} />
                    Borrar
                  </button>
                }
              />
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-1" />

            {/* Info */}
            <div>
              <SectionTitle>Información</SectionTitle>
              <SettingRow
                icon={<Info size={16} strokeWidth={2} />}
                label="Acerca de Lean Canvas Pro"
                description="Versión, autor y enlaces del proyecto"
                action={
                  <button
                    onClick={() => { onOpenAbout(); onClose(); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                  >
                    <Info size={13} strokeWidth={2.5} />
                    Ver
                  </button>
                }
              />
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
