CREATE OR REPLACE FUNCTION public.purchase_verified_with_credits()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _cost int := 30;
  _balance int;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = _uid AND verification_tier <> 'none') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_verified');
  END IF;

  SELECT credits_remaining INTO _balance FROM public.ai_credits WHERE user_id = _uid FOR UPDATE;
  IF _balance IS NULL OR _balance < _cost THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient_credits', 'cost', _cost);
  END IF;

  PERFORM set_config('app.credit_reason', 'verified_badge_purchase', true);
  PERFORM set_config('app.credit_source', 'rpc:purchase_verified_with_credits', true);

  UPDATE public.ai_credits
  SET credits_remaining = credits_remaining - _cost,
      last_used_at = now()
  WHERE user_id = _uid;

  INSERT INTO public.ai_usage_history (user_id, usage_type, credits_used, description)
  VALUES (_uid, 'custom_generation', _cost, '[paid] Unique Verified badge (one-time)');

  UPDATE public.profiles SET verification_tier = 'verified' WHERE id = _uid;

  RETURN jsonb_build_object('ok', true, 'cost', _cost);
END;
$$;