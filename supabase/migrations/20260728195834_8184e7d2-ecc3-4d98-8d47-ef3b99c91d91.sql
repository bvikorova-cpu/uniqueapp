CREATE OR REPLACE FUNCTION public.brain_duel_activate_combo(
  _combo_type text,
  _powerup_1 text,
  _powerup_2 text,
  _effect_description text,
  _cost integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;
  IF _powerup_1 IS NULL OR _powerup_2 IS NULL OR length(trim(_powerup_1)) = 0 OR length(trim(_powerup_2)) = 0 THEN
    RAISE EXCEPTION 'invalid_powerup_type';
  END IF;
  IF _cost IS NULL OR _cost <= 0 THEN
    RAISE EXCEPTION 'invalid_price';
  END IF;

  PERFORM public.deduct_ai_credits(v_uid, _cost, 'brain_duel_combo_purchase', 'brain_duel');

  INSERT INTO public.brain_duel_powerup_combos (user_id, combo_type, powerup_1, powerup_2, effect_description, credits_cost)
  VALUES (v_uid, _combo_type, _powerup_1, _powerup_2, _effect_description, _cost);

  INSERT INTO public.brain_duel_powerups (user_id, powerup_type, quantity)
  VALUES (v_uid, _powerup_1, 1)
  ON CONFLICT (user_id, powerup_type)
  DO UPDATE SET quantity = brain_duel_powerups.quantity + 1, updated_at = now();

  INSERT INTO public.brain_duel_powerups (user_id, powerup_type, quantity)
  VALUES (v_uid, _powerup_2, 1)
  ON CONFLICT (user_id, powerup_type)
  DO UPDATE SET quantity = brain_duel_powerups.quantity + 1, updated_at = now();

  RETURN jsonb_build_object('ok', true, 'powerups', jsonb_build_array(_powerup_1, _powerup_2));
END;
$$;

GRANT EXECUTE ON FUNCTION public.brain_duel_activate_combo(text, text, text, text, integer) TO authenticated;