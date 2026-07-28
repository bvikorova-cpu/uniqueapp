-- Brain Duel daily spin as an atomic SECURITY DEFINER RPC (no edge function needed)
CREATE OR REPLACE FUNCTION public.brain_duel_daily_spin()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_today date := (now() AT TIME ZONE 'utc')::date;
  v_labels text[] := ARRAY['5 Credits','10 Credits','25 Credits','50 Credits','2× Power-up','15 Credits','100 Credits','+30s Power-up'];
  v_values int[]  := ARRAY[5,10,25,50,0,15,100,0];
  v_types text[]  := ARRAY['credits','credits','credits','credits','powerup','credits','credits','time_powerup'];
  v_weights int[] := ARRAY[25,25,15,8,15,25,2,8];
  v_total int;
  v_roll numeric;
  v_idx int := 1;
  v_acc int := 0;
  i int;
  v_balance int;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('error','not_authenticated');
  END IF;

  SELECT sum(w) INTO v_total FROM unnest(v_weights) w;
  v_roll := random() * v_total;
  FOR i IN 1..array_length(v_weights,1) LOOP
    v_acc := v_acc + v_weights[i];
    IF v_roll <= v_acc THEN v_idx := i; EXIT; END IF;
  END LOOP;

  BEGIN
    INSERT INTO public.brain_duel_daily_spins (user_id, spin_date, reward_type, reward_value, reward_label)
    VALUES (v_user, v_today, v_types[v_idx], v_values[v_idx], v_labels[v_idx]);
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('error','already_spun');
  END;

  IF v_types[v_idx] = 'credits' AND v_values[v_idx] > 0 THEN
    PERFORM public.add_ai_credits(v_user, v_values[v_idx], 'brain_duel_daily_spin', 'brain_duel');
  END IF;

  SELECT credits_remaining INTO v_balance FROM public.ai_credits WHERE user_id = v_user;

  RETURN jsonb_build_object(
    'index', v_idx - 1,
    'reward', jsonb_build_object('label', v_labels[v_idx], 'value', v_values[v_idx], 'type', v_types[v_idx]),
    'balance', v_balance
  );
END;
$$;

REVOKE ALL ON FUNCTION public.brain_duel_daily_spin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.brain_duel_daily_spin() TO authenticated;

-- one spin per user per day (guards the RPC above)
CREATE UNIQUE INDEX IF NOT EXISTS brain_duel_daily_spins_user_day_uniq
  ON public.brain_duel_daily_spins (user_id, spin_date);