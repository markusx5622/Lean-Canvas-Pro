import { supabase } from './supabase';

/** Shape of a canvas_snapshots row as stored in Supabase. */
export interface SnapshotRow {
  id: string;
  canvas_id: string;
  user_id: string;
  data: Record<string, string>;
  /** 'auto' for background saves; a custom string for manual snapshots. */
  label: string | null;
  created_at: string;
}

/**
 * List all snapshots for a canvas, most-recent first.
 * The DB prune trigger caps this at 20 rows per canvas.
 */
export async function listSnapshots(canvasId: string): Promise<SnapshotRow[]> {
  const { data, error } = await supabase
    .from('canvas_snapshots')
    .select('*')
    .eq('canvas_id', canvasId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as SnapshotRow[]) ?? [];
}

/**
 * Persist a new snapshot.
 * The DB trigger will automatically prune snapshots beyond the 20-row limit.
 */
export async function createSnapshot(
  canvasId: string,
  data: Record<string, string>,
  label?: string
): Promise<SnapshotRow> {
  const { data: row, error } = await supabase
    .from('canvas_snapshots')
    .insert({ canvas_id: canvasId, data, label: label ?? null })
    .select()
    .single();
  if (error) throw error;
  return row as SnapshotRow;
}

/** Delete a specific snapshot by ID. */
export async function deleteSnapshot(id: string): Promise<void> {
  const { error } = await supabase
    .from('canvas_snapshots')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
