import { supabase } from './supabase';

/** Shape of a canvas row as stored in Supabase. */
export interface CanvasRow {
  id: string;
  user_id: string;
  name: string;
  data: Record<string, string>;
  created_at: string;
  updated_at: string;
}

/** Retrieve all canvases for the authenticated user, ordered by most-recently updated. */
export async function listCanvases(): Promise<CanvasRow[]> {
  const { data, error } = await supabase
    .from('canvases')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data as CanvasRow[]) ?? [];
}

/**
 * Insert a new canvas row.
 * The caller is responsible for providing a UUID `id` (use `crypto.randomUUID()`).
 */
export async function createCanvas(
  id: string,
  name: string,
  data: Record<string, string> = {}
): Promise<CanvasRow> {
  const { data: row, error } = await supabase
    .from('canvases')
    .insert({ id, name, data })
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
