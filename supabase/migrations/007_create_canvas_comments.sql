-- ============================================================
-- Migration: Canvas feedback / comments
-- Mentors, advisors, and investors can leave structured
-- feedback on a shared canvas via the public share link.
-- The canvas owner can then read and delete those comments.
-- ============================================================

-- 1. Table ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.canvas_comments (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id    uuid        NOT NULL REFERENCES public.canvases(id) ON DELETE CASCADE,
  -- Optional: links the comment to a specific canvas block (1–9).
  -- NULL means the comment is a general (canvas-level) observation.
  block_id     integer     NULL CHECK (block_id BETWEEN 1 AND 9),
  author_name  text        NOT NULL CHECK (char_length(author_name) BETWEEN 1 AND 120),
  body         text        NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  -- Populated when the reviewer is authenticated; NULL for anonymous reviewers.
  user_id      uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 2. Indexes -------------------------------------------------------
CREATE INDEX IF NOT EXISTS canvas_comments_canvas_id_idx
  ON public.canvas_comments (canvas_id);

-- 3. Row Level Security --------------------------------------------
ALTER TABLE public.canvas_comments ENABLE ROW LEVEL SECURITY;

-- Canvas owner can read all comments on their canvases.
DROP POLICY IF EXISTS "Canvas owner can read comments" ON public.canvas_comments;
CREATE POLICY "Canvas owner can read comments"
  ON public.canvas_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.canvases c
      WHERE c.id = canvas_comments.canvas_id
        AND c.user_id = auth.uid()
    )
  );

-- Canvas owner can delete any comment on their canvases.
DROP POLICY IF EXISTS "Canvas owner can delete comments" ON public.canvas_comments;
CREATE POLICY "Canvas owner can delete comments"
  ON public.canvas_comments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.canvases c
      WHERE c.id = canvas_comments.canvas_id
        AND c.user_id = auth.uid()
    )
  );

-- Workspace members can read comments on workspace canvases they are members of.
DROP POLICY IF EXISTS "Workspace members can read canvas comments" ON public.canvas_comments;
CREATE POLICY "Workspace members can read canvas comments"
  ON public.canvas_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.canvases c
      JOIN public.workspace_members wm ON wm.workspace_id = c.workspace_id
      WHERE c.id = canvas_comments.canvas_id
        AND c.workspace_id IS NOT NULL
        AND wm.user_id = auth.uid()
    )
  );

-- 4. SECURITY DEFINER function for anonymous comment submission ----
--    Any visitor who has a valid share token can post a comment.
--    Running as definer bypasses RLS so unauthenticated (anon)
--    callers can insert without needing a direct INSERT policy.
CREATE OR REPLACE FUNCTION public.add_canvas_comment(
  p_token       uuid,
  p_block_id    integer,
  p_author_name text,
  p_body        text
)
RETURNS TABLE (
  id           uuid,
  canvas_id    uuid,
  block_id     integer,
  author_name  text,
  body         text,
  created_at   timestamptz
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_canvas_id uuid;
BEGIN
  -- Validate the share token and resolve the canvas id.
  SELECT s.canvas_id INTO v_canvas_id
  FROM   public.canvas_shares s
  WHERE  s.token = p_token;

  IF v_canvas_id IS NULL THEN
    RAISE EXCEPTION 'invalid_share_token';
  END IF;

  -- Validate inputs (mirrors table constraints).
  IF p_author_name IS NULL OR char_length(trim(p_author_name)) < 1 OR char_length(p_author_name) > 120 THEN
    RAISE EXCEPTION 'invalid_author_name';
  END IF;
  IF p_body IS NULL OR char_length(trim(p_body)) < 1 OR char_length(p_body) > 2000 THEN
    RAISE EXCEPTION 'invalid_body';
  END IF;
  IF p_block_id IS NOT NULL AND (p_block_id < 1 OR p_block_id > 9) THEN
    RAISE EXCEPTION 'invalid_block_id';
  END IF;

  RETURN QUERY
  INSERT INTO public.canvas_comments (canvas_id, block_id, author_name, body, user_id)
  VALUES (
    v_canvas_id,
    p_block_id,
    trim(p_author_name),
    trim(p_body),
    auth.uid()  -- NULL for anon callers, populated for authenticated reviewers
  )
  RETURNING
    canvas_comments.id,
    canvas_comments.canvas_id,
    canvas_comments.block_id,
    canvas_comments.author_name,
    canvas_comments.body,
    canvas_comments.created_at;
END;
$$;

-- Grant execute to authenticated and anonymous roles.
GRANT EXECUTE ON FUNCTION public.add_canvas_comment(uuid, integer, text, text)
  TO authenticated, anon;
