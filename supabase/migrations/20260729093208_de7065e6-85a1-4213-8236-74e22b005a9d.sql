CREATE OR REPLACE FUNCTION public.spend_unified_ai_credits_for_user(
  p_user_id uuid,
  p_amount integer,
  p_reason text DEFAULT 'ai_spend',
  p_source text DEFAULT 'edge_function'
)
RETURNS TABLE(
  free_spent integer,
  paid_spent integer,
  free_balance integer,
  paid_balance integer,
  total_balance integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_free_balance integer := 0;
  v_paid_balance integer := 0;
  v_free_spent integer := 0;
  v_paid_spent integer := 0;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Missing user id';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  INSERT INTO public.free_tier_credits (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.ai_credits (user_id, credits_remaining, total_credits_purchased, updated_at)
  VALUES (p_user_id, 0, 0, now())
  ON CONFLICT (user_id) DO NOTHING;

  SELECT COALESCE(balance, 0)
    INTO v_free_balance
    FROM public.free_tier_credits
   WHERE user_id = p_user_id
   FOR UPDATE;

  SELECT COALESCE(credits_remaining, 0)
    INTO v_paid_balance
    FROM public.ai_credits
   WHERE user_id = p_user_id
   FOR UPDATE;

  IF COALESCE(v_free_balance, 0) + COALESCE(v_paid_balance, 0) < p_amount THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
  END IF;

  v_free_spent := LEAST(COALESCE(v_free_balance, 0), p_amount);
  v_paid_spent := p_amount - v_free_spent;

  IF v_free_spent > 0 THEN
    UPDATE public.free_tier_credits
       SET balance = balance - v_free_spent,
           updated_at = now()
     WHERE user_id = p_user_id
     RETURNING balance INTO v_free_balance;

    INSERT INTO public.free_tier_credit_ledger (user_id, delta, reason, balance_after)
    VALUES (p_user_id, -v_free_spent, COALESCE(p_reason, 'ai_spend'), v_free_balance);
  END IF;

  IF v_paid_spent > 0 THEN
    PERFORM set_config('app.credit_reason', COALESCE(p_reason, 'ai_spend'), true);
    PERFORM set_config('app.credit_source', COALESCE(p_source, 'edge_function'), true);

    UPDATE public.ai_credits
       SET credits_remaining = credits_remaining - v_paid_spent,
           last_used_at = now(),
           updated_at = now()
     WHERE user_id = p_user_id
     RETURNING credits_remaining INTO v_paid_balance;
  END IF;

  RETURN QUERY SELECT
    v_free_spent,
    v_paid_spent,
    COALESCE(v_free_balance, 0),
    COALESCE(v_paid_balance, 0),
    COALESCE(v_free_balance, 0) + COALESCE(v_paid_balance, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.spend_unified_ai_credits_for_user(uuid, integer, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.spend_unified_ai_credits_for_user(uuid, integer, text, text) TO service_role;