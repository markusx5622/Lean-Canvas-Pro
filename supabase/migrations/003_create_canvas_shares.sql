-- ============================================================
-- Migration: Canvas read-only sharing via token
-- Run this once in your Supabase project via the SQL editor
-- (Dashboard → SQL Editor → New query → paste & run).
-- ============================================================

-- 1. Table ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.canvas_shares (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id   uuid        NOT NULL REFERENCES public.canvases(id) ON DELETE CASCADE,
  -- Denormalised for simpler RLS without a JOIN.
  -- DEFAULT auth.uid() lets the client omit user_id; the DB fills it from the JWT.
  user_id     uuid        NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Cryptographically random token used as the public share URL slug
  token       uuid        NOT NULL DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT canvas_shares_token_unique UNIQUE (token),
  -- At most one active share per canvas (owner revokes by deleting the row)
  CONSTRAINT canvas_shares_canvas_unique UNIQUE (canvas_id)
);

-- 2. Index ---------------------------------------------------------
CREATE INDEX IF NOT EXISTS canvas_shares_canvas_id_idx
  ON public.canvas_shares (canvas_id);

-- 3. Row Level Security --------------------------------------------
ALTER TABLE public.canvas_shares ENABLE ROW LEVEL SECURITY;

-- Owners can create, read and delete their own share entries.
DROP POLICY IF EXISTS "Owners can manage their canvas shares" ON public.canvas_shares;
CREATE POLICY "Owners can manage their canvas shares"
  ON public.canvas_shares
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. SECURITY DEFINER function for token-based public read --------
--    Returns the canvas associated with the given share token.
--    Running as definer bypasses RLS cleanly so unauthenticated
--    (anon) callers can fetch just the shared canvas data.
CREATE OR REPLACE FUNCTION public.get_canvas_by_share_token(p_token uuid)
RETURNS TABLE (
  id          uuid,
  name        text,
  data        jsonb,
  created_at  timestamptz,
  updated_at  timestamptz
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.data, c.created_at, c.updated_at
  FROM   public.canvases c
  INNER  JOIN public.canvas_shares s ON s.canvas_id = c.id
  WHERE  s.token = p_token;
END;
$$;

-- Grant execute to both authenticated and anonymous roles so the
-- client's anon key can call it.
GRANT EXECUTE ON FUNCTION public.get_canvas_by_share_token(uuid)
  TO authenticated, anon;
