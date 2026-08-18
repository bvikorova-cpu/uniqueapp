CREATE OR REPLACE FUNCTION public.publish_skill_request(_title text, _description text, _category skill_category, _region text DEFAULT NULL::text, _location text DEFAULT NULL::text, _budget_eur numeric DEFAULT NULL::numeric, _deadline date DEFAULT NULL::date)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_uid uuid := auth.uid(); v_id uuid; v_today int; v_before int; v_after int;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  SELECT count(*) INTO v_today FROM public.skill_requests
   WHERE user_id = v_uid AND created_at > now() - interval '24 hours';
  IF v_today >= 10 THEN RAISE EXCEPTION 'DAILY_LIMIT_REACHED'; END IF;

  SELECT c.credits_remaining INTO v_before FROM public.ai_credits c WHERE c.user_id = v_uid FOR UPDATE;
  IF v_before IS NULL OR v_before < 2 THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;
  UPDATE public.ai_credits c SET credits_remaining = c.credits_remaining - 2, updated_at = now()
   WHERE c.user_id = v_uid RETURNING c.credits_remaining INTO v_after;

  INSERT INTO public.skill_requests (user_id, title, description, category, region, location, budget_eur, deadline)
  VALUES (v_uid, _title, _description, _category, NULLIF(_region,''), NULLIF(_location,''), _budget_eur, _deadline)
  RETURNING id INTO v_id;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
  VALUES (v_uid, -2, v_before, v_after, 'skills_marketplace_request', 'skills_marketplace', v_uid,
          jsonb_build_object('request_id', v_id));

  RETURN v_id;
END; $function$;