import { useState, useEffect, useCallback } from 'react';
import {
  listSnapshots,
  createSnapshot as createSnapshotRow,
  deleteSnapshot as deleteSnapshotRow,
  type SnapshotRow,
} from '../lib/snapshotService';
import type { CanvasData } from './useCanvases';

export type { SnapshotRow };

// ── Types ────────────────────────────────────────────────────────────────────

export interface UseCanvasSnapshotsReturn {
  snapshots: SnapshotRow[];
  loading: boolean;
  /** Re-fetch snapshots for the current canvas from Supabase. */
  refresh: () => Promise<void>;
  /**
   * Persist the given canvas data as a new snapshot.
   * Pass an optional human-readable label (defaults to 'manual').
   * The DB trigger caps storage at 20 snapshots per canvas.
   */
  createSnapshot: (data: CanvasData, label?: string) => Promise<void>;
  /** Remove a snapshot by ID. */
  deleteSnapshot: (id: string) => Promise<void>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Manages the snapshot history for a single canvas.
 *
 * Usage:
 *   const { snapshots, createSnapshot, deleteSnapshot } = useCanvasSnapshots(canvasId);
 *
 * To restore a snapshot, pass `snapshot.data` to `useCanvases().restoreProject(id, data)`.
 */
export function useCanvasSnapshots(canvasId: string | null): UseCanvasSnapshotsReturn {
  const [snapshots, setSnapshots] = useState<SnapshotRow[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!canvasId) return;
    setLoading(true);
    try {
      const rows = await listSnapshots(canvasId);
      setSnapshots(rows);
    } catch (err) {
      console.error('[useCanvasSnapshots] Failed to load snapshots:', err);
    } finally {
      setLoading(false);
    }
  }, [canvasId]);

  // Load whenever the target canvas changes.
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createSnapshot = useCallback(
    async (data: CanvasData, label = 'manual') => {
      if (!canvasId) return;
      const record: Record<string, string> = {};
      for (const [k, v] of Object.entries(data)) {
        record[k] = v as string;
      }
      try {
        const row = await createSnapshotRow(canvasId, record, label);
        // Optimistically prepend and enforce the client-side 20-row view cap.
        setSnapshots((prev) => [row, ...prev].slice(0, 20));
      } catch (err) {
        console.error('[useCanvasSnapshots] Failed to create snapshot:', err);
      }
    },
    [canvasId]
  );

  const deleteSnapshot = useCallback(async (id: string) => {
    try {
      await deleteSnapshotRow(id);
      setSnapshots((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('[useCanvasSnapshots] Failed to delete snapshot:', err);
    }
  }, []);

  return { snapshots, loading, refresh, createSnapshot, deleteSnapshot };
}
