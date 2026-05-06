import { supabase } from './supabase';

/** Shape of a workspace row as stored in Supabase. */
export interface WorkspaceRow {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

/** Shape of a workspace_members row. */
export interface WorkspaceMemberRow {
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
}

/** List all workspaces the authenticated user belongs to. */
export async function listWorkspaces(): Promise<WorkspaceRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as WorkspaceRow[]) ?? [];
}

/**
 * Create a new workspace owned by the authenticated user.
 * The DB trigger automatically inserts an 'owner' row into workspace_members.
 */
export async function createWorkspace(name: string): Promise<WorkspaceRow> {
  if (!supabase) throw new Error('Supabase no está configurado.');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesión activa.');
  const { data, error } = await supabase
    .from('workspaces')
    .insert({ name, owner_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data as WorkspaceRow;
}

/** Rename a workspace (owner only — enforced by RLS). */
export async function renameWorkspace(id: string, name: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('workspaces')
    .update({ name })
    .eq('id', id);
  if (error) throw error;
}

/**
 * Delete a workspace (owner only — enforced by RLS).
 * Cascades to workspace_members; canvases have workspace_id SET NULL.
 */
export async function deleteWorkspace(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

/** List all members of a workspace (any member can read — enforced by RLS). */
export async function listWorkspaceMembers(workspaceId: string): Promise<WorkspaceMemberRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('joined_at', { ascending: true });
  if (error) throw error;
  return (data as WorkspaceMemberRow[]) ?? [];
}

/** Remove the authenticated user from a workspace (leave). Owner uses deleteWorkspace instead. */
export async function leaveWorkspace(workspaceId: string, userId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId);
  if (error) throw error;
}
