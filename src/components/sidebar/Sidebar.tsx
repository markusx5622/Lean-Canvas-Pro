import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Rocket,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  Settings,
  FileDown,
  Loader2,
  Layers,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Monitor,
  MessageSquare,
  FileText,
  Sparkles,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { Project } from '../../hooks/useCanvases';
import type { WorkspaceRow } from '../../hooks/useWorkspaces';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SidebarProps {
  // Context / identity
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  filledBlocks: number;
  progressPercentage: number;
  user: User | null;
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

  // Primary actions
  pdfExporting: boolean;
  hasActiveCanvas: boolean;
  feedbackCount: number;
  onAudit: () => void;
  onExportPdf: () => void;
  onPresent: () => void;
  onOpenFeedback: () => void;
  onOpenAiContentStudio: () => void;

  // Bottom zone
  onOpenSettings: () => void;
  onLogoClick: () => void;
  prefersReducedMotion: boolean | null | undefined;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 mb-[3px] ml-1 select-none">
      {children}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Sidebar({
  projects,
  activeProjectId,
  onSelectProject,
  filledBlocks,
  progressPercentage,
  user,
  prefersReducedMotion,
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
  onPresent,
  onLogoClick,
  onOpenFeedback,
  onOpenAiContentStudio,
  feedbackCount,
  pdfExporting,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  const activeWorkspaceName = activeWorkspaceId
    ? (workspaces.find((w) => w.id === activeWorkspaceId)?.name ?? 'Workspace')
    : 'Personal';

  const activeProjectName = projects.find((p) => p.id === activeProjectId)?.name ?? '';

  const handleWorkspaceChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    onSelectWorkspace(e.target.value === '' ? null : e.target.value);

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    onSelectProject(e.target.value);

  // ── Action item renderer ───────────────────────────────────────────────────

  const ActionItem = ({
    icon,
    label,
    onClick,
    disabled = false,
    badge,
    greenDot,
    spinning,
    ariaLabel,
  }: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    badge?: number;
    greenDot?: boolean;
    spinning?: boolean;
    /** Overrides the accessible name independently of the visible label. */
    ariaLabel?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={ariaLabel ?? label}
      aria-label={ariaLabel ?? label}
      className={
        collapsed
          ? `flex items-center justify-center relative w-full p-2.5 rounded-xl transition-all ${
              disabled
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/60 cursor-pointer'
            }`
          : `flex items-center gap-3 relative w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              disabled
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60 cursor-pointer'
            }`
      }
    >
      <span className="shrink-0 relative">
        {spinning ? (
          <Loader2 size={17} strokeWidth={2.5} className="animate-spin" />
        ) : (
          icon
        )}
        {greenDot && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border border-slate-900"
          />
        )}
        {badge !== undefined && badge > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-0.5 bg-indigo-600 text-white text-[8px] font-extrabold rounded-full flex items-center justify-center border border-slate-900 leading-none"
          >
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            key="label"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="overflow-hidden whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    /* Wrapper: relative + self-stretch so the sidebar always fills the full
       viewport height via flex-row alignment.  overflow-visible here lets
       the toggle button protrude past the right edge without being clipped. */
    <div className="relative shrink-0 self-stretch z-[90]">
      <motion.div
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col h-full bg-slate-900 dark:bg-slate-950 border-r border-slate-700/60 dark:border-slate-800 overflow-hidden"
      >

      {/* ── A. Top zone ─────────────────────────────────────────────────── */}
      <div className="pt-4 pb-3 border-b border-slate-700/60 dark:border-slate-800 flex flex-col gap-3 px-2">

        {/* Logo */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5 px-1'}`}>
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
              title="Lean Canvas Pro"
              whileHover={{ scale: 1.08, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
              whileTap={{ scale: 0.93, transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] } }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-[14px] shadow-lg shadow-indigo-600/40 hover:shadow-xl hover:shadow-indigo-600/50 relative group cursor-pointer overflow-hidden transition-[background-color,box-shadow] duration-300 will-change-transform"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[14px]"
              />
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

          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key="app-title"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18, ease: 'easeInOut' }}
                className="font-display font-extrabold text-white text-[14px] leading-tight tracking-tight whitespace-nowrap overflow-hidden"
              >
                Lean Canvas Pro
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Workspace selector */}
        {collapsed ? (
          <div className="flex justify-center">
            <button
              onClick={() => setCollapsed(false)}
              title={activeWorkspaceName}
              aria-label={`Workspace: ${activeWorkspaceName} – expandir para gestionar`}
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-700/60 transition-all cursor-pointer"
            >
              <Layers size={16} strokeWidth={2} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col px-1">
            <Label>Workspace</Label>
            <div className="flex items-center gap-1 rounded-xl p-0.5 hover:bg-slate-700/40 transition-all border border-transparent hover:border-slate-700">
              <div className="relative flex items-center flex-1 min-w-0">
                <Layers size={11} className="absolute left-2 text-indigo-400 pointer-events-none shrink-0" aria-hidden="true" />
                <select
                  value={activeWorkspaceId ?? ''}
                  onChange={handleWorkspaceChange}
                  aria-label="Seleccionar workspace"
                  className="appearance-none bg-transparent text-slate-300 font-bold text-[12px] py-1 pl-6 pr-5 focus:outline-none w-full cursor-pointer tracking-tight"
                >
                  <option value="" className="bg-slate-800 text-slate-200">Personal</option>
                  {workspaces.map((w) => (
                    <option key={w.id} value={w.id} className="bg-slate-800 text-slate-200">{w.name}</option>
                  ))}
                </select>
                <div aria-hidden="true" className="pointer-events-none absolute right-1 text-slate-500">
                  <svg className="w-[11px] h-[11px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {/* Workspace actions */}
              <div className="flex items-center shrink-0">
                <button
                  onClick={onCreateWorkspace}
                  aria-label="Crear workspace"
                  title="Crear workspace"
                  className="p-1 text-slate-500 hover:text-indigo-400 rounded-lg hover:bg-slate-700 transition-all"
                >
                  <Plus size={12} strokeWidth={2.5} />
                </button>
                {activeWorkspaceId && isWorkspaceOwner && (
                  <>
                    <button
                      onClick={onRenameWorkspace}
                      aria-label="Renombrar workspace"
                      title="Renombrar workspace"
                      className="p-1 text-slate-500 hover:text-slate-200 rounded-lg hover:bg-slate-700 transition-all"
                    >
                      <Edit2 size={12} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={onDeleteWorkspace}
                      aria-label="Eliminar workspace"
                      title="Eliminar workspace"
                      className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-700 transition-all"
                    >
                      <Trash2 size={12} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={onInviteToWorkspace}
                      aria-label="Invitar al workspace"
                      title="Invitar colaborador"
                      className="p-1 text-slate-500 hover:text-indigo-400 rounded-lg hover:bg-slate-700 transition-all"
                    >
                      <UserPlus size={12} strokeWidth={2.5} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Canvas selector */}
        {collapsed ? (
          <div className="flex justify-center">
            <button
              onClick={() => setCollapsed(false)}
              title={activeProjectName}
              aria-label={`Canvas: ${activeProjectName} – expandir para gestionar`}
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-700/60 transition-all cursor-pointer"
            >
              <FileText size={16} strokeWidth={2} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col px-1">
            <Label>{activeWorkspaceName}</Label>
            <div className="flex items-center gap-1 rounded-xl p-0.5 hover:bg-slate-700/40 transition-all border border-transparent hover:border-slate-700">
              <div className="relative flex items-center flex-1 min-w-0">
                <select
                  value={activeProjectId}
                  onChange={handleProjectChange}
                  aria-label="Seleccionar lienzo"
                  className="appearance-none bg-transparent text-slate-200 font-extrabold text-[13px] py-1 pl-2 pr-5 focus:outline-none w-full cursor-pointer tracking-tight"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-800 text-slate-200">{p.name}</option>
                  ))}
                </select>
                <div aria-hidden="true" className="pointer-events-none absolute right-1 text-slate-500">
                  <svg className="w-[11px] h-[11px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {/* Canvas actions */}
              <div className="flex items-center shrink-0">
                <button
                  onClick={onRenameProject}
                  aria-label="Renombrar lienzo"
                  title="Renombrar lienzo"
                  className="p-1 text-slate-500 hover:text-slate-200 rounded-lg hover:bg-slate-700 transition-all"
                >
                  <Edit2 size={12} strokeWidth={2.5} />
                </button>
                <button
                  onClick={onDeleteProject}
                  aria-label="Eliminar lienzo"
                  title="Eliminar lienzo"
                  className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-700 transition-all"
                >
                  <Trash2 size={12} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── B. Middle zone ──────────────────────────────────────────────── */}
      <div className="flex-1 py-3 flex flex-col overflow-y-auto overflow-x-hidden px-2">
        <div className="flex flex-col gap-0.5">
          <ActionItem
            icon={<Plus size={17} strokeWidth={2.5} />}
            label="Nuevo lienzo"
            onClick={onCreateProject}
          />
          <ActionItem
            icon={<ShieldCheck size={17} strokeWidth={2.5} />}
            label="Auditoría Estratégica"
            onClick={onAudit}
            disabled={filledBlocks === 0}
            ariaLabel={filledBlocks === 0 ? 'Auditoría Estratégica (completa al menos un bloque para activar)' : 'Auditoría Estratégica'}
          />
          <ActionItem
            icon={<FileDown size={17} strokeWidth={2.5} />}
            label={pdfExporting ? 'Generando...' : 'Exportar PDF'}
            onClick={onExportPdf}
            disabled={pdfExporting || !hasActiveCanvas}
            spinning={pdfExporting}
          />
          <ActionItem
            icon={<Monitor size={17} strokeWidth={2} />}
            label="Presentar"
            onClick={onPresent}
            disabled={!hasActiveCanvas}
          />
          <ActionItem
            icon={<MessageSquare size={17} strokeWidth={2.5} />}
            label="Feedback"
            onClick={onOpenFeedback}
            disabled={!hasActiveCanvas}
            badge={feedbackCount}
          />
          <ActionItem
            icon={<Sparkles size={17} strokeWidth={2.2} />}
            label="Centro IA"
            onClick={onOpenAiContentStudio}
            disabled={!hasActiveCanvas}
            ariaLabel={hasActiveCanvas ? 'Abrir centro IA del canvas' : 'Centro IA (activa un lienzo para usar)'}
          />
        </div>

        {/* Progress */}
        <div className="mt-auto pt-4">
          {collapsed ? (
            <div className="flex justify-center">
              <span
                title={`Validación: ${filledBlocks}/9 bloques · ${progressPercentage}%`}
                className={`text-[10px] font-extrabold tabular-nums ${progressPercentage === 100 ? 'text-emerald-400' : 'text-slate-400'}`}
              >
                {progressPercentage}%
              </span>
            </div>
          ) : (
            <div className="px-1 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Validación
                </span>
                <span className={`text-[11px] font-extrabold tabular-nums ${progressPercentage === 100 ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {filledBlocks}/9 · {progressPercentage}%
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Validación de la startup: ${filledBlocks} de 9 bloques completados (${progressPercentage}%)`}
                className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full ${progressPercentage === 100 ? 'bg-emerald-500 shadow-[0_0_8px_rgb(16,185,129,0.5)]' : 'bg-indigo-500'}`}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── C. Bottom zone ──────────────────────────────────────────────── */}
      <div className="pt-3 pb-4 border-t border-slate-700/60 dark:border-slate-800 flex flex-col gap-0.5 px-2">
        {/* Settings */}
        <button
          onClick={onOpenSettings}
          aria-label="Ajustes"
          title="Ajustes"
          className={
            collapsed
              ? 'flex items-center justify-center w-full p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all cursor-pointer'
              : 'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-700/60 transition-all cursor-pointer'
          }
        >
          <Settings size={17} strokeWidth={2} className="shrink-0" />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key="settings-label"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18, ease: 'easeInOut' }}
                className="overflow-hidden whitespace-nowrap"
              >
                Ajustes
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* User avatar */}
        <button
          onClick={onOpenSettings}
          aria-label={`Usuario: ${user?.email ?? ''} · Abrir ajustes`}
          title={`Usuario: ${user?.email ?? ''}`}
          className={
            collapsed
              ? 'flex items-center justify-center w-full p-2 rounded-xl transition-all hover:bg-slate-700/60 cursor-pointer'
              : 'flex items-center gap-3 w-full px-2.5 py-2 rounded-xl transition-all hover:bg-slate-700/60 cursor-pointer'
          }
        >
          <div
            aria-hidden="true"
            className="w-7 h-7 rounded-full bg-indigo-900/60 border border-indigo-700/50 flex items-center justify-center shrink-0"
          >
            <span className="text-[11px] font-extrabold text-indigo-300 leading-none">
              {user?.email?.charAt(0).toUpperCase() ?? '?'}
            </span>
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key="user-email"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18, ease: 'easeInOut' }}
                className="overflow-hidden whitespace-nowrap text-[11px] text-slate-400 font-medium truncate max-w-[130px]"
              >
                {user?.email ?? ''}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>

    {/* Toggle button lives OUTSIDE the overflow-hidden motion.div so it is
        never clipped, but still positioned relative to the sidebar wrapper. */}
    <button
      onClick={() => setCollapsed((c: boolean) => !c)}
      aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
      title={collapsed ? 'Expandir' : 'Colapsar'}
      className="absolute top-4 -right-3 z-10 w-6 h-6 rounded-full bg-slate-700 hover:bg-indigo-600 text-slate-300 hover:text-white flex items-center justify-center shadow-lg border border-slate-600 transition-all"
    >
      {collapsed ? <ChevronRight size={12} strokeWidth={2.5} /> : <ChevronLeft size={12} strokeWidth={2.5} />}
    </button>
  </div>
  );
}
