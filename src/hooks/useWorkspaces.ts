import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  listWorkspaces,
  createWorkspace,
  renameWorkspace,
  deleteWorkspace,
  type WorkspaceRow,
} from '../lib/workspaceService';
import { trackWorkspaceCreated, trackWorkspaceDeleted } from '../lib/analytics';

export type { WorkspaceRow };

export interface UseWorkspacesReturn {
  workspaces: WorkspaceRow[];
  loading: boolean;
  createWs: (name: string) => Promise<string>;
  renameWs: (id: string, name: string) => Promise<void>;
  deleteWs: (id: string) => Promise<void>;
}

export function useWorkspaces(): UseWorkspacesReturn {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Load workspaces on user change.
  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    listWorkspaces()
      .then((rows) => setWorkspaces(rows))
      .catch((err) => console.error('[useWorkspaces] Failed to load:', err))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const createWs = useCallback(async (name: string): Promise<string> => {
    const row = await createWorkspace(name);
    setWorkspaces((prev) => [...prev, row]);
    trackWorkspaceCreated();
    return row.id;
  }, []);

  const renameWs = useCallback(async (id: string, name: string): Promise<void> => {
    await renameWorkspace(id, name);
    setWorkspaces((prev) =>
      prev.map((w) => (w.id === id ? { ...w, name } : w))
    );
  }, []);

  const deleteWs = useCallback(async (id: string): Promise<void> => {
    await deleteWorkspace(id);
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    trackWorkspaceDeleted();
  }, []);

  return { workspaces, loading, createWs, renameWs, deleteWs };
}
