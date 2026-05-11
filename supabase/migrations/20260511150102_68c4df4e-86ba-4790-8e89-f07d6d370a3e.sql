
-- Codes table
CREATE TABLE public.iq_referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.iq_referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own iq referral code"
  ON public.iq_referral_codes FOR SELECT
  USING (auth.uid() = user_id);

-- Referrals table
CREATE TABLE public.iq_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referee_id UUID NOT NULL UNIQUE,
  code TEXT NOT NULL,
  referrer_credits INTEGER NOT NULL DEFAULT 10,
  referee_credits INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.iq_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own iq referrals"
  ON public.iq_referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE INDEX idx_iq_referrals_referrer ON public.iq_referrals(referrer_id);

-- get_or_create code
CREATE OR REPLACE FUNCTION public.get_or_create_iq_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  existing TEXT;
  new_code TEXT;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT code INTO existing FROM public.iq_referral_codes WHERE user_id = uid;
  IF existing IS NOT NULL THEN RETURN existing; END IF;

  LOOP
    new_code := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    BEGIN
      INSERT INTO public.iq_referral_codes (user_id, code) VALUES (uid, new_code);
      RETURN new_code;
    EXCEPTION WHEN unique_violation THEN
      -- retry
    END;
  END LOOP;
END;
$$;

-- redeem
CREATE OR REPLACE FUNCTION public.redeem_iq_referral_code(_code TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  ref_user UUID;
  norm_code TEXT := upper(trim(_code));
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF norm_code IS NULL OR length(norm_code) < 4 THEN
    RAISE EXCEPTION 'Invalid code';
  END IF;

  SELECT user_id INTO ref_user FROM public.iq_referral_codes WHERE code = norm_code;
  IF ref_user IS NULL THEN RAISE EXCEPTION 'Code not found'; END IF;
  IF ref_user = uid THEN RAISE EXCEPTION 'Cannot redeem your own code'; END IF;

  IF EXISTS (SELECT 1 FROM public.iq_referrals WHERE referee_id = uid) THEN
    RAISE EXCEPTION 'You already redeemed a code';
  END IF;

  INSERT INTO public.iq_referrals (referrer_id, referee_id, code)
  VALUES (ref_user, uid, norm_code);

  -- credit referee
  INSERT INTO public.iq_credits (user_id, balance) VALUES (uid, 5)
  ON CONFLICT (user_id) DO UPDATE SET balance = public.iq_credits.balance + 5, updated_at = now();
  -- credit referrer
  INSERT INTO public.iq_credits (user_id, balance) VALUES (ref_user, 10)
  ON CONFLICT (user_id) DO UPDATE SET balance = public.iq_credits.balance + 10, updated_at = now();

  RETURN jsonb_build_object('referrer_credits', 10, 'referee_credits', 5);
END;
$$;
