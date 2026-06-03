CREATE OR REPLACE FUNCTION public.spin_lucky_wheel()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user UUID := auth.uid();
  v_cost INT := 5;
  v_balance INT;
  v_roll NUMERIC;
  v_prize INT;
  v_already INT;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  -- Daily limit: 1 spin per UTC day
  SELECT COUNT(*) INTO v_already
  FROM public.lucky_spin_log
  WHERE user_id = v_user
    AND created_at >= date_trunc('day', now() AT TIME ZONE 'UTC');

  IF v_already > 0 THEN
    RETURN jsonb_build_object('error', 'already_spun_today');
  END IF;

  -- Lock the credits row
  SELECT credits_remaining INTO v_balance
  FROM public.ai_credits
  WHERE user_id = v_user
  FOR UPDATE;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'No credit account' USING ERRCODE = 'P0002';
  END IF;
  IF v_balance < v_cost THEN
    RAISE EXCEPTION 'Insufficient credits' USING ERRCODE = '22023';
  END IF;

  -- Weighted random prize
  v_roll := random();
  v_prize := CASE
    WHEN v_roll < 0.40 THEN 0
    WHEN v_roll < 0.70 THEN 2
    WHEN v_roll < 0.85 THEN 5
    WHEN v_roll < 0.95 THEN 10
    WHEN v_roll < 0.99 THEN 25
    ELSE 100
  END;

  -- Deduct cost
  PERFORM set_config('app.credit_reason', 'lucky_wheel_cost', true);
  PERFORM set_config('app.credit_source', 'lucky_wheel', true);
  UPDATE public.ai_credits
    SET credits_remaining = credits_remaining - v_cost,
        updated_at = now()
  WHERE user_id = v_user;

  -- Award prize (if any)
  IF v_prize > 0 THEN
    PERFORM set_config('app.credit_reason', 'lucky_wheel_prize', true);
    PERFORM set_config('app.credit_source', 'lucky_wheel', true);
    UPDATE public.ai_credits
      SET credits_remaining = credits_remaining + v_prize,
          updated_at = now()
    WHERE user_id = v_user;
  END IF;

  -- Log the spin (enforces daily limit on next call)
  INSERT INTO public.lucky_spin_log (user_id, prize_label, prize_kind, xp_awarded)
  VALUES (v_user, v_prize::text || ' CR', 'credits', 0);

  RETURN jsonb_build_object(
    'cost', v_cost,
    'prize', v_prize,
    'net', v_prize - v_cost,
    'balance_after', v_balance - v_cost + v_prize
  );
END;
$function$;