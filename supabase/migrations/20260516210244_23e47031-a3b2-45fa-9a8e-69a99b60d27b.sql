
CREATE TABLE IF NOT EXISTS public.brand_arena_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  kind TEXT NOT NULL,
  parent_id UUID,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_arena_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arena_records_select_public"
  ON public.brand_arena_records FOR SELECT
  TO authenticated
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "arena_records_insert_own"
  ON public.brand_arena_records FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "arena_records_update_own"
  ON public.brand_arena_records FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "arena_records_delete_own"
  ON public.brand_arena_records FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_arena_records_kind ON public.brand_arena_records(kind);
CREATE INDEX IF NOT EXISTS idx_arena_records_user ON public.brand_arena_records(user_id);
CREATE INDEX IF NOT EXISTS idx_arena_records_parent ON public.brand_arena_records(parent_id);
CREATE INDEX IF NOT EXISTS idx_arena_records_public ON public.brand_arena_records(is_public) WHERE is_public = true;

CREATE TRIGGER trg_arena_records_updated
  BEFORE UPDATE ON public.brand_arena_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
