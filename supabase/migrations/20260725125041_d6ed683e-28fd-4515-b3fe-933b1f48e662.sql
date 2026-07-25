
CREATE OR REPLACE FUNCTION public.add_secret_santa_credits(p_user_id uuid, p_amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_before integer;
  v_after integer;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN RAISE EXCEPTION 'Invalid amount'; END IF;

  -- Unified AI credits pool
  INSERT INTO public.ai_credits (user_id, credits_remaining, total_credits_purchased)
  VALUES (p_user_id, p_amount, p_amount)
  ON CONFLICT (user_id) DO UPDATE
  SET credits_remaining = public.ai_credits.credits_remaining + EXCLUDED.credits_remaining,
      total_credits_purchased = public.ai_credits.total_credits_purchased + EXCLUDED.total_credits_purchased,
      updated_at = now()
  RETURNING credits_remaining - p_amount, credits_remaining
  INTO v_before, v_after;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, metadata)
  VALUES (p_user_id, p_amount, COALESCE(v_before, 0), COALESCE(v_after, p_amount), 'secret_santa_purchase', 'stripe', jsonb_build_object('purchase', true));

  RETURN true;
END;
$function$;
