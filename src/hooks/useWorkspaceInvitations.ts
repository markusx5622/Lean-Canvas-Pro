import { useState, useCallback } from 'react';
import {
  createInvitation,
  listPendingInvitations,
  revokeInvitation,
  type InvitationRow,
} from '../lib/invitationService';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UseWorkspaceInvitationsReturn {
  invitations: InvitationRow[];
  loading: boolean;
  error: string | null;
  loadInvitations: (workspaceId: string) => Promise<void>;
  invite: (workspaceId: string, email: string) => Promise<void>;
  revoke: (invitationId: string) => Promise<void>;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useWorkspaceInvitations(): UseWorkspaceInvitationsReturn {
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInvitations = useCallback(async (workspaceId: string) => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listPendingInvitations(workspaceId);
      setInvitations(rows);
    } catch (err) {
      console.error('[useWorkspaceInvitations] load failed:', err);
      setError('No se pudieron cargar las invitaciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  const invite = useCallback(async (workspaceId: string, email: string) => {
    setError(null);
    const row = await createInvitation(workspaceId, email);
    setInvitations((prev) => [row, ...prev]);
  }, []);

  const revoke = useCallback(async (invitationId: string) => {
    setError(null);
    await revokeInvitation(invitationId);
    setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
  }, []);

  return { invitations, loading, error, loadInvitations, invite, revoke };
}
