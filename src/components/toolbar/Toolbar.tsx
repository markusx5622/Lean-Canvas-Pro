import React from 'react';
import { motion } from 'motion/react';
import {
  Rocket, Plus, Edit2, Trash2, ShieldCheck, Settings,
  FileDown, Share2, Loader2, Layers, ChevronRight, UserPlus, Monitor, MessageSquare,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { Project } from '../../hooks/useCanvases';
import type { WorkspaceRow } from '../../hooks/useWorkspaces';

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
  /** Whether there is an active canvas — used to disable canvas-specific actions. */
  hasActiveCanvas: boolean;
  workspaces: WorkspaceRow[];
  activeWorkspaceId: string | null;
  onSelectWorkspace: (id: string | null) => void;
  onCreateWorkspace: () => void;
  onRenameWorkspace: () => void;
  onDeleteWorkspace: () => void;
  onInviteToWorkspace: () => void;
  isWorkspaceOwner: boolean;
  onCreateProject: () => void;
  onRenameProject: () => void;
  onDeleteProject: () => void;
  onAudit: () => void;
  onOpenSettings: () => void;
  onExportPdf: () => void;
  onShare: () => void;
  onPresent: () => void;
  onLogoClick: () => void;
  onOpenFeedback: () => void;
  feedbackCount: number;
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
  hasActiveCanvas,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  onRenameWorkspace,
  onDeleteWorkspace,
  onInviteToWorkspace,
  isWorkspaceOwner,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  onAudit,
  onOpenSettings,
  onExportPdf,
  onShare,
  onPresent,
  onLogoClick,
  onOpenFeedback,
  feedbackCount,
}: ToolbarProps) {
  const activeWorkspaceName = activeWorkspaceId
    ? (workspaces.find((w) => w.id === activeWorkspaceId)?.name ?? 'Workspace')
    : 'Personal';
  const handleWorkspaceChange = (e: { target: { value: string } }) =>
    onSelectWorkspace(e.target.value === '' ? null : e.target.value);
  const handleProjectChange = (e: { target: { value: string } }) =>
    onSelectProject(e.target.value);
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border text-sm border-slate-200/60 dark:border-slate-700 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] rounded-[20px] py-3.5 px-6 flex flex-col md:flex-row items-center justify-between gap-3 sticky top-4 z-[100]"
    >
      {/* Logo & workspace + project selectors */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="relative shrink-0">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 rounded-[14px] bg-indigo-500 pointer-events-none"
            animate={prefersReducedMotion ? {} : { scale: [1, 1.55, 1.55], opacity: [0.5, 0, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 rounded-[14px] bg-indigo-400 pointer-events-none"
            animate={prefersReducedMotion ? {} : { scale: [1, 1.35, 1.35], opacity: [0.3, 0, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeOut', delay: 0.7 }}
          />
          <motion.button
            onClick={onLogoClick}
            aria-label="Lean Canvas Pro – volver al inicio"
            whileHover={{ scale: 1.08, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
            whileTap={{ scale: 0.93, transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] } }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-[14px] shadow-lg shadow-indigo-600/40 hover:shadow-xl hover:shadow-indigo-600/50 relative group cursor-pointer overflow-hidden transition-[background-color,box-shadow] duration-300 will-change-transform"
          >
            <div aria-hidden="true" className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[14px]" />
            <motion.div
              aria-hidden="true"
              animate={prefersReducedMotion ? {} : { y: [0, -3], rotate: [0, 8] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', repeatType: 'mirror' }}
              className="relative z-10"
            >
              <Rocket size={18} strokeWidth={2.5} />
            </motion.div>
          </motion.button>
        </div>

        {/* Workspace selector */}
        <div className="flex flex-col relative group">
          <div className="text-[9px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-[2px] ml-[5px]">
            Workspace
          </div>
          <div className="flex items-center gap-1 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl p-0.5 transition-all border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700">
            <div className="relative flex items-center">
              <Layers size={12} className="absolute left-2 text-indigo-500 pointer-events-none" aria-hidden="true" />
              <select
                value={activeWorkspaceId ?? ''}
                onChange={handleWorkspaceChange}
                aria-label="Seleccionar workspace"
                className="font-display appearance-none bg-transparent text-slate-700 dark:text-slate-300 font-bold text-[13px] py-1 pl-7 pr-8 focus:outline-none min-w-[110px] max-w-[150px] cursor-pointer tracking-tight"
              >
                <option value="" className="dark:bg-slate-800 dark:text-slate-200">Personal</option>
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id} className="dark:bg-slate-800 dark:text-slate-200">{w.name}</option>
                ))}
              </select>
              <div aria-hidden="true" className="pointer-events-none absolute right-2 text-slate-400 dark:text-slate-500 transition-colors group-hover:text-slate-600 dark:group-hover:text-slate-400">
                <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="flex items-center">
              <button onClick={onCreateWorkspace} aria-label="Crear workspace" title="Crear workspace" className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all active:scale-90">
                <Plus size={13} strokeWidth={2.5} />
              </button>
              {activeWorkspaceId && isWorkspaceOwner && (
                <>
                  <button onClick={onRenameWorkspace} aria-label="Renombrar workspace" title="Renombrar workspace" className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all active:scale-90">
                    <Edit2 size={13} strokeWidth={2.5} />
                  </button>
                  <button onClick={onDeleteWorkspace} aria-label="Eliminar workspace" title="Eliminar workspace" className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all active:scale-90">
                    <Trash2 size={13} strokeWidth={2.5} />
                  </button>
                  <button onClick={onInviteToWorkspace} aria-label="Invitar al workspace" title="Invitar colaborador" className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all active:scale-90">
                    <UserPlus size={13} strokeWidth={2.5} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Breadcrumb divider */}
        <ChevronRight size={14} className="hidden lg:block text-slate-300 dark:text-slate-600 shrink-0" aria-hidden="true" />

        {/* Canvas selector */}
        <div className="flex flex-col relative w-full group">
          <div className="text-[9px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-[2px] ml-[5px]">
            {activeWorkspaceName}
          </div>
          <div className="flex items-center gap-1 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl p-0.5 transition-all border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700">
            <div className="relative flex items-center">
              <select
                value={activeProjectId}
                onChange={handleProjectChange}
                aria-label="Seleccionar lienzo"
                className="font-display appearance-none bg-transparent text-slate-800 dark:text-slate-200 font-extrabold text-[15px] py-1 pl-2 pr-8 focus:outline-none min-w-[150px] cursor-pointer tracking-tight"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="dark:bg-slate-800 dark:text-slate-200">{p.name}</option>
                ))}
              </select>
              <div aria-hidden="true" className="pointer-events-none absolute right-2 text-slate-400 dark:text-slate-500 transition-colors group-hover:text-slate-600 dark:group-hover:text-slate-400">
                <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="flex items-center">
              <button onClick={onRenameProject} aria-label="Renombrar lienzo" className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm shadow-transparent hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-transparent hover:border-slate-200 dark:hover:border-slate-700 active:scale-90">
                <Edit2 size={13} strokeWidth={2.5} />
              </button>
              <button onClick={onDeleteProject} aria-label="Eliminar lienzo" className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm shadow-transparent hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-transparent hover:border-slate-200 dark:hover:border-slate-700 active:scale-90">
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
      <div className="hidden md:flex flex-col flex-1 max-w-[280px] gap-1.5 px-1">
        <div className="flex w-full items-center justify-between gap-3" aria-hidden="true">
          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
            Validación de la Startup
          </span>
          <span className={`text-[12px] font-extrabold shrink-0 tabular-nums ${progressPercentage === 100 ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-300'}`}>
            {progressPercentage}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Validación de la startup: ${progressPercentage}%`}
          className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full ${progressPercentage === 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgb(16,185,129,0.5)]' : 'bg-indigo-600 dark:bg-indigo-500'}`}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
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

        <div className="h-6 w-px bg-slate-200/60 dark:bg-slate-700 mx-1" />

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          aria-label="Ajustes"
          title="Ajustes"
          className="flex items-center gap-1.5 px-2.5 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 rounded-[10px] transition-all active:scale-90 text-[12px] font-bold"
        >
          <Settings size={15} strokeWidth={2} />
          <span className="hidden lg:inline">Ajustes</span>
        </button>

        <div className="h-6 w-px bg-slate-200/60 dark:bg-slate-700 mx-1" />

        {/* PDF export + share */}
        <button
          onClick={onExportPdf}
          disabled={pdfExporting || !hasActiveCanvas}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white font-bold rounded-[10px] hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95 whitespace-nowrap text-[13px] tracking-tight disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {pdfExporting ? <Loader2 size={14} strokeWidth={2.5} className="animate-spin" /> : <FileDown size={14} strokeWidth={2.5} />}
          <span className="hidden sm:inline">{pdfExporting ? 'Generando...' : 'Exportar PDF'}</span>
        </button>
        <button
          onClick={onShare}
          disabled={!hasActiveCanvas}
          aria-label={hasActiveShare ? 'Canvas compartido · gestionar enlace' : 'Compartir canvas (solo lectura)'}
          title={hasActiveShare ? 'Canvas compartido · gestionar enlace' : 'Compartir canvas (solo lectura)'}
          className="relative flex items-center px-2.5 py-2 text-slate-600 dark:text-slate-300 font-bold rounded-[10px] hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-slate-200/60 dark:border-slate-700 hover:border-indigo-200/80 dark:hover:border-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {hasActiveShare && (
            <span aria-hidden="true" className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" />
          )}
          <Share2 size={15} strokeWidth={2.5} />
        </button>

        <button
          onClick={onOpenFeedback}
          disabled={!hasActiveCanvas}
          aria-label={feedbackCount > 0 ? `Ver feedback (${feedbackCount} comentarios)` : 'Ver feedback de revisores'}
          title={feedbackCount > 0 ? `Feedback · ${feedbackCount} comentario${feedbackCount === 1 ? '' : 's'}` : 'Ver feedback de revisores'}
          className="relative flex items-center px-2.5 py-2 text-slate-600 dark:text-slate-300 font-bold rounded-[10px] hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-slate-200/60 dark:border-slate-700 hover:border-indigo-200/80 dark:hover:border-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {feedbackCount > 0 && (
            <span aria-hidden="true" className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-indigo-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border border-white dark:border-slate-800 leading-none">
              {feedbackCount > 99 ? '99+' : feedbackCount}
            </span>
          )}
          <MessageSquare size={15} strokeWidth={2.5} />
        </button>

        <button
          onClick={onPresent}
          disabled={!hasActiveCanvas}
          aria-label="Modo presentación"
          title="Modo presentación"
          className="flex items-center gap-1.5 px-2.5 py-2 text-slate-600 dark:text-slate-300 font-bold rounded-[10px] hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-slate-200/60 dark:border-slate-700 hover:border-indigo-200/80 dark:hover:border-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Monitor size={15} strokeWidth={2} />
          <span className="hidden lg:inline">Presentar</span>
        </button>

        {/* User avatar (compact) */}
        <button
          onClick={onOpenSettings}
          aria-label={`Usuario: ${user?.email} · Abrir ajustes`}
          title={`Usuario: ${user?.email}`}
          className="mr-0.5 flex items-center p-1 rounded-[10px] transition-all hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95"
        >
          <div aria-hidden="true" className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
            <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 leading-none">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
        </button>
      </div>
    </motion.div>
  );
}
