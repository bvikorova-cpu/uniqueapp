
CREATE OR REPLACE FUNCTION public.lucky_wheel_spin_secure()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
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
    jsonb_build_object('value', 5,   'label', '5 Credits',   'chance', 25),
    jsonb_build_object('value', 10,  'label', '10 Credits',  'chance', 20),
    jsonb_build_object('value', 25,  'label', '25 Credits',  'chance', 15),
    jsonb_build_object('value', 50,  'label', '50 Credits',  'chance', 12),
    jsonb_build_object('value', 100, 'label', '100 Credits', 'chance', 8),
    jsonb_build_object('value', 0,   'label', 'Free Box',    'chance', 10),
    jsonb_build_object('value', 0,   'label', '2x Luck',     'chance', 7),
    jsonb_build_object('value', 250, 'label', '250 Credits', 'chance', 3)
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

  -- CSPRNG: 4 bytes from pgcrypto → uint32 → [0,100)
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

  IF v_prize_value > 0 THEN
    PERFORM public.add_ai_credits(v_user, v_prize_value, 'lucky_wheel_prize:' || v_prize_label, 'lucky_wheel_spin_secure');
  END IF;

  INSERT INTO public.ai_usage_history (user_id, usage_type, credits_used, description)
  VALUES (v_user, 'lucky_wheel_spin', v_cost, 'Lucky Wheel spin — won: ' || v_prize_label);

  SELECT credits_remaining INTO v_balance FROM public.ai_credits WHERE user_id = v_user;

  RETURN jsonb_build_object(
    'prize_index', v_idx,
    'prize_value', v_prize_value,
    'prize_label', v_prize_label,
    'cost', v_cost,
    'balance_after', COALESCE(v_balance, 0)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.lucky_wheel_spin_secure() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.lucky_wheel_spin_secure() TO authenticated;
