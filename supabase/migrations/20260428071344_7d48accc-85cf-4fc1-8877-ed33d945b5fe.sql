-- Recurring referral rewards: track which Stripe invoice triggered each €5 credit
-- so the same invoice can never double-credit (webhook retries are safe).
ALTER TABLE public.megatalent_referral_earnings
  ADD COLUMN IF NOT EXISTS source_invoice_id text;

CREATE UNIQUE INDEX IF NOT EXISTS megatalent_referral_earnings_invoice_unique
  ON public.megatalent_referral_earnings (source_invoice_id)
  WHERE source_invoice_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS megatalent_referral_earnings_referrer_idx
  ON public.megatalent_referral_earnings (referrer_id, created_at DESC);