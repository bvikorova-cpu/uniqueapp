CREATE OR REPLACE FUNCTION public.brain_duel_spend_credits(_amount integer)
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

  PERFORM public.deduct_ai_credits(_uid, _amount, 'brain_duel_spend', 'brain_duel');

  SELECT credits_remaining INTO _new
  FROM public.ai_credits
  WHERE user_id = _uid;

  RETURN COALESCE(_new, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.spend_brain_duel_credits(p_user_id uuid, p_amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Missing user id';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  PERFORM public.deduct_ai_credits(p_user_id, p_amount, 'brain_duel_spend', 'brain_duel');
END;
$$;

CREATE OR REPLACE FUNCTION public.award_brain_duel_credits(p_user_id uuid, p_amount integer, p_reason text DEFAULT 'brain_duel_award'::text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_new integer;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Missing user id';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  PERFORM public.add_ai_credits(p_user_id, p_amount, COALESCE(p_reason, 'brain_duel_award'), 'brain_duel');

  SELECT credits_remaining INTO v_new
  FROM public.ai_credits
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_new, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.brain_duel_spend_credits(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.brain_duel_spend_credits(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.spend_brain_duel_credits(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.spend_brain_duel_credits(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.award_brain_duel_credits(uuid, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_brain_duel_credits(uuid, integer, text) TO service_role;

-- Do not rewrite the legacy brain_duel_credits rows here: that table has
-- an anti-cheat trigger and is no longer the displayed/spendable wallet after
-- this migration. The frontend and Brain Duel server functions read ai_credits.