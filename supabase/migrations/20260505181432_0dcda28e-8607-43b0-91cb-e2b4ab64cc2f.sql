-- Atomic spend function for comedy coins
CREATE OR REPLACE FUNCTION public.spend_comedy_coins(_amount integer)
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

  INSERT INTO public.comedy_currency (user_id, coins)
  VALUES (_uid, 0)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.comedy_currency
  SET coins = coins - _amount,
      updated_at = now()
  WHERE user_id = _uid AND coins >= _amount
  RETURNING coins INTO _new_balance;

  IF _new_balance IS NULL THEN
    RAISE EXCEPTION 'insufficient_comedy_coins';
  END IF;

  RETURN _new_balance;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_comedy_coins(_user_id uuid, _amount integer, _purchased boolean DEFAULT true)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_balance integer;
BEGIN
  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'invalid_amount';
  END IF;

  INSERT INTO public.comedy_currency (user_id, coins, total_coins_purchased)
  VALUES (_user_id, _amount, CASE WHEN _purchased THEN _amount ELSE 0 END)
  ON CONFLICT (user_id) DO UPDATE
    SET coins = public.comedy_currency.coins + EXCLUDED.coins,
        total_coins_purchased = public.comedy_currency.total_coins_purchased
          + CASE WHEN _purchased THEN EXCLUDED.coins ELSE 0 END,
        updated_at = now()
  RETURNING coins INTO _new_balance;

  RETURN _new_balance;
END;
$$;