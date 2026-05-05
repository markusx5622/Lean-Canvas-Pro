import React from 'react';
import { motion } from 'motion/react';
import {
  Rocket, Plus, Edit2, Trash2, ShieldCheck, Settings,
  FileDown, Share2, LogOut, Loader2,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { Project } from '../../hooks/useCanvases';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ToolbarProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  filledBlocks: number;
  progressPercentage: number;
  pdfExporting: boolean;
  user: User | null;
  prefersReducedMotion: boolean | null | undefined;
  hasActiveShare: boolean;
  onCreateProject: () => void;
  onRenameProject: () => void;
  onDeleteProject: () => void;
  onAudit: () => void;
  onOpenSettings: () => void;
  onExportPdf: () => void;
  onShare: () => void;
  onSignOut: () => void;
  onLogoClick: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Toolbar({
  projects,
  activeProjectId,
  onSelectProject,
  filledBlocks,
  progressPercentage,
  pdfExporting,
  user,
  prefersReducedMotion,
  hasActiveShare,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  onAudit,
  onOpenSettings,
  onExportPdf,
  onShare,
  onSignOut,
  onLogoClick,
}: ToolbarProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border text-sm border-slate-200/60 dark:border-slate-700 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] rounded-[20px] py-3.5 px-5 flex flex-col md:flex-row items-center justify-between gap-3 sticky top-4 z-[100]"
    >
      {/* Logo & project dropdown */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative shrink-0">
          <motion.div
            className="absolute inset-0 rounded-[14px] bg-indigo-500 pointer-events-none"
            animate={prefersReducedMotion ? {} : { scale: [1, 1.55, 1.55], opacity: [0.5, 0, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-0 rounded-[14px] bg-indigo-400 pointer-events-none"
            animate={prefersReducedMotion ? {} : { scale: [1, 1.35, 1.35], opacity: [0.3, 0, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeOut', delay: 0.7 }}
          />
          <motion.button
            onClick={onLogoClick}
            whileHover={{ scale: 1.08, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
            whileTap={{ scale: 0.93, transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] } }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-[14px] shadow-lg shadow-indigo-600/40 hover:shadow-xl hover:shadow-indigo-600/50 relative group cursor-pointer overflow-hidden transition-[background-color,box-shadow] duration-300 will-change-transform"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[14px]" />
            <motion.div
              animate={prefersReducedMotion ? {} : { y: [0, -3], rotate: [0, 8] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', repeatType: 'mirror' }}
              className="relative z-10"
            >
              <Rocket size={18} strokeWidth={2.5} />
            </motion.div>
          </motion.button>
        </div>

        <div className="flex flex-col relative w-full group">
          <div className="text-[9px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-[2px] ml-[5px]">
            Workspace
          </div>
          <div className="flex items-center gap-1 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl p-0.5 transition-all border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700">
            <div className="relative flex items-center">
              <select
                value={activeProjectId}
                onChange={(e) => onSelectProject(e.target.value)}
                className="font-display appearance-none bg-transparent text-slate-800 dark:text-slate-200 font-extrabold text-[15px] py-1 pl-2 pr-8 focus:outline-none min-w-[150px] cursor-pointer tracking-tight"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="dark:bg-slate-800 dark:text-slate-200">{p.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2 text-slate-400 dark:text-slate-500 transition-colors group-hover:text-slate-600 dark:group-hover:text-slate-400">
                <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="flex items-center">
              <button onClick={onRenameProject} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm shadow-transparent hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-transparent hover:border-slate-200 dark:hover:border-slate-700 active:scale-90">
                <Edit2 size={13} strokeWidth={2.5} />
              </button>
              <button onClick={onDeleteProject} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm shadow-transparent hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-transparent hover:border-slate-200 dark:hover:border-slate-700 active:scale-90">
                <Trash2 size={13} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200/60 dark:bg-slate-700 mx-0.5 hidden lg:block" />

        <button
          onClick={onCreateProject}
          className="hidden lg:flex items-center gap-2 px-3 py-[7px] bg-slate-50 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-bold rounded-[10px] hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all whitespace-nowrap text-[13px] tracking-tight border border-slate-200/80 dark:border-slate-700 shadow-sm active:scale-95"
        >
          <Plus size={15} strokeWidth={2.5} /> Nuevo
        </button>
      </div>

      {/* Progress bar */}
      <div className="hidden md:flex flex-col items-center flex-1 max-w-[240px]">
        <div className="flex w-full justify-between mb-[6px] text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          <span>Validación de la Startup</span>
          <span className={progressPercentage === 100 ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-300'}>{progressPercentage}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full ${progressPercentage === 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgb(16,185,129,0.5)]' : 'bg-indigo-600 dark:bg-indigo-500'}`}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        {/* Audit CTA */}
        <button
          onClick={onAudit}
          disabled={filledBlocks === 0}
          title="Ejecutar Auditoría Estratégica Local"
          className="flex items-center gap-1.5 px-3 py-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 rounded-[10px] transition-all border border-indigo-100 dark:border-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-[12px] font-bold active:scale-95"
        >
          <ShieldCheck size={15} strokeWidth={2.5} />
          <span className="hidden lg:inline">Auditoría Estratégica</span>
        </button>

        <div className="h-6 w-px bg-slate-200/60 dark:bg-slate-700 mx-0.5" />

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          title="Ajustes"
          className="p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-all active:scale-90"
        >
          <Settings size={16} strokeWidth={2} />
        </button>

        <div className="h-6 w-px bg-slate-200/60 dark:bg-slate-700 mx-0.5" />

        {/* PDF export + share */}
        <button
          onClick={onExportPdf}
          disabled={pdfExporting}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white font-bold rounded-[10px] hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95 whitespace-nowrap text-[13px] tracking-tight disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {pdfExporting ? <Loader2 size={14} strokeWidth={2.5} className="animate-spin" /> : <FileDown size={14} strokeWidth={2.5} />}
          <span className="hidden sm:inline">{pdfExporting ? 'Generando...' : 'Exportar PDF'}</span>
        </button>
        <button
          onClick={onShare}
          title={hasActiveShare ? 'Canvas compartido · gestionar enlace' : 'Compartir canvas (solo lectura)'}
          className="relative flex items-center gap-1.5 px-3.5 py-2 text-slate-600 dark:text-slate-300 font-bold rounded-[10px] hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-slate-200/60 dark:border-slate-700 hover:border-indigo-200/80 dark:hover:border-indigo-500/20 active:scale-95 whitespace-nowrap text-[13px] tracking-tight"
        >
          {hasActiveShare && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" />
          )}
          <Share2 size={14} strokeWidth={2.5} />
          <span className="hidden sm:inline">Compartir</span>
        </button>

        <div className="h-6 w-px bg-slate-200/60 dark:bg-slate-700 mx-0.5" />

        {/* User / sign-out */}
        <button
          onClick={onSignOut}
          title={`Cerrar sesión (${user?.email})`}
          className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-[10px] transition-all border border-transparent hover:border-rose-200/80 dark:hover:border-rose-500/20 active:scale-95"
        >
          <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 leading-none">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="hidden lg:inline max-w-[100px] truncate text-[12px] font-semibold">{user?.email}</span>
          <LogOut size={13} strokeWidth={2} className="shrink-0 opacity-50" />
        </button>
      </div>
    </motion.div>
  );
}
