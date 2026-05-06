-- ============================================================
-- Migration: Workspaces and team memberships
-- Run this once in your Supabase project via the SQL editor
-- (Dashboard → SQL Editor → New query → paste & run).
-- ============================================================

-- 1. workspaces table -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workspaces (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  -- The user who created the workspace; always has the 'owner' role.
  owner_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workspaces_owner_id_idx
  ON public.workspaces (owner_id);

DROP TRIGGER IF EXISTS workspaces_set_updated_at ON public.workspaces;
CREATE TRIGGER workspaces_set_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. workspace_members table ------------------------------------------
-- Tracks which users belong to which workspace and at what role.
-- The 'owner' role is reserved for the workspace creator; regular
-- invitees receive the 'member' role.
CREATE TABLE IF NOT EXISTS public.workspace_members (
  workspace_id uuid        NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role         text        NOT NULL DEFAULT 'member'
                           CHECK (role IN ('owner', 'member')),
  joined_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS workspace_members_user_id_idx
  ON public.workspace_members (user_id);

-- 3. Auto-add owner to workspace_members on INSERT --------------------
CREATE OR REPLACE FUNCTION public.add_workspace_owner()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workspaces_add_owner ON public.workspaces;
CREATE TRIGGER workspaces_add_owner
  AFTER INSERT ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.add_workspace_owner();

-- 4. Add workspace_id to canvases -------------------------------------
-- NULL = personal canvas (visible only to its owner).
-- Non-NULL = workspace canvas (visible to all workspace members).
ALTER TABLE public.canvases
  ADD COLUMN IF NOT EXISTS workspace_id uuid
    REFERENCES public.workspaces(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS canvases_workspace_id_idx
  ON public.canvases (workspace_id)
  WHERE workspace_id IS NOT NULL;

-- 5. RLS – workspaces -------------------------------------------------
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- Members can see workspaces they belong to.
DROP POLICY IF EXISTS "Members can view their workspaces" ON public.workspaces;
CREATE POLICY "Members can view their workspaces"
  ON public.workspaces
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = workspaces.id
        AND wm.user_id = auth.uid()
    )
  );

-- Any authenticated user can create a workspace (they become the owner).
DROP POLICY IF EXISTS "Users can create workspaces" ON public.workspaces;
CREATE POLICY "Users can create workspaces"
  ON public.workspaces
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Only the owner can rename a workspace.
DROP POLICY IF EXISTS "Owner can update workspace" ON public.workspaces;
CREATE POLICY "Owner can update workspace"
  ON public.workspaces
  FOR UPDATE
  USING  (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Only the owner can delete a workspace (cascades to members + canvases).
DROP POLICY IF EXISTS "Owner can delete workspace" ON public.workspaces;
CREATE POLICY "Owner can delete workspace"
  ON public.workspaces
  FOR DELETE
  USING (auth.uid() = owner_id);

-- 6. RLS – workspace_members ------------------------------------------
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Members can see who else is in their workspaces.
DROP POLICY IF EXISTS "Members can view workspace members" ON public.workspace_members;
CREATE POLICY "Members can view workspace members"
  ON public.workspace_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm2
      WHERE wm2.workspace_id = workspace_members.workspace_id
        AND wm2.user_id = auth.uid()
    )
  );

-- Only the workspace owner can add new members.
DROP POLICY IF EXISTS "Owner can add members" ON public.workspace_members;
CREATE POLICY "Owner can add members"
  ON public.workspace_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id
        AND w.owner_id = auth.uid()
    )
  );

-- Owner can remove any member; member can remove themselves.
DROP POLICY IF EXISTS "Owner or self can remove member" ON public.workspace_members;
CREATE POLICY "Owner or self can remove member"
  ON public.workspace_members
  FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id
        AND w.owner_id = auth.uid()
    )
  );

-- 7. RLS – canvases (updated to support workspace scope) --------------
-- Drop the old single policy and replace with two narrower policies.
DROP POLICY IF EXISTS "Users can manage their own canvases" ON public.canvases;

-- Personal canvases (workspace_id IS NULL): only the owner.
DROP POLICY IF EXISTS "Manage personal canvases" ON public.canvases;
CREATE POLICY "Manage personal canvases"
  ON public.canvases
  FOR ALL
  USING  (auth.uid() = user_id AND workspace_id IS NULL)
  WITH CHECK (auth.uid() = user_id AND workspace_id IS NULL);

-- Workspace canvases: any member of the workspace can read/write.
DROP POLICY IF EXISTS "Members manage workspace canvases" ON public.canvases;
CREATE POLICY "Members manage workspace canvases"
  ON public.canvases
  FOR ALL
  USING (
    workspace_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = canvases.workspace_id
        AND wm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    workspace_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = canvases.workspace_id
        AND wm.user_id = auth.uid()
    )
  );
