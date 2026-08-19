ALTER TABLE public.challenge_pro_subscribers
  ADD COLUMN IF NOT EXISTS challenge text NOT NULL DEFAULT 'eco';

-- Existing subscribers paid for a combined plan: keep their access to both sections
INSERT INTO public.challenge_pro_subscribers
  (user_id, challenge, tier, active_until, stripe_customer_id, stripe_subscription_id, top_last_grant_period)
SELECT user_id, 'healthy', tier, active_until, stripe_customer_id, stripe_subscription_id, top_last_grant_period
FROM public.challenge_pro_subscribers
WHERE challenge = 'eco'
ON CONFLICT DO NOTHING;

ALTER TABLE public.challenge_pro_subscribers
  DROP CONSTRAINT IF EXISTS challenge_pro_subscribers_pkey;

CREATE UNIQUE INDEX IF NOT EXISTS challenge_pro_subscribers_user_challenge_key
  ON public.challenge_pro_subscribers (user_id, challenge);