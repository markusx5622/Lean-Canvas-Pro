-- ============================================================
-- Migration: Canvas snapshot / version history
-- Run this once in your Supabase project via the SQL editor
-- (Dashboard → SQL Editor → New query → paste & run).
-- ============================================================

-- 1. Table ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.canvas_snapshots (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id   uuid        NOT NULL REFERENCES public.canvases(id) ON DELETE CASCADE,
  -- Denormalized for simpler RLS without a JOIN
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Frozen copy of the canvas data at snapshot time
  data        jsonb       NOT NULL DEFAULT '{}',
  -- Optional human-readable label: 'auto' for background saves, or custom text
  label       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 2. Index for fast canvas-scoped queries --------------------------
CREATE INDEX IF NOT EXISTS canvas_snapshots_canvas_id_idx
  ON public.canvas_snapshots (canvas_id, created_at DESC);

-- 3. Auto-prune: keep only the 20 most recent snapshots per canvas -
--    Runs after every INSERT so storage stays bounded.
CREATE OR REPLACE FUNCTION public.prune_canvas_snapshots()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM public.canvas_snapshots
  WHERE canvas_id = NEW.canvas_id
    AND id NOT IN (
      SELECT id
      FROM   public.canvas_snapshots
      WHERE  canvas_id = NEW.canvas_id
      ORDER  BY created_at DESC
      LIMIT  20
    );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS canvas_snapshots_prune ON public.canvas_snapshots;
CREATE TRIGGER canvas_snapshots_prune
  AFTER INSERT ON public.canvas_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.prune_canvas_snapshots();

-- 4. Row Level Security --------------------------------------------
ALTER TABLE public.canvas_snapshots ENABLE ROW LEVEL SECURITY;

-- Users can only read and write their own snapshots.
DROP POLICY IF EXISTS "Users can manage their own snapshots" ON public.canvas_snapshots;
CREATE POLICY "Users can manage their own snapshots"
  ON public.canvas_snapshots
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
