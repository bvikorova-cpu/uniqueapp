CREATE OR REPLACE FUNCTION public._guard_battle_pass_premium()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow service_role (edge functions w/ service key) to flip premium
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;
  -- Allow the credit-unlock RPC to bypass this guard via a local session flag
  IF current_setting('app.bypass_battle_pass_guard', true) = 'true' THEN
    RETURN NEW;
  END IF;
  -- Block flipping false -> true from client
  IF COALESCE(OLD.has_premium, false) = false AND COALESCE(NEW.has_premium, false) = true THEN
    RAISE EXCEPTION 'has_premium can only be granted via payment webhook';
  END IF;
  -- Block setting/overwriting purchase timestamp from client
  IF NEW.premium_purchased_at IS DISTINCT FROM OLD.premium_purchased_at
     AND COALESCE(NEW.has_premium, false) = false THEN
    NEW.premium_purchased_at := OLD.premium_purchased_at;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.unlock_battle_pass_premium_credits()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  -- Temporarily bypass the premium guard trigger so this credit purchase can set has_premium
  PERFORM set_config('app.bypass_battle_pass_guard', 'true', true);

  INSERT INTO public.user_battle_pass (user_id, season_id, has_premium, premium_purchased_at)
  VALUES (v_uid, v_season, true, now())
  ON CONFLICT (user_id, season_id) DO UPDATE
    SET has_premium = true, premium_purchased_at = now();

  RETURN jsonb_build_object('ok', true, 'cost', v_cost, 'season_id', v_season);
END;
$function$;