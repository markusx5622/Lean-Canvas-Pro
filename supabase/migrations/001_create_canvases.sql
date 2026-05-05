-- ============================================================
-- Migration: Cloud canvas persistence
-- Run this once in your Supabase project via the SQL editor
-- (Dashboard → SQL Editor → New query → paste & run).
-- ============================================================

-- 1. Table ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.canvases (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text        NOT NULL DEFAULT 'Mi Canvas',
  -- The 9 canvas blocks are stored as a JSON object keyed by block number
  -- e.g. { "1": "Problema...", "4": "Solución..." }
  data        jsonb       NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2. Index for fast user-scoped queries ----------------------------
CREATE INDEX IF NOT EXISTS canvases_user_id_idx
  ON public.canvases (user_id);

-- 3. Auto-refresh updated_at on every UPDATE -----------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS canvases_set_updated_at ON public.canvases;
CREATE TRIGGER canvases_set_updated_at
  BEFORE UPDATE ON public.canvases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Row Level Security --------------------------------------------
ALTER TABLE public.canvases ENABLE ROW LEVEL SECURITY;

-- Each user can only read and write their own canvases.
DROP POLICY IF EXISTS "Users can manage their own canvases" ON public.canvases;
CREATE POLICY "Users can manage their own canvases"
  ON public.canvases
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
