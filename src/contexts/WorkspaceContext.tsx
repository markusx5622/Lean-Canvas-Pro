import React, { createContext, useContext, useState, useCallback } from 'react';
import { useWorkspaces } from '../hooks/useWorkspaces';
import type { WorkspaceRow } from '../hooks/useWorkspaces';

// ── Types ─────────────────────────────────────────────────────────────────────

interface WorkspaceContextValue {
  /** List of workspaces the user belongs to. */
  workspaces: WorkspaceRow[];
  workspacesLoading: boolean;
  /**
   * ID of the currently active workspace, or `null` for the Personal scope
   * (canvases with workspace_id IS NULL).
   */
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string | null) => void;
  createWs: (name: string) => Promise<string>;
  renameWs: (id: string, name: string) => Promise<void>;
  deleteWs: (id: string) => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { workspaces, loading, createWs, renameWs, deleteWs } = useWorkspaces();

  // null = Personal scope (no workspace selected)
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(null);

  const setActiveWorkspaceId = useCallback((id: string | null) => {
    setActiveWorkspaceIdState(id);
  }, []);

  const handleDeleteWs = useCallback(
    async (id: string) => {
      await deleteWs(id);
      // If the deleted workspace was active, fall back to Personal.
      setActiveWorkspaceIdState((prev) => (prev === id ? null : prev));
    },
    [deleteWs]
  );

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        workspacesLoading: loading,
        activeWorkspaceId,
        setActiveWorkspaceId,
        createWs,
        renameWs,
        deleteWs: handleDeleteWs,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useWorkspaceContext(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspaceContext must be used within a WorkspaceProvider');
  }
  return ctx;
}
