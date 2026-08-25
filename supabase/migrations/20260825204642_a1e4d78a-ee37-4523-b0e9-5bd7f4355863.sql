ALTER TABLE public.premium_video_creator_balance
  ADD COLUMN IF NOT EXISTS withdrawn_credits integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.get_premium_video_withdrawable()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_earned integer := 0;
  v_withdrawn integer := 0;
  v_wallet integer := 0;
  v_avail integer := 0;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('error', 'not_authenticated');
  END IF;

  SELECT COALESCE(credited_total, 0), COALESCE(withdrawn_credits, 0)
    INTO v_earned, v_withdrawn
  FROM public.premium_video_creator_balance WHERE user_id = v_uid;

  SELECT COALESCE(credits_remaining, 0) INTO v_wallet
  FROM public.video_credits WHERE user_id = v_uid;

  v_avail := LEAST(GREATEST(COALESCE(v_earned,0) - COALESCE(v_withdrawn,0), 0), COALESCE(v_wallet,0));

  RETURN jsonb_build_object(
    'earned_credits', COALESCE(v_earned,0),
    'withdrawn_credits', COALESCE(v_withdrawn,0),
    'wallet_credits', COALESCE(v_wallet,0),
    'available_credits', v_avail,
    'available_eur', ROUND(v_avail * 0.5, 2),
    'min_eur', 20
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.cashout_premium_video_earnings()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_earned integer := 0;
  v_withdrawn integer := 0;
  v_wallet integer := 0;
  v_avail integer := 0;
  v_eur numeric := 0;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  SELECT COALESCE(credited_total, 0), COALESCE(withdrawn_credits, 0)
    INTO v_earned, v_withdrawn
  FROM public.premium_video_creator_balance WHERE user_id = v_uid FOR UPDATE;

  SELECT COALESCE(credits_remaining, 0) INTO v_wallet
  FROM public.video_credits WHERE user_id = v_uid FOR UPDATE;

  v_avail := LEAST(GREATEST(COALESCE(v_earned,0) - COALESCE(v_withdrawn,0), 0), COALESCE(v_wallet,0));
  v_eur := ROUND(v_avail * 0.5, 2);

  IF v_eur < 20 THEN
    RETURN jsonb_build_object('success', false, 'error', 'below_minimum',
      'available_eur', v_eur, 'min_eur', 20);
  END IF;

  UPDATE public.video_credits
     SET credits_remaining = credits_remaining - v_avail, updated_at = now()
   WHERE user_id = v_uid;

  UPDATE public.premium_video_creator_balance
     SET withdrawn_credits = COALESCE(withdrawn_credits,0) + v_avail, updated_at = now()
   WHERE user_id = v_uid;

  INSERT INTO public.transactions (
    user_id, seller_id, buyer_id, transaction_type, item_type,
    amount, commission_rate, commission_amount, seller_amount, status
  ) VALUES (
    v_uid, v_uid, v_uid, 'creator_earnings', 'premium_video',
    v_eur, 0, 0, v_eur, 'released'
  );

  RETURN jsonb_build_object('success', true, 'credits', v_avail, 'amount_eur', v_eur);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_premium_video_withdrawable() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cashout_premium_video_earnings() TO authenticated;