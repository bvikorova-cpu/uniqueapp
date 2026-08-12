CREATE OR REPLACE FUNCTION public.spend_ai_credits(_amount integer, _reason text, _source text DEFAULT 'client')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _before integer;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;
  IF _amount IS NULL OR _amount <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_amount');
  END IF;

  SELECT credits_remaining INTO _before FROM public.ai_credits WHERE user_id = _uid FOR UPDATE;
  IF _before IS NULL OR _before < _amount THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient', 'balance', COALESCE(_before, 0));
  END IF;

  UPDATE public.ai_credits
     SET credits_remaining = _before - _amount, last_used_at = now()
   WHERE user_id = _uid;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor)
  VALUES (_uid, -_amount, _before, _before - _amount, COALESCE(_reason, 'spend'), COALESCE(_source, 'client'), _uid);

  INSERT INTO public.ai_usage_history (user_id, usage_type, credits_used, description)
  VALUES (_uid, 'custom_generation', _amount, COALESCE(_reason, 'spend'));

  RETURN jsonb_build_object('ok', true, 'balance', _before - _amount);
END;
$$;
REVOKE ALL ON FUNCTION public.spend_ai_credits(integer, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.spend_ai_credits(integer, text, text) TO authenticated;