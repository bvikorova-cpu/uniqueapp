CREATE OR REPLACE FUNCTION public.spend_ai_credits_for_user(
  p_user_id uuid,
  p_amount integer,
  p_reason text,
  p_source text DEFAULT 'edge_function'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_before integer;
BEGIN
  IF p_user_id IS NULL OR p_amount IS NULL OR p_amount <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_request');
  END IF;

  SELECT credits_remaining
    INTO v_before
    FROM public.ai_credits
   WHERE user_id = p_user_id
   FOR UPDATE;

  IF v_before IS NULL OR v_before < p_amount THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient', 'balance', COALESCE(v_before, 0));
  END IF;

  UPDATE public.ai_credits
     SET credits_remaining = v_before - p_amount,
         last_used_at = now(),
         updated_at = now()
   WHERE user_id = p_user_id;

  INSERT INTO public.ai_credits_ledger
    (user_id, delta, balance_before, balance_after, reason, source, actor)
  VALUES
    (p_user_id, -p_amount, v_before, v_before - p_amount,
     COALESCE(p_reason, 'spend'), COALESCE(p_source, 'edge_function'), p_user_id);

  INSERT INTO public.ai_usage_history
    (user_id, usage_type, credits_used, description)
  VALUES
    (p_user_id, 'custom_generation', p_amount, COALESCE(p_reason, 'spend'));

  RETURN jsonb_build_object('ok', true, 'balance', v_before - p_amount);
END;
$$;

REVOKE ALL ON FUNCTION public.spend_ai_credits_for_user(uuid, integer, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.spend_ai_credits_for_user(uuid, integer, text, text) TO service_role;