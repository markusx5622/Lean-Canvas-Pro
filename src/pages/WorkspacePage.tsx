import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, useReducedMotion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useCanvases } from '../hooks/useCanvases';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { evaluateCanvas, evaluateBlock as evaluateBlockHeuristic } from '../evaluator';
import type { EvaluationResult, BlockFeedback, BlockId } from '../evaluator';
import { exportCanvasToPdf } from '../lib/exportPdf';
import { useCanvasSharing } from '../hooks/useCanvasSharing';
import { trackStrategicAuditRun, trackPdfExported } from '../lib/analytics';
import { ParticleBackground } from '../ParticleBackground';
import { Toolbar } from '../components/toolbar/Toolbar';
import { CanvasGrid } from '../components/canvas/CanvasGrid';
import { EditorPanel } from '../components/editor/EditorPanel';
import { MobileEditor } from '../components/editor/MobileEditor';
import { AboutDialog } from '../components/dialogs/AboutDialog';
import { AuditDialog } from '../components/dialogs/AuditDialog';
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog';
import { PromptDialog } from '../components/dialogs/PromptDialog';
import { SettingsModal } from '../components/dialogs/SettingsModal';
import { ShareModal } from '../components/ShareModal';
import { SplashPage } from './SplashPage';
import { BLOCKS } from '../data/blocks';

// ── Helpers ───────────────────────────────────────────────────────────────────

