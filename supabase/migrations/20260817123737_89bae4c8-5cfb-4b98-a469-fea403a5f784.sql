ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS featured_until timestamptz;

CREATE OR REPLACE FUNCTION public.property_top_listing(_property_id uuid, _days integer)
RETURNS TABLE(featured_until timestamptz, credits_remaining integer)
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
  _cost := CASE _days WHEN 7 THEN 15 WHEN 14 THEN 25 WHEN 30 THEN 45 ELSE NULL END;
  IF _cost IS NULL THEN RAISE EXCEPTION 'INVALID_DURATION'; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.properties p WHERE p.id = _property_id AND p.user_id = _uid) THEN
    RAISE EXCEPTION 'NOT_OWNER';
  END IF;

  SELECT c.credits_remaining INTO _before FROM public.ai_credits c WHERE c.user_id = _uid FOR UPDATE;
  IF _before IS NULL OR _before < _cost THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;

  UPDATE public.ai_credits SET credits_remaining = credits_remaining - _cost, updated_at = now()
   WHERE user_id = _uid RETURNING credits_remaining INTO _after;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
  VALUES (_uid, -_cost, _before, _after, 'property_top_listing', 'property_marketplace', _uid,
          jsonb_build_object('property_id', _property_id, 'days', _days));

  SELECT GREATEST(now(), COALESCE(p.featured_until, now())) INTO _base
    FROM public.properties p WHERE p.id = _property_id;
  _new_until := _base + (_days || ' days')::interval;

  UPDATE public.properties p
     SET is_featured = true, featured_until = _new_until, updated_at = now()
   WHERE p.id = _property_id;

  RETURN QUERY SELECT _new_until, _after;
END$$;

GRANT EXECUTE ON FUNCTION public.property_top_listing(uuid, integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.expire_property_features()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _n int;
BEGIN
  UPDATE public.properties
     SET is_featured = false, featured_until = NULL
   WHERE is_featured = true AND featured_until IS NOT NULL AND featured_until <= now();
  GET DIAGNOSTICS _n = ROW_COUNT;
  RETURN _n;
END$$;

SELECT cron.schedule('expire-property-features', '15 * * * *', $$SELECT public.expire_property_features();$$)
WHERE NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-property-features');