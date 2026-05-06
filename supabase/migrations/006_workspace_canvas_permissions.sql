-- ============================================================
-- Migration: Tighten canvas DELETE permissions for workspaces
--
-- Previously the "Members manage workspace canvases" policy used
-- FOR ALL, which let any workspace member delete any canvas.
--
-- This migration replaces that single policy with four narrower
-- policies:
--   • SELECT  – any workspace member
--   • INSERT  – any workspace member
--   • UPDATE  – any workspace member
--   • DELETE  – only the canvas creator (user_id) OR the workspace owner
--
-- Personal canvases (workspace_id IS NULL) are unchanged.
-- ============================================================

-- Drop the old all-in-one policy.
DROP POLICY IF EXISTS "Members manage workspace canvases" ON public.canvases;

-- ── SELECT ────────────────────────────────────────────────────────────────────
CREATE POLICY "Members can view workspace canvases"
  ON public.canvases
  FOR SELECT
  USING (
    workspace_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = canvases.workspace_id
        AND wm.user_id = auth.uid()
    )
  );

-- ── INSERT ────────────────────────────────────────────────────────────────────
CREATE POLICY "Members can create workspace canvases"
  ON public.canvases
  FOR INSERT
  WITH CHECK (
    workspace_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = canvases.workspace_id
        AND wm.user_id = auth.uid()
    )
  );

-- ── UPDATE ────────────────────────────────────────────────────────────────────
CREATE POLICY "Members can update workspace canvases"
  ON public.canvases
  FOR UPDATE
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

-- ── DELETE ────────────────────────────────────────────────────────────────────
-- Only the canvas creator OR the workspace owner may delete a workspace canvas.
CREATE POLICY "Creator or owner can delete workspace canvas"
  ON public.canvases
  FOR DELETE
  USING (
    workspace_id IS NOT NULL AND
    (
      -- Canvas was created by the current user.
      auth.uid() = user_id
      OR
      -- Current user is the workspace owner.
      EXISTS (
        SELECT 1 FROM public.workspaces w
        WHERE w.id = canvases.workspace_id
          AND w.owner_id = auth.uid()
      )
    )
  );
