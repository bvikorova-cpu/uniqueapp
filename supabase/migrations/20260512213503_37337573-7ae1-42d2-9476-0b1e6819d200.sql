
-- Gift credits
CREATE TABLE public.ai_credit_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  sender_id UUID NOT NULL,
  recipient_email TEXT,
  credits INTEGER NOT NULL CHECK (credits > 0),
  amount_cents INTEGER NOT NULL DEFAULT 0,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','redeemed','expired','refunded')),
  stripe_session_id TEXT,
  redeemed_by UUID,
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '365 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_credit_gifts_sender ON public.ai_credit_gifts(sender_id);
CREATE INDEX idx_ai_credit_gifts_code ON public.ai_credit_gifts(code);
ALTER TABLE public.ai_credit_gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sender views own gifts" ON public.ai_credit_gifts FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = redeemed_by);
CREATE POLICY "Sender creates gifts" ON public.ai_credit_gifts FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Promo codes
CREATE TABLE public.ai_credit_promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  bonus_credits INTEGER NOT NULL DEFAULT 0,
  percent_off INTEGER NOT NULL DEFAULT 0 CHECK (percent_off >= 0 AND percent_off <= 100),
  max_redemptions INTEGER,
  redemption_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_credit_promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read active codes" ON public.ai_credit_promo_codes FOR SELECT TO authenticated USING (active = true);

CREATE TABLE public.ai_credit_promo_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  user_id UUID NOT NULL,
  bonus_credits INTEGER NOT NULL DEFAULT 0,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(code, user_id)
);
ALTER TABLE public.ai_credit_promo_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own redemptions" ON public.ai_credit_promo_redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own redemptions" ON public.ai_credit_promo_redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI credits referrals
CREATE TABLE public.ai_credit_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  referee_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','rewarded')),
  bonus_credits INTEGER NOT NULL DEFAULT 20,
  rewarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(referrer_id, referee_id)
);
ALTER TABLE public.ai_credit_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own referrals" ON public.ai_credit_referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);
