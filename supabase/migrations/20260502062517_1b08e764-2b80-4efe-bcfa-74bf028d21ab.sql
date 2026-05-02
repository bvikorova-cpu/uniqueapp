CREATE OR REPLACE FUNCTION public.deduct_ai_credits(p_user_id uuid, p_amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_remaining integer;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  SELECT credits_remaining INTO v_remaining
  FROM public.ai_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_remaining IS NULL THEN
    RAISE EXCEPTION 'No credit balance for user';
  END IF;

  IF v_remaining < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  UPDATE public.ai_credits
  SET credits_remaining = credits_remaining - p_amount,
      credits_used = COALESCE(credits_used, 0) + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.deduct_ai_credits(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.deduct_ai_credits(uuid, integer) TO authenticated, service_role;