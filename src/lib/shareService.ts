import { supabase } from './supabase';

/** Shape of a canvas_shares row as returned from Supabase. */
export interface ShareRow {
  id: string;
  canvas_id: string;
  token: string;
  created_at: string;
}

/** Minimal canvas data returned by the public share token lookup. */
export interface SharedCanvasRow {
  id: string;
  name: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * Create a share record for a canvas (one per canvas, enforced by DB unique constraint).
 * Returns the new row including the generated token.
 */
export async function createShare(canvasId: string): Promise<ShareRow> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('canvas_shares')
    .insert({ canvas_id: canvasId, user_id: user.id })
    .select('id, canvas_id, token, created_at')
    .single();
  if (error) throw error;
  return data as ShareRow;
}

/** Retrieve the active share for a canvas (if one exists). */
export async function getShareForCanvas(canvasId: string): Promise<ShareRow | null> {
  // Use .limit(1) instead of .maybeSingle() to avoid PostgREST
  // Accept: application/vnd.pgrst.object+json semantics, which can
  // return a 406/404 error on some Supabase versions when 0 rows match.
  const { data, error } = await supabase
    .from('canvas_shares')
    .select('id, canvas_id, token, created_at')
    .eq('canvas_id', canvasId)
    .limit(1);
  if (error) throw error;
  if (!data || data.length === 0) return null;
  return data[0] as ShareRow;
}

/** Delete a share record, effectively revoking the link. */
export async function revokeShare(shareId: string): Promise<void> {
  const { error } = await supabase
    .from('canvas_shares')
    .delete()
    .eq('id', shareId);
  if (error) throw error;
}

/**
 * Fetch canvas data using a public share token.
 * This calls the SECURITY DEFINER RPC so it works without authentication.
 */
export async function getCanvasByShareToken(token: string): Promise<SharedCanvasRow | null> {
  const { data, error } = await supabase
    .rpc('get_canvas_by_share_token', { p_token: token });
  if (error) throw error;
  if (!data || (data as SharedCanvasRow[]).length === 0) return null;
  return (data as SharedCanvasRow[])[0];
}
