CREATE TABLE IF NOT EXISTS public.rate_limit_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_entries_lookup
  ON public.rate_limit_entries (identifier, action_type, created_at DESC);

ALTER TABLE public.rate_limit_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages rate limit entries" ON public.rate_limit_entries;
CREATE POLICY "Service role manages rate limit entries"
  ON public.rate_limit_entries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
