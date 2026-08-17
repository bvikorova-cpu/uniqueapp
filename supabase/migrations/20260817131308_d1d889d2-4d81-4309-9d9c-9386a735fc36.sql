DROP FUNCTION IF EXISTS public.property_top_listing(uuid, integer);

CREATE OR REPLACE FUNCTION public.property_top_listing(_property_id uuid, _days integer, _tier text DEFAULT 'top')
RETURNS TABLE(featured_until timestamptz, credits_remaining integer, tier text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _cost int;
  _before int;
  _after int;
  _base timestamptz;
  _new_until timestamptz;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'NOT_AUTHENTICATED'; END IF;
  IF _tier NOT IN ('top','premium') THEN RAISE EXCEPTION 'INVALID_TIER'; END IF;

  IF _tier = 'premium' THEN
    IF _days <> 30 THEN RAISE EXCEPTION 'INVALID_DURATION'; END IF;
    _cost := 100;
  ELSE
    _cost := CASE _days WHEN 7 THEN 15 WHEN 14 THEN 25 WHEN 30 THEN 45 ELSE NULL END;
  END IF;
  IF _cost IS NULL THEN RAISE EXCEPTION 'INVALID_DURATION'; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.properties p WHERE p.id = _property_id AND p.user_id = _uid) THEN
    RAISE EXCEPTION 'NOT_OWNER';
  END IF;

  SELECT c.credits_remaining INTO _before FROM public.ai_credits c WHERE c.user_id = _uid FOR UPDATE;
  IF _before IS NULL OR _before < _cost THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;

  UPDATE public.ai_credits c
     SET credits_remaining = c.credits_remaining - _cost, updated_at = now()
   WHERE c.user_id = _uid
   RETURNING c.credits_remaining INTO _after;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
  VALUES (_uid, -_cost, _before, _after,
          CASE WHEN _tier = 'premium' THEN 'property_premium_listing' ELSE 'property_top_listing' END,
          'property_marketplace', _uid,
          jsonb_build_object('property_id', _property_id, 'days', _days, 'tier', _tier));

  IF _tier = 'premium' THEN
    SELECT GREATEST(now(), COALESCE(p.premium_until, now())) INTO _base
      FROM public.properties p WHERE p.id = _property_id;
    _new_until := _base + (_days || ' days')::interval;
    UPDATE public.properties p
       SET is_premium = true, premium_until = _new_until, updated_at = now()
     WHERE p.id = _property_id;
  ELSE
    SELECT GREATEST(now(), COALESCE(p.featured_until, now())) INTO _base
      FROM public.properties p WHERE p.id = _property_id;
    _new_until := _base + (_days || ' days')::interval;
    UPDATE public.properties p
       SET is_featured = true, featured_until = _new_until, updated_at = now()
     WHERE p.id = _property_id;
  END IF;

  RETURN QUERY SELECT _new_until, _after, _tier;
END
$$;

REVOKE ALL ON FUNCTION public.property_top_listing(uuid, integer, text) FROM public;
GRANT EXECUTE ON FUNCTION public.property_top_listing(uuid, integer, text) TO authenticated;