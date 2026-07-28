CREATE OR REPLACE FUNCTION public.purchase_brain_duel_powerup(p_powerup_type text, p_price integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF p_powerup_type IS NULL OR length(trim(p_powerup_type)) = 0 THEN
    RAISE EXCEPTION 'invalid_powerup_type';
  END IF;

  IF p_price IS NULL OR p_price <= 0 THEN
    RAISE EXCEPTION 'invalid_price';
  END IF;

  PERFORM public.deduct_ai_credits(v_uid, p_price, 'brain_duel_powerup_purchase', 'brain_duel');

  INSERT INTO public.brain_duel_powerups (user_id, powerup_type, quantity)
  VALUES (v_uid, p_powerup_type, 1)
  ON CONFLICT (user_id, powerup_type)
  DO UPDATE SET
    quantity = brain_duel_powerups.quantity + 1,
    updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.purchase_brain_duel_powerup(text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.purchase_brain_duel_powerup(text, integer) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.brain_duel_spend_credits(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.brain_duel_spend_credits(integer) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.spend_brain_duel_credits(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.spend_brain_duel_credits(uuid, integer) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.award_brain_duel_credits(uuid, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_brain_duel_credits(uuid, integer, text) TO authenticated, service_role;