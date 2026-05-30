CREATE OR REPLACE FUNCTION public.spin_lucky_wheel()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_today_count int;
  v_roll int;
  v_prize text;
  v_kind text;
  v_xp int := 0;
  v_item text := NULL;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('error','not_authenticated'); END IF;

  -- Serialize concurrent spins per user within the transaction
  PERFORM pg_advisory_xact_lock(hashtextextended('lucky_spin:' || v_uid::text, 0));

  SELECT count(*) INTO v_today_count FROM lucky_spin_log
    WHERE user_id = v_uid AND created_at >= date_trunc('day', now());
  IF v_today_count >= 1 THEN RETURN jsonb_build_object('error','already_spun_today'); END IF;

  v_roll := floor(random() * 100)::int;
  IF    v_roll < 30 THEN v_prize := '+25 XP';            v_kind := 'xp';   v_xp := 25;
  ELSIF v_roll < 55 THEN v_prize := '+50 XP';            v_kind := 'xp';   v_xp := 50;
  ELSIF v_roll < 70 THEN v_prize := '+100 XP';           v_kind := 'xp';   v_xp := 100;
  ELSIF v_roll < 80 THEN v_prize := 'Streak Shield';     v_kind := 'item'; v_item := 'streak-shield';
  ELSIF v_roll < 88 THEN v_prize := 'Mystery Badge';     v_kind := 'item'; v_item := 'mystery-box';
  ELSIF v_roll < 93 THEN v_prize := '+200 XP';           v_kind := 'xp';   v_xp := 200;
  ELSIF v_roll < 98 THEN v_prize := '1 Free AI Credit';  v_kind := 'item'; v_item := 'ai-credits-10';
  ELSE                   v_prize := 'JACKPOT +500 XP';   v_kind := 'xp';   v_xp := 500;
  END IF;

  IF v_xp > 0 THEN PERFORM add_user_points(v_uid, v_xp, 'lucky_spin', v_prize); END IF;
  IF v_item IS NOT NULL THEN
    INSERT INTO rewards_inventory (user_id, item_code, quantity) VALUES (v_uid, v_item, 1)
    ON CONFLICT (user_id, item_code) DO UPDATE SET quantity = rewards_inventory.quantity + 1;
  END IF;
  INSERT INTO lucky_spin_log (user_id, prize_label, prize_kind, xp_awarded, item_code)
  VALUES (v_uid, v_prize, v_kind, v_xp, v_item);
  RETURN jsonb_build_object('prize', v_prize, 'kind', v_kind, 'xp', v_xp, 'item', v_item);
END;
$function$;

CREATE OR REPLACE FUNCTION public.place_xp_bet(_challenge_type text, _target integer, _amount integer, _hours integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_balance int;
  v_bet_id uuid;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('error','not_authenticated'); END IF;
  IF _challenge_type NOT IN ('posts','comments','hashtags','spins') THEN
    RETURN jsonb_build_object('error','invalid_challenge_type');
  END IF;
  IF _target IS NULL OR _amount IS NULL OR _hours IS NULL
     OR _target <= 0 OR _target > 1000
     OR _amount <= 0 OR _amount > 10000
     OR _hours <= 0 OR _hours > 168 THEN
    RETURN jsonb_build_object('error','invalid_parameters');
  END IF;

  -- Prevent concurrent duplicate active bets per user
  PERFORM pg_advisory_xact_lock(hashtextextended('xp_bet:' || v_uid::text, 0));

  IF EXISTS (SELECT 1 FROM xp_bets WHERE user_id = v_uid AND status = 'pending') THEN
    RETURN jsonb_build_object('error','active_bet_exists');
  END IF;
  SELECT total_points INTO v_balance FROM user_points WHERE user_id = v_uid;
  IF COALESCE(v_balance,0) < _amount THEN
    RETURN jsonb_build_object('error','insufficient_xp','balance',COALESCE(v_balance,0));
  END IF;
  PERFORM add_user_points(v_uid, -_amount, 'xp_bet_stake', _challenge_type);
  INSERT INTO xp_bets (user_id, challenge_type, challenge_target, bet_amount, ends_at)
  VALUES (v_uid, _challenge_type, _target, _amount, now() + make_interval(hours => _hours))
  RETURNING id INTO v_bet_id;
  RETURN jsonb_build_object('ok',true,'bet_id',v_bet_id);
END;
$function$;