
-- Allow 'enterprise' tier
ALTER TABLE public.brand_sponsors DROP CONSTRAINT IF EXISTS brand_sponsors_tier_check;
ALTER TABLE public.brand_sponsors ADD CONSTRAINT brand_sponsors_tier_check
  CHECK (tier = ANY (ARRAY['bronze'::text,'silver'::text,'gold'::text,'platinum'::text,'enterprise'::text]));

-- New columns
ALTER TABLE public.brand_sponsors
  ADD COLUMN IF NOT EXISTS tier_priority integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS api_key text,
  ADD COLUMN IF NOT EXISTS api_key_created_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS brand_sponsors_api_key_uniq ON public.brand_sponsors(api_key) WHERE api_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS brand_sponsors_priority_votes_idx ON public.brand_sponsors(tier_priority DESC, total_votes DESC);

-- Auto-set tier_priority / featured based on tier
CREATE OR REPLACE FUNCTION public.brand_sponsors_set_tier_meta()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.tier_priority := CASE NEW.tier
    WHEN 'enterprise' THEN 100
    WHEN 'platinum'   THEN 80
    WHEN 'gold'       THEN 60
    WHEN 'silver'     THEN 40
    WHEN 'bronze'     THEN 20
    ELSE 0
  END;
  NEW.featured := NEW.tier IN ('silver','gold','platinum','enterprise');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS brand_sponsors_tier_meta ON public.brand_sponsors;
CREATE TRIGGER brand_sponsors_tier_meta
BEFORE INSERT OR UPDATE OF tier ON public.brand_sponsors
FOR EACH ROW EXECUTE FUNCTION public.brand_sponsors_set_tier_meta();

-- Backfill existing rows
UPDATE public.brand_sponsors SET tier = tier;

-- RPC for Enterprise API key lookup (called by edge fn with service role)
-- No client-facing changes; api_key is never exposed via PostgREST select policies
-- (existing RLS on brand_sponsors continues to govern owner reads).
