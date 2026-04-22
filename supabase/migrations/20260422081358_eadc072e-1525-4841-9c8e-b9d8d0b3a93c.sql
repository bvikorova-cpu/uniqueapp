-- Add Stripe tracking columns to megatalent_subscriptions
ALTER TABLE public.megatalent_subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_megatalent_subscriptions_stripe_customer
  ON public.megatalent_subscriptions(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_megatalent_subscriptions_stripe_sub
  ON public.megatalent_subscriptions(stripe_subscription_id);

-- Cleanup: delete unpaid 'active' subscriptions (no Stripe linkage)
DELETE FROM public.megatalent_subscriptions
WHERE stripe_subscription_id IS NULL
  AND status = 'active';