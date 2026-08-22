CREATE OR REPLACE FUNCTION public.unlock_battle_pass_premium_credits()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_season uuid;
  v_cost integer := 30;
  v_spend jsonb;
  v_has boolean;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authenticated');
  END IF;

  SELECT id INTO v_season FROM public.battle_pass_seasons
  WHERE is_active = true ORDER BY starts_at DESC LIMIT 1;
  IF v_season IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'No active season');
  END IF;

  SELECT has_premium INTO v_has FROM public.user_battle_pass
  WHERE user_id = v_uid AND season_id = v_season;
  IF COALESCE(v_has, false) THEN
    RETURN jsonb_build_object('ok', true, 'already', true);
  END IF;

  v_spend := public.spend_ai_credits(v_cost, 'Battle Pass Premium unlock', 'battle_pass_premium');
  IF NOT COALESCE((v_spend->>'ok')::boolean, false) THEN
    RETURN jsonb_build_object('ok', false, 'error', COALESCE(v_spend->>'error', 'Not enough credits'), 'cost', v_cost);
  END IF;

  INSERT INTO public.user_battle_pass (user_id, season_id, has_premium, premium_purchased_at)
  VALUES (v_uid, v_season, true, now())
  ON CONFLICT (user_id, season_id) DO UPDATE
    SET has_premium = true, premium_purchased_at = now();

  RETURN jsonb_build_object('ok', true, 'cost', v_cost, 'season_id', v_season);
END;
$$;

GRANT EXECUTE ON FUNCTION public.unlock_battle_pass_premium_credits() TO authenticated;