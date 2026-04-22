
-- Referral attribution: who referred whom (one-time link at signup/first sub)
CREATE TABLE IF NOT EXISTS public.referral_attributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_user_id UUID NOT NULL UNIQUE,
  code TEXT NOT NULL,
  first_subscription_id TEXT,
  rewarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_attr_referrer ON public.referral_attributions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_attr_code ON public.referral_attributions(code);

ALTER TABLE public.referral_attributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own attribution (as referrer or referred)"
ON public.referral_attributions FOR SELECT TO authenticated
USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE POLICY "Users can self-attribute on signup"
ON public.referral_attributions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = referred_user_id AND auth.uid() <> referrer_id);

CREATE POLICY "Admins manage all attributions"
ON public.referral_attributions FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add reward marker to earnings so we never double-credit per subscription
ALTER TABLE public.megatalent_referral_earnings
  ADD COLUMN IF NOT EXISTS source_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS auto_credited BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS idx_referral_earnings_unique_sub
  ON public.megatalent_referral_earnings(referrer_id, source_subscription_id)
  WHERE source_subscription_id IS NOT NULL;
