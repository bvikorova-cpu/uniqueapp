CREATE OR REPLACE FUNCTION public.brain_duel_daily_spin()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_today date := (now() AT TIME ZONE 'utc')::date;
  v_labels text[] := ARRAY['500 XP','1,000 XP','2,500 XP','5,000 XP','2× Power-up','750 XP','10,000 XP','+30s Power-up'];
  v_values int[]  := ARRAY[500,1000,2500,5000,0,750,10000,0];
  v_types text[]  := ARRAY['xp','xp','xp','xp','powerup','xp','xp','time_powerup'];
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

  -- No AI credits are ever awarded by spins; XP only.
  IF v_types[v_idx] = 'xp' AND v_values[v_idx] > 0 THEN
    PERFORM public.award_xp(v_user, v_values[v_idx], 'brain_duel_daily_spin', v_today::text);
  END IF;

  SELECT credits_remaining INTO v_balance FROM public.ai_credits WHERE user_id = v_user;

  RETURN jsonb_build_object(
    'index', v_idx - 1,
    'reward', jsonb_build_object('label', v_labels[v_idx], 'value', v_values[v_idx], 'type', v_types[v_idx]),
    'balance', v_balance
  );
END;
$function$;

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
  v_xp INT;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

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

  -- Weighted random XP prize. Spins NEVER award AI credits.
  v_roll := random();
  v_xp := CASE
    WHEN v_roll < 0.35 THEN 0
    WHEN v_roll < 0.70 THEN 500
    WHEN v_roll < 0.90 THEN 1000
    WHEN v_roll < 0.98 THEN 2500
    ELSE 10000
  END;

  BEGIN
    INSERT INTO public.lucky_spin_log (user_id, prize_label, prize_kind, xp_awarded)
    VALUES (v_user, v_xp::text || ' XP', 'xp', v_xp);
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('error', 'already_spun_today');
  END;

  PERFORM set_config('app.credit_reason', 'lucky_wheel_cost', true);
  PERFORM set_config('app.credit_source', 'lucky_wheel', true);
  UPDATE public.ai_credits
    SET credits_remaining = credits_remaining - v_cost,
        updated_at = now()
  WHERE user_id = v_user;

  IF v_xp > 0 THEN
    PERFORM public.award_xp(v_user, v_xp, 'lucky_wheel_prize', (now() AT TIME ZONE 'utc')::date::text);
  END IF;

  RETURN jsonb_build_object(
    'cost', v_cost,
    'prize', 0,
    'prize_kind', 'xp',
    'prize_xp', v_xp,
    'net', -v_cost,
    'balance_after', v_balance - v_cost
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.lucky_wheel_spin_secure()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_cost integer := 15;
  v_balance integer;
  v_rand numeric;
  v_acc numeric := 0;
  v_idx integer := 0;
  v_prize_value integer := 0;
  v_prize_label text := '';
  v_prizes jsonb := jsonb_build_array(
    jsonb_build_object('value', 500,   'label', '500 XP',    'chance', 25),
    jsonb_build_object('value', 1000,  'label', '1,000 XP',  'chance', 20),
    jsonb_build_object('value', 2500,  'label', '2,500 XP',  'chance', 15),
    jsonb_build_object('value', 5000,  'label', '5,000 XP',  'chance', 12),
    jsonb_build_object('value', 10000, 'label', '10,000 XP', 'chance', 8),
    jsonb_build_object('value', 0,     'label', 'Free Box',  'chance', 10),
    jsonb_build_object('value', 0,     'label', '2x Luck',   'chance', 7),
    jsonb_build_object('value', 25000, 'label', '25,000 XP', 'chance', 3)
  );
  v_p jsonb;
  v_bytes bytea;
  v_uint bigint;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('error', 'not_authenticated');
  END IF;

  SELECT credits_remaining INTO v_balance FROM public.ai_credits WHERE user_id = v_user;
  IF v_balance IS NULL OR v_balance < v_cost THEN
    RETURN jsonb_build_object('error', 'insufficient_credits', 'balance', COALESCE(v_balance, 0));
  END IF;

  PERFORM public.deduct_ai_credits(v_user, v_cost, 'lucky_wheel_cost', 'lucky_wheel_spin_secure');

  v_bytes := extensions.gen_random_bytes(4);
  v_uint := (get_byte(v_bytes, 0)::bigint << 24)
          | (get_byte(v_bytes, 1)::bigint << 16)
          | (get_byte(v_bytes, 2)::bigint << 8)
          |  get_byte(v_bytes, 3)::bigint;
  v_rand := (v_uint::numeric / 4294967296.0) * 100.0;

  FOR v_idx IN 0 .. (jsonb_array_length(v_prizes) - 1) LOOP
    v_p := v_prizes -> v_idx;
    v_acc := v_acc + (v_p ->> 'chance')::numeric;
    IF v_rand < v_acc THEN
      v_prize_value := (v_p ->> 'value')::int;
      v_prize_label := v_p ->> 'label';
      EXIT;
    END IF;
  END LOOP;

  -- XP only. Spins NEVER award AI credits.
  IF v_prize_value > 0 THEN
    PERFORM public.award_xp(v_user, v_prize_value, 'lucky_wheel_prize', v_prize_label);
  END IF;

  INSERT INTO public.ai_usage_history (user_id, usage_type, credits_used, description)
  VALUES (v_user, 'lucky_wheel_spin', v_cost, 'Lucky Wheel spin — won: ' || v_prize_label);

  SELECT credits_remaining INTO v_balance FROM public.ai_credits WHERE user_id = v_user;

  RETURN jsonb_build_object(
    'prize_index', v_idx,
    'prize_value', v_prize_value,
    'prize_kind', 'xp',
    'prize_label', v_prize_label,
    'cost', v_cost,
    'balance_after', COALESCE(v_balance, 0)
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.lucky_wheel_spin(p_cost integer, p_prize integer, p_label text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_cost IS NULL OR p_cost <= 0 THEN RAISE EXCEPTION 'Invalid spin cost'; END IF;

  PERFORM public.deduct_ai_credits(v_user, p_cost, 'lucky_wheel_cost', 'lucky_wheel_spin');

  -- Credit prizes removed: spins never award AI credits.

  INSERT INTO public.ai_usage_history (user_id, usage_type, credits_used, description)
  VALUES (v_user, 'lucky_wheel_spin', p_cost, 'Lucky Wheel spin — won: ' || COALESCE(p_label, 'nothing'));

  RETURN true;
END;
$function$;