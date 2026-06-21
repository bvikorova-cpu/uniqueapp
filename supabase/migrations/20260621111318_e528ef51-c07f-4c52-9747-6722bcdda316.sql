CREATE INDEX IF NOT EXISTS idx_coloring_pages_user_created
  ON public.coloring_pages (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_updated_at_id
  ON public.profiles (updated_at DESC NULLS LAST, id);

CREATE INDEX IF NOT EXISTS idx_vitals_log_created_metric
  ON public.vitals_log (created_at DESC, metric);