import { useState, useEffect, useCallback } from 'react';
import {
  createShare,
  getShareForCanvas,
  revokeShare,
  type ShareRow,
} from '../lib/shareService';
import { trackShareLinkCreated, trackShareLinkRevoked } from '../lib/analytics';

export interface UseCanvasSharingReturn {
  share: ShareRow | null;
  loading: boolean;
  creating: boolean;
  revoking: boolean;
  error: string | null;
  generateLink: () => Promise<void>;
  revokeLink: () => Promise<void>;
  refetch: () => void;
}

/**
 * Manages the read-only share state for a single canvas.
 * Re-fetches whenever `canvasId` changes.
 */
export function useCanvasSharing(canvasId: string | undefined): UseCanvasSharingReturn {
  const [share, setShare] = useState<ShareRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Increment to trigger a manual re-fetch without changing canvasId.
  const [fetchTick, setFetchTick] = useState(0);

  useEffect(() => {
    if (!canvasId) {
      setShare(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getShareForCanvas(canvasId)
      .then((row) => { if (!cancelled) setShare(row); })
      .catch((err: unknown) => {
        if (!cancelled) {
          console.error('[useCanvasSharing] Failed to fetch share:', err);
          setError('No se pudo cargar el estado de compartir.');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [canvasId, fetchTick]);

  /** Triggers a manual re-fetch of the share data by incrementing fetchTick. */
  const refetch = useCallback(() => setFetchTick((t) => t + 1), []);

  const generateLink = useCallback(async () => {
    if (!canvasId || creating) return;
    setCreating(true);
    setError(null);
    try {
      const row = await createShare(canvasId);
      setShare(row);
      trackShareLinkCreated();
    } catch (err: unknown) {
      console.error('[useCanvasSharing] Failed to create share:', err);
      setError('No se pudo generar el enlace. Inténtalo de nuevo.');
    } finally {
      setCreating(false);
    }
  }, [canvasId, creating]);

  const revokeLink = useCallback(async () => {
    if (!share || revoking) return;
    setRevoking(true);
    setError(null);
    try {
      await revokeShare(share.id);
      setShare(null);
      trackShareLinkRevoked();
    } catch (err: unknown) {
      console.error('[useCanvasSharing] Failed to revoke share:', err);
      setError('No se pudo revocar el enlace. Inténtalo de nuevo.');
    } finally {
      setRevoking(false);
    }
  }, [share, revoking]);

  return { share, loading, creating, revoking, error, generateLink, revokeLink, refetch };
}
