import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useWorkspaces } from '../hooks/useWorkspaces';
import type { WorkspaceRow } from '../hooks/useWorkspaces';
import { useAuth } from './AuthContext';
import { deriveRole, type WorkspaceRole } from '../lib/permissions';

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
  /**
   * Role of the current user in the active workspace.
   * `null` when no workspace is selected (Personal scope).
   */
  userRole: WorkspaceRole | null;
  /** Shorthand: true when `userRole === 'owner'`. */
  isOwner: boolean;
}

// ── Context ───────────────────────────────────────────────────────────────────

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
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

  // Derive role from the active workspace's owner_id vs. the current user.
  const { userRole, isOwner } = useMemo(() => {
    if (!activeWorkspaceId) return { userRole: null, isOwner: false };
    const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
    const role = deriveRole(activeWorkspace?.owner_id, user?.id);
    return { userRole: role, isOwner: role === 'owner' };
  }, [activeWorkspaceId, workspaces, user?.id]);

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
        userRole,
        isOwner,
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
