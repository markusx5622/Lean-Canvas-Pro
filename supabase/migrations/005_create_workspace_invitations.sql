-- ============================================================
-- Migration: Workspace Invitations
-- Allows workspace owners to invite users by email.
-- Invitees accept via a unique token link (/invite/:token).
-- ============================================================

-- 1. workspace_invitations table -----------------------------------
CREATE TABLE IF NOT EXISTS public.workspace_invitations (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid        NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  invited_by   uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- The email address of the person being invited.
  -- Application layer normalises to lowercase before INSERT (see invitationService.ts).
  -- The unique index below also uses lower(email) for defence-in-depth.
  email        text        NOT NULL,
  -- Random token used in the accept link; must be kept secret.
  token        uuid        NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  -- 'pending' → 'accepted' | 'revoked'
  status       text        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'accepted', 'revoked')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  -- Invitations expire after 7 days.
  expires_at   timestamptz NOT NULL DEFAULT (now() + INTERVAL '7 days')
);

-- Only one active (pending) invitation per email per workspace.
CREATE UNIQUE INDEX IF NOT EXISTS workspace_invitations_email_workspace_pending_idx
  ON public.workspace_invitations (workspace_id, lower(email))
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS workspace_invitations_workspace_id_idx
  ON public.workspace_invitations (workspace_id);

CREATE INDEX IF NOT EXISTS workspace_invitations_token_idx
  ON public.workspace_invitations (token);

-- 2. RLS – workspace_invitations -----------------------------------
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

-- Workspace owners can view all invitations for their workspaces.
DROP POLICY IF EXISTS "Owner can view invitations" ON public.workspace_invitations;
CREATE POLICY "Owner can view invitations"
  ON public.workspace_invitations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_invitations.workspace_id
        AND w.owner_id = auth.uid()
    )
  );

-- Workspace owners can create invitations.
DROP POLICY IF EXISTS "Owner can create invitations" ON public.workspace_invitations;
CREATE POLICY "Owner can create invitations"
  ON public.workspace_invitations
  FOR INSERT
  WITH CHECK (
    auth.uid() = invited_by
    AND EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id
        AND w.owner_id = auth.uid()
    )
  );

-- Workspace owners can revoke (update status to 'revoked') their own invitations.
DROP POLICY IF EXISTS "Owner can revoke invitations" ON public.workspace_invitations;
CREATE POLICY "Owner can revoke invitations"
  ON public.workspace_invitations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_invitations.workspace_id
        AND w.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_invitations.workspace_id
        AND w.owner_id = auth.uid()
    )
  );

-- 3. Public RPC: look up invitation info by token ------------------
-- Used by AcceptInvitePage before the user is a member.
-- Returns workspace name and (masked) email so the invitee knows
-- what they are joining. No auth required.
CREATE OR REPLACE FUNCTION public.get_workspace_invitation_by_token(p_token uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inv  workspace_invitations%ROWTYPE;
  v_name text;
BEGIN
  SELECT i.*, w.name
    INTO v_inv, v_name
    FROM workspace_invitations i
    JOIN workspaces w ON w.id = i.workspace_id
   WHERE i.token = p_token
     AND i.status = 'pending'
     AND i.expires_at > now();

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN json_build_object(
    'workspace_id',   v_inv.workspace_id,
    'workspace_name', v_name,
    'email',          v_inv.email,
    'expires_at',     v_inv.expires_at
  );
END;
$$;

-- Revoke direct table execute so only the function interface is used.
REVOKE ALL ON FUNCTION public.get_workspace_invitation_by_token(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_workspace_invitation_by_token(uuid) TO anon, authenticated;

-- 4. Authenticated RPC: accept an invitation -----------------------
-- Validates:
--   • token is pending and not expired
--   • logged-in user's email matches the invitation email
-- Then inserts the user into workspace_members and marks the
-- invitation as accepted. Uses SECURITY DEFINER to bypass the
-- workspace_members RLS (invitee is not yet a member).
CREATE OR REPLACE FUNCTION public.accept_workspace_invitation(p_token uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inv         workspace_invitations%ROWTYPE;
  v_user_id     uuid := auth.uid();
  v_user_email  text := auth.email();
BEGIN
  -- Must be authenticated.
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- Look up the invitation.
  SELECT *
    INTO v_inv
    FROM workspace_invitations
   WHERE token = p_token
     AND status = 'pending'
     AND expires_at > now();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_or_expired_token';
  END IF;

  -- Verify the logged-in user's email matches the invitation.
  IF lower(v_inv.email) <> lower(v_user_email) THEN
    RAISE EXCEPTION 'email_mismatch';
  END IF;

  -- Add to workspace members (idempotent).
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (v_inv.workspace_id, v_user_id, 'member')
  ON CONFLICT DO NOTHING;

  -- Mark invitation as accepted.
  UPDATE workspace_invitations
     SET status = 'accepted'
   WHERE id = v_inv.id;

  RETURN json_build_object('workspace_id', v_inv.workspace_id);
END;
$$;

REVOKE ALL ON FUNCTION public.accept_workspace_invitation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_workspace_invitation(uuid) TO authenticated;
