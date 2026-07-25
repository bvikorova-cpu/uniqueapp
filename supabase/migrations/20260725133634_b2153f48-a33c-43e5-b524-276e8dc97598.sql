
CREATE OR REPLACE FUNCTION public.deduct_ai_credits(p_user_id uuid, p_amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
      last_used_at = now(),
      updated_at = now()
  WHERE user_id = p_user_id;

  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.deduct_ai_credits(p_user_id uuid, p_amount integer, p_reason text DEFAULT 'manual_deduct'::text, p_source text DEFAULT 'rpc'::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

  IF v_remaining IS NULL THEN RAISE EXCEPTION 'No credit balance for user'; END IF;
  IF v_remaining < p_amount THEN RAISE EXCEPTION 'Insufficient credits'; END IF;

  PERFORM set_config('app.credit_reason', COALESCE(p_reason,'manual_deduct'), true);
  PERFORM set_config('app.credit_source', COALESCE(p_source,'rpc'), true);

  UPDATE public.ai_credits
  SET credits_remaining = credits_remaining - p_amount,
      last_used_at = now(),
      updated_at = now()
  WHERE user_id = p_user_id;

  RETURN true;
END;
$function$;
