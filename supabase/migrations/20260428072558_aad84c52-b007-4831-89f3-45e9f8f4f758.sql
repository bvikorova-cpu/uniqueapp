ALTER TABLE public.megatalent_referral_earnings 
ADD COLUMN IF NOT EXISTS source_kind text NOT NULL DEFAULT 'subscription';

COMMENT ON COLUMN public.megatalent_referral_earnings.source_kind IS 'Origin of the credit: subscription | one_off | manual';

CREATE INDEX IF NOT EXISTS megatalent_referral_earnings_source_kind_idx
ON public.megatalent_referral_earnings (referrer_id, source_kind);