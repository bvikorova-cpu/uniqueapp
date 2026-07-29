CREATE OR REPLACE FUNCTION public.analyzer_spend_credits(_amount integer, _reason text DEFAULT 'analyzer_spend')
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid := auth.uid();
  _new integer;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;
  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'invalid_amount';
  END IF;

  PERFORM public.deduct_ai_credits(_uid, _amount, COALESCE(_reason, 'analyzer_spend'), 'analyzer');

  SELECT credits_remaining INTO _new FROM public.ai_credits WHERE user_id = _uid;
  RETURN COALESCE(_new, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.analyzer_spend_credits(integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.analyzer_spend_credits(integer, text) TO service_role;