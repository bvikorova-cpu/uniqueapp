
CREATE OR REPLACE FUNCTION public.brain_duel_spend_credits(_amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _new_balance integer;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;
  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'invalid_amount';
  END IF;

  -- Ensure row exists
  INSERT INTO public.brain_duel_credits (user_id, credits)
  VALUES (_uid, 100)
  ON CONFLICT (user_id) DO NOTHING;

  -- Atomic decrement with row lock
  UPDATE public.brain_duel_credits
  SET credits = credits - _amount,
      updated_at = now()
  WHERE user_id = _uid
    AND credits >= _amount
  RETURNING credits INTO _new_balance;

  IF _new_balance IS NULL THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;

  RETURN _new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.brain_duel_spend_credits(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.brain_duel_spend_credits(integer) TO authenticated;
