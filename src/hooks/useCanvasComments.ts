import { useState, useEffect, useCallback } from 'react';
import { listComments, deleteComment, type CommentRow } from '../lib/commentService';

export interface UseCanvasCommentsReturn {
  comments: CommentRow[];
  loading: boolean;
  deleting: string | null;
  error: string | null;
  refetch: () => void;
  removeComment: (id: string) => Promise<void>;
}

/**
 * Fetches and manages comments for a canvas.
 * Intended for use by the authenticated canvas owner.
 */
export function useCanvasComments(canvasId: string | undefined): UseCanvasCommentsReturn {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchTick, setFetchTick] = useState(0);

  useEffect(() => {
    if (!canvasId) {
      setComments([]);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    listComments(canvasId)
      .then((rows) => { if (!cancelled) setComments(rows); })
      .catch((err: unknown) => {
        if (!cancelled) {
          console.error('[useCanvasComments] Failed to load comments:', err);
          setError('No se pudieron cargar los comentarios.');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [canvasId, fetchTick]);

  const refetch = useCallback(() => setFetchTick((t) => t + 1), []);

  const removeComment = useCallback(async (id: string) => {
    setDeleting(id);
    setError(null);
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      console.error('[useCanvasComments] Failed to delete comment:', err);
      setError('No se pudo eliminar el comentario.');
    } finally {
      setDeleting(null);
    }
  }, []);

  return { comments, loading, deleting, error, refetch, removeComment };
}
