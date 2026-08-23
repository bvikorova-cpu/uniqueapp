CREATE OR REPLACE FUNCTION public.buy_streak_freeze_credits(_qty integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_cost integer;
  v_spend jsonb;
  v_existing public.user_streak_freezes%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated'); END IF;
  v_cost := CASE _qty WHEN 1 THEN 1 WHEN 3 THEN 3 WHEN 7 THEN 6 ELSE NULL END;
  IF v_cost IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'invalid_pack'); END IF;

  v_spend := public.spend_ai_credits(v_cost, 'Streak Freeze x' || _qty, 'streak_freeze');
  IF NOT COALESCE((v_spend->>'ok')::boolean, false) THEN
    RETURN jsonb_build_object('ok', false, 'error', COALESCE(v_spend->>'error', 'insufficient_credits'));
  END IF;

  SELECT * INTO v_existing FROM public.user_streak_freezes WHERE user_id = v_uid;
  IF v_existing.user_id IS NULL THEN
    INSERT INTO public.user_streak_freezes (user_id, available_count, total_purchased)
      VALUES (v_uid, _qty, _qty);
  ELSE
    UPDATE public.user_streak_freezes
       SET available_count = COALESCE(available_count, 0) + _qty,
           total_purchased = COALESCE(total_purchased, 0) + _qty
     WHERE user_id = v_uid;
  END IF;

  INSERT INTO public.streak_freeze_history (user_id, action, quantity, cost_xp)
    VALUES (v_uid, 'purchased', _qty, 0);

  RETURN jsonb_build_object('ok', true, 'credits_spent', v_cost);
END;
$$;
REVOKE ALL ON FUNCTION public.buy_streak_freeze_credits(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.buy_streak_freeze_credits(integer) TO authenticated;