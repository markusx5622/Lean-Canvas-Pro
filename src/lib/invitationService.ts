import { supabase } from './supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InvitationRow {
  id: string;
  workspace_id: string;
  invited_by: string;
  email: string;
  token: string;
  status: 'pending' | 'accepted' | 'revoked';
  created_at: string;
  expires_at: string;
}

/** Public info returned by the `get_workspace_invitation_by_token` RPC. */
export interface InvitationPublicInfo {
  workspace_id: string;
  workspace_name: string;
  email: string;
  expires_at: string;
}

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * Create a new invitation for the given email address (owner only).
 * Enforced by RLS: only the workspace owner can insert.
 */
export async function createInvitation(
  workspaceId: string,
  email: string
): Promise<InvitationRow> {
  if (!supabase) throw new Error('Supabase no está configurado.');
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesión activa.');

  const { data, error } = await supabase
    .from('workspace_invitations')
    .insert({ workspace_id: workspaceId, invited_by: user.id, email: email.trim().toLowerCase() })
    .select()
    .single();

  if (error) throw error;
  return data as InvitationRow;
}

/**
 * List all pending invitations for a workspace (owner only).
 */
export async function listPendingInvitations(workspaceId: string): Promise<InvitationRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('workspace_invitations')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as InvitationRow[]) ?? [];
}

/**
 * Revoke a pending invitation (owner only). Sets status to 'revoked'.
 */
export async function revokeInvitation(invitationId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('workspace_invitations')
    .update({ status: 'revoked' })
    .eq('id', invitationId);
  if (error) throw error;
}

/**
 * Fetch public invitation metadata by token.
 * Calls the SECURITY DEFINER RPC — no auth required.
 * Returns null when the token is invalid or expired.
 */
export async function getInvitationByToken(
  token: string
): Promise<InvitationPublicInfo | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('get_workspace_invitation_by_token', {
    p_token: token,
  });
  if (error) throw error;
  if (!data) return null;
  // The RPC returns a single JSON object (not an array).
  return data as InvitationPublicInfo;
}

/**
 * Accept a workspace invitation.
 * Requires the caller to be authenticated with the email matching the invitation.
 * Calls the SECURITY DEFINER RPC which adds the user to workspace_members.
 *
 * @throws 'not_authenticated' – user is not logged in.
 * @throws 'invalid_or_expired_token' – token is unknown, expired, or already used.
 * @throws 'email_mismatch' – the logged-in email does not match the invitation.
 */
export async function acceptInvitation(token: string): Promise<{ workspace_id: string }> {
  if (!supabase) throw new Error('Supabase no está configurado.');
  const { data, error } = await supabase.rpc('accept_workspace_invitation', {
    p_token: token,
  });
  if (error) throw error;
  return data as { workspace_id: string };
}
