import { supabase } from './supabase';

/** Shape of a canvas row as stored in Supabase. */
export interface CanvasRow {
  id: string;
  user_id: string;
  /** Present after migration 004. null = personal canvas; non-null = workspace canvas. */
  workspace_id: string | null;
  name: string;
  data: Record<string, string>;
  created_at: string;
  updated_at: string;
}

/**
 * Retrieve canvases scoped to the given workspace.
 * Pass `null` (default) to retrieve personal canvases (workspace_id IS NULL).
 */
export async function listCanvases(workspaceId: string | null = null): Promise<CanvasRow[]> {
  const base = supabase.from('canvases').select('*');
  const query = workspaceId === null
    ? base.is('workspace_id', null)
    : base.eq('workspace_id', workspaceId);
  const { data, error } = await query.order('updated_at', { ascending: false });
  if (error) throw error;
  return (data as CanvasRow[]) ?? [];
}

/**
 * Insert a new canvas row.
 * The caller is responsible for providing a UUID `id` (use `crypto.randomUUID()`).
 * Pass `workspaceId` to assign the canvas to a workspace; omit for a personal canvas.
 */
export async function createCanvas(
  id: string,
  name: string,
  data: Record<string, string> = {},
  workspaceId: string | null = null
): Promise<CanvasRow> {
  const payload: Record<string, unknown> = { id, name, data };
  if (workspaceId !== null) payload.workspace_id = workspaceId;
  const { data: row, error } = await supabase
    .from('canvases')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return row as CanvasRow;
}

/**
 * Partially update a canvas (name and/or data).
 * `updated_at` is refreshed automatically by a DB trigger.
 */
export async function updateCanvas(
  id: string,
  patch: { name?: string; data?: Record<string, string> }
): Promise<void> {
  const { error } = await supabase.from('canvases').update(patch).eq('id', id);
  if (error) throw error;
}

/** Permanently delete a canvas row. */
export async function deleteCanvas(id: string): Promise<void> {
  const { error } = await supabase.from('canvases').delete().eq('id', id);
  if (error) throw error;
}
