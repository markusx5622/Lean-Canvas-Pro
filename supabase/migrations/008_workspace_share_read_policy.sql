-- ============================================================
-- Migration: Allow workspace members to read canvas shares
--
-- Problem: The original "Owners can manage their canvas shares" policy
-- (migration 003) restricted ALL operations — including SELECT — to the
-- user who created the share (canvas_shares.user_id = auth.uid()).
--
-- This meant that when a workspace member (who did NOT create the share)
-- called getShareForCanvas(), they received an empty result set even
-- though a valid share already existed.  Their UI then showed "no share",
-- and if they tried to generate one they hit the UNIQUE constraint on
-- canvas_id, producing a confusing error instead of showing the link.
--
-- Fix: add a permissive SELECT-only policy that allows any authenticated
-- workspace member to READ shares for canvases they already have access
-- to.  Write operations (INSERT / UPDATE / DELETE) remain restricted to
-- the share owner via the existing policy.
-- ============================================================

DROP POLICY IF EXISTS "Workspace members can view canvas shares" ON public.canvas_shares;

CREATE POLICY "Workspace members can view canvas shares"
  ON public.canvas_shares
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM   public.canvases c
      INNER  JOIN public.workspace_members wm
             ON wm.workspace_id = c.workspace_id
      WHERE  c.id            = canvas_shares.canvas_id
        AND  c.workspace_id  IS NOT NULL
        AND  wm.user_id      = auth.uid()
    )
  );
