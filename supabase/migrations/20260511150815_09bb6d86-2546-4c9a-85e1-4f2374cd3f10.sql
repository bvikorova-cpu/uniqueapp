
CREATE TABLE public.iq_promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  credits INTEGER NOT NULL CHECK (credits > 0),
  max_redemptions INTEGER,
  redemption_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.iq_promo_codes ENABLE ROW LEVEL SECURITY;
-- no public read; only admins via dashboard / SQL

CREATE TABLE public.iq_promo_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promo_code_id UUID NOT NULL REFERENCES public.iq_promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  credits_awarded INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (promo_code_id, user_id)
);
ALTER TABLE public.iq_promo_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own iq promo redemptions"
  ON public.iq_promo_redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.redeem_iq_promo_code(_code TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  promo RECORD;
  norm TEXT := upper(trim(_code));
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF norm IS NULL OR length(norm) < 3 THEN RAISE EXCEPTION 'Invalid code'; END IF;

  SELECT * INTO promo FROM public.iq_promo_codes WHERE code = norm FOR UPDATE;
  IF promo.id IS NULL THEN RAISE EXCEPTION 'Code not found'; END IF;
  IF NOT promo.is_active THEN RAISE EXCEPTION 'Code inactive'; END IF;
  IF promo.expires_at IS NOT NULL AND promo.expires_at < now() THEN RAISE EXCEPTION 'Code expired'; END IF;
  IF promo.max_redemptions IS NOT NULL AND promo.redemption_count >= promo.max_redemptions THEN
    RAISE EXCEPTION 'Code fully redeemed';
  END IF;
  IF EXISTS (SELECT 1 FROM public.iq_promo_redemptions WHERE promo_code_id = promo.id AND user_id = uid) THEN
    RAISE EXCEPTION 'Already redeemed';
  END IF;

  INSERT INTO public.iq_promo_redemptions (promo_code_id, user_id, credits_awarded)
  VALUES (promo.id, uid, promo.credits);

  UPDATE public.iq_promo_codes
    SET redemption_count = redemption_count + 1
    WHERE id = promo.id;

  INSERT INTO public.iq_credits (user_id, balance) VALUES (uid, promo.credits)
  ON CONFLICT (user_id) DO UPDATE SET balance = public.iq_credits.balance + EXCLUDED.balance, updated_at = now();

  RETURN jsonb_build_object('credits', promo.credits, 'code', norm);
END;
$$;
