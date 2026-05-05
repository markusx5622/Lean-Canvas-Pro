import { useState, useEffect, useCallback } from 'react';
import {
  createShare,
  getShareForCanvas,
  revokeShare,
  type ShareRow,
} from '../lib/shareService';

export interface UseCanvasSharingReturn {
  share: ShareRow | null;
  loading: boolean;
  creating: boolean;
  revoking: boolean;
  error: string | null;
  generateLink: () => Promise<void>;
  revokeLink: () => Promise<void>;
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

  useEffect(() => {
    if (!canvasId) {
      setShare(null);
      return;
    }
    setLoading(true);
    setError(null);
    getShareForCanvas(canvasId)
      .then((row) => setShare(row))
      .catch((err: unknown) => {
        console.error('[useCanvasSharing] Failed to fetch share:', err);
        setError('No se pudo cargar el estado de compartir.');
      })
      .finally(() => setLoading(false));
  }, [canvasId]);

  const generateLink = useCallback(async () => {
    if (!canvasId || creating) return;
    setCreating(true);
    setError(null);
    try {
      const row = await createShare(canvasId);
      setShare(row);
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
    } catch (err: unknown) {
      console.error('[useCanvasSharing] Failed to revoke share:', err);
      setError('No se pudo revocar el enlace. Inténtalo de nuevo.');
    } finally {
      setRevoking(false);
    }
  }, [share, revoking]);

  return { share, loading, creating, revoking, error, generateLink, revokeLink };
}
