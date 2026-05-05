CREATE OR REPLACE FUNCTION public.spend_glamour_coins(_amount integer)
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
  INSERT INTO public.glamour_coins (user_id, balance, total_spent, total_purchased)
  VALUES (_uid, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.glamour_coins
  SET balance = balance - _amount,
      total_spent = COALESCE(total_spent, 0) + _amount,
      updated_at = now()
  WHERE user_id = _uid AND balance >= _amount
  RETURNING balance INTO _new_balance;

  IF _new_balance IS NULL THEN
    RAISE EXCEPTION 'insufficient_glamour_coins';
  END IF;

  RETURN _new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.spend_glamour_coins(integer) FROM public;
GRANT EXECUTE ON FUNCTION public.spend_glamour_coins(integer) TO authenticated;