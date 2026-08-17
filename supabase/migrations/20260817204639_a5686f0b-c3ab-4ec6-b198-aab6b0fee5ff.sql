ALTER TABLE public.skill_offerings
  ADD COLUMN IF NOT EXISTS featured_at timestamptz,
  ADD COLUMN IF NOT EXISTS premium_at timestamptz;

CREATE OR REPLACE FUNCTION public.skill_top_listing(
  _offering_id uuid,
  _days integer,
  _tier text DEFAULT 'top'::text
)
RETURNS TABLE(promoted_until timestamptz, credits_remaining integer, tier text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_cost int;
  v_before int;
  v_after int;
  v_base timestamptz;
  v_until timestamptz;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'NOT_AUTHENTICATED'; END IF;
  IF _tier NOT IN ('top','premium') THEN RAISE EXCEPTION 'INVALID_TIER'; END IF;
  IF _tier = 'premium' THEN
    IF _days <> 30 THEN RAISE EXCEPTION 'INVALID_DURATION'; END IF;
    v_cost := 100;
  ELSE
    v_cost := CASE _days WHEN 7 THEN 15 WHEN 14 THEN 25 WHEN 30 THEN 45 ELSE NULL END;
  END IF;
  IF v_cost IS NULL THEN RAISE EXCEPTION 'INVALID_DURATION'; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.skill_offerings o WHERE o.id = _offering_id AND o.user_id = v_uid) THEN
    RAISE EXCEPTION 'NOT_OWNER';
  END IF;

  SELECT c.credits_remaining INTO v_before FROM public.ai_credits c WHERE c.user_id = v_uid FOR UPDATE;
  IF v_before IS NULL OR v_before < v_cost THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;
  UPDATE public.ai_credits c SET credits_remaining = c.credits_remaining - v_cost, updated_at = now()
   WHERE c.user_id = v_uid RETURNING c.credits_remaining INTO v_after;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
  VALUES (v_uid, -v_cost, v_before, v_after,
          CASE WHEN _tier='premium' THEN 'skills_premium_listing' ELSE 'skills_top_listing' END,
          'skills_marketplace', v_uid,
          jsonb_build_object('offering_id', _offering_id, 'days', _days, 'tier', _tier));

  IF _tier = 'premium' THEN
    SELECT GREATEST(now(), COALESCE(o.premium_until, now())) INTO v_base FROM public.skill_offerings o WHERE o.id = _offering_id;
    v_until := v_base + (_days || ' days')::interval;
    UPDATE public.skill_offerings o
       SET premium_until = v_until,
           premium_at = COALESCE(o.premium_at, now()),
           updated_at = now()
     WHERE o.id = _offering_id;
  ELSE
    SELECT GREATEST(now(), COALESCE(o.featured_until, now())) INTO v_base FROM public.skill_offerings o WHERE o.id = _offering_id;
    v_until := v_base + (_days || ' days')::interval;
    UPDATE public.skill_offerings o
       SET featured_until = v_until,
           featured_at = COALESCE(o.featured_at, now()),
           updated_at = now()
     WHERE o.id = _offering_id;
  END IF;

  RETURN QUERY SELECT v_until, v_after, _tier;
END;
$function$;