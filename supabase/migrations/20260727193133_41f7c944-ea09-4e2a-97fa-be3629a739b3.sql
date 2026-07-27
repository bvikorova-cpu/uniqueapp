CREATE OR REPLACE FUNCTION public.consume_free_tier_credits_for_user(
  p_user_id uuid,
  p_amount integer,
  p_reason text DEFAULT 'spend'
)
RETURNS public.free_tier_credits
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_row public.free_tier_credits;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Missing user id';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  UPDATE public.free_tier_credits
     SET balance = balance - p_amount,
         updated_at = now()
   WHERE user_id = p_user_id
     AND balance >= p_amount
   RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INSUFFICIENT_FREE_TIER_CREDITS';
  END IF;

  INSERT INTO public.free_tier_credit_ledger (user_id, delta, reason, balance_after)
  VALUES (p_user_id, -p_amount, COALESCE(p_reason, 'spend'), v_row.balance);

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_free_tier_credits_for_user(uuid, integer, text) TO service_role;
REVOKE ALL ON FUNCTION public.consume_free_tier_credits_for_user(uuid, integer, text) FROM anon, authenticated;