ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS featured_until timestamptz,
  ADD COLUMN IF NOT EXISTS featured_at timestamptz,
  ADD COLUMN IF NOT EXISTS premium_until timestamptz,
  ADD COLUMN IF NOT EXISTS premium_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_courses_promo ON public.courses (premium_until DESC, featured_until DESC);

CREATE OR REPLACE FUNCTION public.course_top_listing(_course_id uuid, _days integer, _tier text DEFAULT 'top')
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

  IF NOT EXISTS (SELECT 1 FROM public.courses c WHERE c.id = _course_id AND c.creator_id = v_uid) THEN
    RAISE EXCEPTION 'NOT_OWNER';
  END IF;

  SELECT c.credits_remaining INTO v_before FROM public.ai_credits c WHERE c.user_id = v_uid FOR UPDATE;
  IF v_before IS NULL OR v_before < v_cost THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;
  UPDATE public.ai_credits c SET credits_remaining = c.credits_remaining - v_cost, updated_at = now()
   WHERE c.user_id = v_uid RETURNING c.credits_remaining INTO v_after;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
  VALUES (v_uid, -v_cost, v_before, v_after,
          CASE WHEN _tier='premium' THEN 'course_premium_listing' ELSE 'course_top_listing' END,
          'tutorial_platform', v_uid, jsonb_build_object('course_id', _course_id, 'days', _days, 'tier', _tier));

  IF _tier = 'premium' THEN
    SELECT GREATEST(now(), COALESCE(c.premium_until, now())) INTO v_base FROM public.courses c WHERE c.id = _course_id;
    v_until := v_base + (_days || ' days')::interval;
    UPDATE public.courses c
       SET premium_until = v_until, premium_at = COALESCE(c.premium_at, now()), updated_at = now()
     WHERE c.id = _course_id;
  ELSE
    SELECT GREATEST(now(), COALESCE(c.featured_until, now())) INTO v_base FROM public.courses c WHERE c.id = _course_id;
    v_until := v_base + (_days || ' days')::interval;
    UPDATE public.courses c
       SET featured_until = v_until, featured_at = COALESCE(c.featured_at, now()), updated_at = now()
     WHERE c.id = _course_id;
  END IF;

  RETURN QUERY SELECT v_until, v_after, _tier;
END;
$function$;

REVOKE ALL ON FUNCTION public.course_top_listing(uuid, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.course_top_listing(uuid, integer, text) TO authenticated;