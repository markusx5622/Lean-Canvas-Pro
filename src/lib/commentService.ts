import { supabase } from './supabase';

/** Shape of a canvas_comments row as returned from Supabase. */
export interface CommentRow {
  id: string;
  canvas_id: string;
  block_id: number | null;
  author_name: string;
  body: string;
  created_at: string;
}

/**
 * Submit a comment via a public share token.
 * Calls the SECURITY DEFINER RPC so it works without authentication.
 *
 * @param token     - The canvas share token (from the /share/:token URL).
 * @param blockId   - Optional block number (1–9). Pass null for a general comment.
 * @param authorName - Display name of the reviewer (max 120 chars).
 * @param body      - Comment text (max 2 000 chars).
 */
export async function addComment(
  token: string,
  blockId: number | null,
  authorName: string,
  body: string
): Promise<CommentRow> {
  const { data, error } = await supabase.rpc('add_canvas_comment', {
    p_token: token,
    p_block_id: blockId ?? null,
    p_author_name: authorName,
    p_body: body,
  });
  if (error) throw error;
  const rows = data as CommentRow[];
  if (!rows || rows.length === 0) throw new Error('No comment returned');
  return rows[0];
}

/**
 * Fetch all comments for a canvas.
 * Requires authentication — only the canvas owner (or workspace members) can read.
 */
export async function listComments(canvasId: string): Promise<CommentRow[]> {
  const { data, error } = await supabase
    .from('canvas_comments')
    .select('id, canvas_id, block_id, author_name, body, created_at')
    .eq('canvas_id', canvasId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as CommentRow[]) ?? [];
}

/**
 * Delete a comment by ID.
 * Requires authentication — only the canvas owner can delete (enforced by RLS).
 */
export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase
    .from('canvas_comments')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
