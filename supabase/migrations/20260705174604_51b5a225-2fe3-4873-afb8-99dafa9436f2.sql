ALTER TABLE public.challenge_pro_subscribers
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'pro',
  ADD COLUMN IF NOT EXISTS top_last_grant_period TIMESTAMPTZ;

-- Only allow 'pro' or 'top'
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'challenge_pro_subscribers_tier_check') THEN
    ALTER TABLE public.challenge_pro_subscribers
      ADD CONSTRAINT challenge_pro_subscribers_tier_check CHECK (tier IN ('pro','top'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_challenge_pro_subscribers_tier
  ON public.challenge_pro_subscribers(tier);