const VALID_BLOCK_IDS: BlockId[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function asBlockId(id: number): BlockId | null {
  return (VALID_BLOCK_IDS as number[]).includes(id) ? (id as BlockId) : null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function WorkspacePage() {
  const { user, signOut } = useAuth();
  const {
    projects,
    loading: canvasLoading,
    createProject,
    renameProject,
    deleteProject,
    clearProject,
    updateBlock,
    importProject,
  } = useCanvases();

  const [activeProjectId, setActiveProjectId] = useLocalStorage<string>('lean-canvas-pro-active', '');
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'guide' | 'examples'>('guide');
  const [editorText, setEditorText] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('lean-canvas-pro-theme', 'light');
  const [auditResult, setAuditResult] = useState<EvaluationResult | null>(null);
  const [blockAuditResult, setBlockAuditResult] = useState<BlockFeedback | null>(null);
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [canvasEntryKey, setCanvasEntryKey] = useState(0);
  const [pdfExporting, setPdfExporting] = useState(false);

  // ── Dialog state ─────────────────────────────────────────────────────────────
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ title: string; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  /** Tracks any unsaved text so it can be flushed immediately on block/project switch. */
  const dirtyRef = useRef<{ projectId: string; blockId: number; text: string } | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];
  const canvasData = activeProject?.data || {};

  const filledBlocks = Object.values(canvasData).filter(
    (val) => typeof val === 'string' && (val as string).trim().length > 0
  ).length;
  const progressPercentage = Math.round((filledBlocks / 9) * 100);

  // Sharing state — lifted here so Toolbar can show the active-share indicator
  // without a separate DB fetch, and ShareModal reuses the same state.
  const sharing = useCanvasSharing(activeProject?.id);

  // ── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Keep activeProjectId valid whenever the project list changes.
  useEffect(() => {
    if (!canvasLoading && projects.length > 0) {
      if (!projects.some((p) => p.id === activeProjectId)) {
        setActiveProjectId(projects[0].id);
      }
    }
  // Intentionally omit activeProjectId to avoid a loop.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasLoading, projects]);

  useEffect(() => {
    const shouldLock = showSplash || showAboutDialog || showSettingsModal || !!auditResult;
    if (!shouldLock) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [showSplash, showAboutDialog, auditResult]);

  /** Immediately persists any dirty text (used when switching context). */
  const flushPendingSave = useCallback(() => {
    const pending = dirtyRef.current;
    if (!pending) return;
    dirtyRef.current = null;
    updateBlock(pending.projectId, pending.blockId, pending.text).catch((err) => {
      console.error('[autosave] Background flush failed:', err);
    });
  }, [updateBlock]);

  useEffect(() => {
    if (selectedBlockId) {
      flushPendingSave();
      setEditorText(canvasData[selectedBlockId] || '');
      setActiveTab('guide');
      setSaveStatus('idle');
      setBlockAuditResult(null);
    }
  }, [selectedBlockId, activeProjectId, flushPendingSave]);

  // Autosave: debounced 800 ms.
  useEffect(() => {
    if (!selectedBlockId || !activeProject) return;
    const currentData = canvasData[selectedBlockId] || '';
    if (editorText === currentData) {
      dirtyRef.current = null;
      return;
    }

    dirtyRef.current = { projectId: activeProjectId, blockId: selectedBlockId, text: editorText };
    setSaveStatus('saving');

    const timerId = setTimeout(() => {
      const pending = dirtyRef.current;
      if (!pending) return;
      dirtyRef.current = null;
      updateBlock(pending.projectId, pending.blockId, pending.text)
        .then(() => {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus((s) => (s === 'saved' ? 'idle' : s)), 2000);
        })
        .catch((err: unknown) => {
          console.error('[autosave] Save failed:', err);
          setSaveStatus('error');
          setTimeout(() => setSaveStatus((s) => (s === 'error' ? 'idle' : s)), 3000);
        });
    }, 800);

    return () => clearTimeout(timerId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorText, updateBlock]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleCreateProject = () => {
    const newId = createProject();
    setActiveProjectId(newId);
    setSelectedBlockId(null);
  };

  const handleRenameProject = () => {
    setShowRenameDialog(true);
  };

  const handleDeleteProject = () => {
    if (projects.length <= 1) {
      setAlertMessage({ title: 'Acción no permitida', message: 'No puedes borrar tu único lienzo.' });
      return;
    }
    setShowDeleteConfirm(true);
  };

  const handleClearCanvas = () => {
    setShowClearConfirm(true);
  };

  const handleExportJson = () => {
    if (!activeProject) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeProject, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `canvas-${activeProject.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (importedData && typeof importedData === 'object' && importedData.data) {
          const newId = importProject(`${importedData.name || 'Importado'}`, importedData.data);
          setActiveProjectId(newId);
          setSelectedBlockId(null);
        }
      } catch {
        setAlertMessage({ title: 'Error al importar', message: 'El archivo no es un JSON válido o no tiene el formato esperado.' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportPdf = async () => {
    if (!activeProject || pdfExporting) return;
    setPdfExporting(true);
    try {
      await exportCanvasToPdf(activeProject);
      trackPdfExported();
    } catch (err) {
      console.error('[exportPdf] Failed to generate PDF:', err);
      setAlertMessage({ title: 'Error al exportar', message: 'No se pudo generar el PDF. Inténtalo de nuevo.' });
    } finally {
      setPdfExporting(false);
    }
  };

  const runCanvasAudit = () => {
    if (filledBlocks === 0) return;
    const result = evaluateCanvas(canvasData as Record<number, string>);
    setAuditResult(result);
    trackStrategicAuditRun(filledBlocks);
  };

  const runBlockAudit = () => {
    if (!editorText.trim() || !selectedBlockId) return;
    const blockId = asBlockId(selectedBlockId);
    if (!blockId) return;
    const result = evaluateBlockHeuristic(blockId, { ...canvasData, [blockId]: editorText } as Record<number, string>);
    setBlockAuditResult(result);
  };

  const selectedBlock = BLOCKS.find((b) => b.id === selectedBlockId);

  // Show spinner while cloud canvases are first fetched with no local cache.
  if (canvasLoading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-[#F4F5F8] dark:bg-slate-950 flex items-center justify-center" role="status" aria-label="Cargando espacio de trabajo">
        <svg aria-hidden="true" className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F4F5F8] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex justify-center pb-16 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-500">
      <ParticleBackground theme={theme} />
      {/* Ambient glow blobs — same system used on landing and auth pages */}
      <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px]" />
        <div className="absolute top-[30%] -right-[15%] w-[40%] h-[60%] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-[0%] left-[20%] w-[60%] h-[40%] rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-[120px]" />
      </div>

      {/* Splash screen */}
      <AnimatePresence>
        {showSplash && (
          <SplashPage
            theme={theme}
            prefersReducedMotion={prefersReducedMotion}
            onEnter={() => { setShowSplash(false); setCanvasEntryKey((prev) => prev + 1); }}
          />
        )}
      </AnimatePresence>

      {/* Hidden file input for JSON import */}
      <label className="sr-only" htmlFor="json-import-input">Importar canvas desde JSON</label>
      <input id="json-import-input" type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImportJson} />

      <style dangerouslySetInnerHTML={{ __html: '::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }' }} />

      <div className="w-full max-w-[1360px] px-4 md:px-8 py-5 flex flex-col gap-6 relative">

        <Toolbar
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={(id) => { setActiveProjectId(id); setSelectedBlockId(null); }}
          filledBlocks={filledBlocks}
          progressPercentage={progressPercentage}
          pdfExporting={pdfExporting}
          user={user}
          prefersReducedMotion={prefersReducedMotion}
          hasActiveShare={sharing.share !== null}
          onCreateProject={handleCreateProject}
          onRenameProject={handleRenameProject}
          onDeleteProject={handleDeleteProject}
          onAudit={runCanvasAudit}
          onOpenSettings={() => setShowSettingsModal(true)}
          onExportPdf={handleExportPdf}
          onShare={() => setShowShareModal(true)}
          onSignOut={signOut}
          onLogoClick={() => setShowSplash(true)}
        />

        {/* Dialogs */}
        <AnimatePresence>
          {showAboutDialog && <AboutDialog onClose={() => setShowAboutDialog(false)} />}
        </AnimatePresence>

        <AnimatePresence>
          {showSettingsModal && activeProject && (
            <SettingsModal
              theme={theme}
              canvasName={activeProject.name}
              onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              onExportJson={handleExportJson}
              onImportJson={() => fileInputRef.current?.click()}
              onOpenAbout={() => setShowAboutDialog(true)}
              onClearCanvas={handleClearCanvas}
              onClose={() => setShowSettingsModal(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {auditResult && <AuditDialog auditResult={auditResult} onClose={() => setAuditResult(null)} />}
        </AnimatePresence>

        <AnimatePresence>
          {showShareModal && activeProject && (
            <ShareModal
              canvasName={activeProject.name}
              sharing={sharing}
              onClose={() => setShowShareModal(false)}
            />
          )}
        </AnimatePresence>

        {/* Rename dialog */}
        <AnimatePresence>
          {showRenameDialog && activeProject && (
            <PromptDialog
              title="Renombrar lienzo"
              label="Nombre del proyecto"
              initialValue={activeProject.name}
              confirmLabel="Guardar"
              onConfirm={(newName) => {
                if (newName !== activeProject.name) {
                  renameProject(activeProjectId, newName);
                }
                setShowRenameDialog(false);
              }}
              onCancel={() => setShowRenameDialog(false)}
            />
          )}
        </AnimatePresence>

        {/* Delete confirm dialog */}
        <AnimatePresence>
          {showDeleteConfirm && activeProject && (
            <ConfirmDialog
              title="Eliminar lienzo"
              message={`¿Eliminar '${activeProject.name}'? Esta acción no se puede deshacer.`}
              confirmLabel="Eliminar"
              variant="danger"
              onConfirm={() => {
                const remaining = projects.filter((p) => p.id !== activeProjectId);
                deleteProject(activeProjectId);
                setActiveProjectId(remaining[0].id);
                setSelectedBlockId(null);
                setShowDeleteConfirm(false);
              }}
              onCancel={() => setShowDeleteConfirm(false)}
            />
          )}
        </AnimatePresence>

        {/* Clear canvas confirm dialog */}
        <AnimatePresence>
          {showClearConfirm && (
            <ConfirmDialog
              title="Borrar contenido"
              message="¿Seguro que quieres borrar este lienzo? Se perderá todo el texto actual."
              confirmLabel="Borrar todo"
              variant="danger"
              onConfirm={() => {
                clearProject(activeProjectId);
                if (selectedBlockId) setEditorText('');
                setShowClearConfirm(false);
              }}
              onCancel={() => setShowClearConfirm(false)}
            />
          )}
        </AnimatePresence>

        {/* Alert dialog */}
        <AnimatePresence>
          {alertMessage && (
            <ConfirmDialog
              title={alertMessage.title}
              message={alertMessage.message}
              confirmLabel="Entendido"
              alertOnly
              onConfirm={() => setAlertMessage(null)}
            />
          )}
        </AnimatePresence>

        {/* Main layout: canvas grid + editor panel */}
        <div className="flex flex-col lg:flex-row gap-5 items-stretch relative md:px-2 pt-2">
          <CanvasGrid
            canvasData={canvasData}
            selectedBlockId={selectedBlockId}
            canvasEntryKey={canvasEntryKey}
            onSelectBlock={setSelectedBlockId}
          />

          <EditorPanel
            selectedBlock={selectedBlock}
            editorText={editorText}
            onChangeText={setEditorText}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            saveStatus={saveStatus}
            blockAuditResult={blockAuditResult}
            onAuditBlock={runBlockAudit}
          />
        </div>

        {/* Mobile editor bottom sheet */}
        {selectedBlockId && selectedBlock && (
          <MobileEditor
            selectedBlock={selectedBlock}
            editorText={editorText}
            onChangeText={setEditorText}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            saveStatus={saveStatus}
            blockAuditResult={blockAuditResult}
            onAuditBlock={runBlockAudit}
            onClose={() => setSelectedBlockId(null)}
          />
        )}

      </div>
    </div>
  );
}
