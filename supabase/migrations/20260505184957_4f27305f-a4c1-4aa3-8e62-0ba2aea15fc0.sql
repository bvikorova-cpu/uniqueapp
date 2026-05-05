-- Helper: add credits atomically
CREATE OR REPLACE FUNCTION public.add_ai_credits(p_user_id uuid, p_amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  INSERT INTO public.ai_credits (user_id, credits_remaining)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id) DO UPDATE
  SET credits_remaining = public.ai_credits.credits_remaining + EXCLUDED.credits_remaining,
      updated_at = now();

  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.add_ai_credits(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_ai_credits(uuid, integer) TO authenticated, service_role;

-- Atomic mystery box purchase
CREATE OR REPLACE FUNCTION public.purchase_mystery_box(p_box_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_price integer;
  v_name text;
  v_user_box uuid;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT price, name INTO v_price, v_name FROM public.mystery_boxes WHERE id = p_box_id;
  IF v_price IS NULL THEN RAISE EXCEPTION 'Box not found'; END IF;

  PERFORM public.deduct_ai_credits(v_user, v_price);

  INSERT INTO public.user_mystery_boxes (user_id, box_id)
  VALUES (v_user, p_box_id)
  RETURNING id INTO v_user_box;

  INSERT INTO public.ai_usage_history (user_id, usage_type, credits_used, description)
  VALUES (v_user, 'mystery_box_purchase', v_price, 'Purchased ' || v_name);

  RETURN v_user_box;
END;
$$;
REVOKE ALL ON FUNCTION public.purchase_mystery_box(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.purchase_mystery_box(uuid) TO authenticated;

-- Atomic gift credits
CREATE OR REPLACE FUNCTION public.gift_ai_credits(p_recipient_email text, p_amount integer, p_message text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender uuid := auth.uid();
  v_recipient uuid;
BEGIN
  IF v_sender IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_amount IS NULL OR p_amount < 10 THEN RAISE EXCEPTION 'Minimum gift is 10 credits'; END IF;

  SELECT id INTO v_recipient FROM public.profiles WHERE email = p_recipient_email LIMIT 1;
  IF v_recipient IS NULL THEN RAISE EXCEPTION 'Recipient not found'; END IF;
  IF v_recipient = v_sender THEN RAISE EXCEPTION 'Cannot gift to yourself'; END IF;

  PERFORM public.deduct_ai_credits(v_sender, p_amount);
  PERFORM public.add_ai_credits(v_recipient, p_amount);

  INSERT INTO public.ai_usage_history (user_id, usage_type, credits_used, description)
  VALUES (v_sender, 'gift_credits', p_amount,
    'Gifted ' || p_amount || ' credits to ' || p_recipient_email ||
    COALESCE(' — "' || p_message || '"', ''));

  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.gift_ai_credits(text, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.gift_ai_credits(text, integer, text) TO authenticated;

-- Atomic lucky wheel spin: deduct cost, optionally add prize, log
CREATE OR REPLACE FUNCTION public.lucky_wheel_spin(p_cost integer, p_prize integer, p_label text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_cost IS NULL OR p_cost <= 0 THEN RAISE EXCEPTION 'Invalid spin cost'; END IF;
  IF p_prize IS NULL OR p_prize < 0 THEN p_prize := 0; END IF;

  PERFORM public.deduct_ai_credits(v_user, p_cost);

  IF p_prize > 0 THEN
    PERFORM public.add_ai_credits(v_user, p_prize);
  END IF;

  INSERT INTO public.ai_usage_history (user_id, usage_type, credits_used, description)
  VALUES (v_user, 'lucky_wheel_spin', p_cost, 'Lucky Wheel spin — won: ' || COALESCE(p_label, 'nothing'));

  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.lucky_wheel_spin(integer, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.lucky_wheel_spin(integer, integer, text) TO authenticated;

-- Atomic open mystery box: verify ownership, mark opened, pick reward
CREATE OR REPLACE FUNCTION public.open_mystery_box(p_user_box_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_box_id uuid;
  v_is_opened boolean;
  v_owner uuid;
  v_total numeric;
  v_pick numeric;
  v_cum numeric := 0;
  v_item record;
  v_reward_id uuid;
  v_chosen_item_id uuid;
  v_chosen_name text;
  v_chosen_rarity text;
  v_chosen_type text;
  v_chosen_data jsonb;
  v_duration integer;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT user_id, box_id, COALESCE(is_opened, false)
    INTO v_owner, v_box_id, v_is_opened
  FROM public.user_mystery_boxes
  WHERE id = p_user_box_id
  FOR UPDATE;

  IF v_owner IS NULL THEN RAISE EXCEPTION 'Box not found'; END IF;
  IF v_owner <> v_user THEN RAISE EXCEPTION 'Not your box'; END IF;
  IF v_is_opened THEN RAISE EXCEPTION 'Box already opened'; END IF;

  SELECT COALESCE(SUM(drop_chance), 0) INTO v_total
  FROM public.mystery_box_items WHERE box_id = v_box_id;

  IF v_total <= 0 THEN RAISE EXCEPTION 'Box has no items configured'; END IF;

  v_pick := random() * v_total;

  FOR v_item IN
    SELECT id, item_name, item_type, item_data, rarity::text AS rarity, drop_chance, duration_days
    FROM public.mystery_box_items
    WHERE box_id = v_box_id
    ORDER BY drop_chance DESC, id
  LOOP
    v_cum := v_cum + v_item.drop_chance;
    IF v_pick <= v_cum THEN
      v_chosen_item_id := v_item.id;
      v_chosen_name := v_item.item_name;
      v_chosen_type := v_item.item_type;
      v_chosen_rarity := v_item.rarity;
      v_chosen_data := v_item.item_data;
      v_duration := v_item.duration_days;
      EXIT;
    END IF;
  END LOOP;

  UPDATE public.user_mystery_boxes
  SET is_opened = true, opened_at = now()
  WHERE id = p_user_box_id;

  INSERT INTO public.mystery_box_rewards (user_id, user_box_id, item_id, expires_at, is_active)
  VALUES (v_user, p_user_box_id, v_chosen_item_id,
          CASE WHEN v_duration IS NOT NULL THEN now() + (v_duration || ' days')::interval ELSE NULL END,
          true)
  RETURNING id INTO v_reward_id;

  RETURN jsonb_build_object(
    'reward_id', v_reward_id,
    'item_id', v_chosen_item_id,
    'item_name', v_chosen_name,
    'item_type', v_chosen_type,
    'rarity', v_chosen_rarity,
    'item_data', v_chosen_data
  );
END;
$$;
REVOKE ALL ON FUNCTION public.open_mystery_box(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.open_mystery_box(uuid) TO authenticated;