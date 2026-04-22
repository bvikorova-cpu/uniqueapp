
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS signup_ip TEXT,
  ADD COLUMN IF NOT EXISTS signup_user_agent TEXT;

ALTER TABLE public.referral_attributions
  ADD COLUMN IF NOT EXISTS fraud_score INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS fraud_reasons JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_referral_attr_status ON public.referral_attributions(status);

CREATE TABLE IF NOT EXISTS public.referral_fraud_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attribution_id UUID REFERENCES public.referral_attributions(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL,
  referred_user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  severity TEXT NOT NULL DEFAULT 'medium',
  reviewed BOOLEAN NOT NULL DEFAULT false,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fraud_flags_referrer ON public.referral_fraud_flags(referrer_id);
CREATE INDEX IF NOT EXISTS idx_fraud_flags_reviewed ON public.referral_fraud_flags(reviewed);

ALTER TABLE public.referral_fraud_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all fraud flags"
ON public.referral_fraud_flags FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
