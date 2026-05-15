
ALTER TABLE public.job_listings
  ADD COLUMN IF NOT EXISTS is_remote BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS four_day_week BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS equity_offered BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS company_size TEXT,
  ADD COLUMN IF NOT EXISTS funding_stage TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC;

CREATE INDEX IF NOT EXISTS idx_jl_remote ON public.job_listings(is_remote) WHERE is_remote = true;
CREATE INDEX IF NOT EXISTS idx_jl_industry ON public.job_listings(industry);
CREATE INDEX IF NOT EXISTS idx_jl_geo ON public.job_listings(latitude, longitude) WHERE latitude IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.personalized_job_feed_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.job_listings(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL DEFAULT 0,
  reason TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_id)
);
ALTER TABLE public.personalized_job_feed_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own personalized feed" ON public.personalized_job_feed_cache;
DROP POLICY IF EXISTS "Users manage own personalized feed" ON public.personalized_job_feed_cache;
CREATE POLICY "Users manage own personalized feed" ON public.personalized_job_feed_cache
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_pjfc_user_score ON public.personalized_job_feed_cache(user_id, score DESC);
