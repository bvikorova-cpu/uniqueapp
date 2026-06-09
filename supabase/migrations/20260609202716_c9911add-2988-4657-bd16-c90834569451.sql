-- Batch 8: atomic increment helper for ai_credits (used by monthly-credits-grant cron)
CREATE OR REPLACE FUNCTION public.increment_ai_credits(p_user_id uuid, p_amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance integer;
BEGIN
  IF p_amount <= 0 THEN RAISE EXCEPTION 'amount must be positive'; END IF;

  INSERT INTO public.ai_credits (user_id, credits_remaining, total_credits_purchased)
  VALUES (p_user_id, p_amount, 0)
  ON CONFLICT (user_id) DO UPDATE
    SET credits_remaining = public.ai_credits.credits_remaining + EXCLUDED.credits_remaining,
        updated_at = now()
  RETURNING credits_remaining INTO v_new_balance;

  RETURN v_new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_ai_credits(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_ai_credits(uuid, integer) TO service_role;