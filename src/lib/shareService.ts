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
  const { data, error } = await supabase
    .from('canvas_shares')
    .insert({ canvas_id: canvasId })
    .select('id, canvas_id, token, created_at')
    .single();
  if (error) throw error;
  return data as ShareRow;
}

/** Retrieve the active share for a canvas (if one exists). */
export async function getShareForCanvas(canvasId: string): Promise<ShareRow | null> {
  const { data, error } = await supabase
    .from('canvas_shares')
    .select('id, canvas_id, token, created_at')
    .eq('canvas_id', canvasId)
    .maybeSingle();
  if (error) throw error;
  return data as ShareRow | null;
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
