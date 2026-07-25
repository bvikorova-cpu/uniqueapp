
CREATE OR REPLACE FUNCTION public.deduct_secret_santa_credits(p_user_id uuid, p_amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE v_remaining integer;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN RAISE EXCEPTION 'Invalid amount'; END IF;

  INSERT INTO public.ai_credits (user_id, credits_remaining, total_credits_purchased)
  VALUES (p_user_id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT credits_remaining INTO v_remaining FROM public.ai_credits
    WHERE user_id = p_user_id FOR UPDATE;

  IF v_remaining IS NULL OR v_remaining < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- Tag the ledger row so it never shows as 'unknown_update'
  PERFORM set_config('app.credit_reason', 'secret_santa_gift', true);
  PERFORM set_config('app.credit_source', 'secret_santa', true);

  UPDATE public.ai_credits
    SET credits_remaining = credits_remaining - p_amount,
        last_used_at = now()
    WHERE user_id = p_user_id;

  RETURN true;
END;
$function$;
