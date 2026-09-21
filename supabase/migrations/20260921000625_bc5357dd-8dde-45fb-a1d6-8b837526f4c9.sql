CREATE OR REPLACE FUNCTION public.marketplace_launch_promo(_kind text, _entity_id uuid)
RETURNS TABLE(promoted_until timestamptz, credits_remaining integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_cost int := 10;
  v_before int;
  v_after int;
  v_until timestamptz := now() + interval '30 days';
  v_ok boolean := false;
  v_used boolean := false;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF _kind NOT IN ('bazaar','auction','coupon','course') THEN RAISE EXCEPTION 'INVALID_KIND'; END IF;

  IF _kind = 'bazaar' THEN
    SELECT true, (i.featured_at IS NOT NULL OR i.featured_until IS NOT NULL)
      INTO v_ok, v_used FROM public.bazaar_items i WHERE i.id = _entity_id AND i.user_id = v_uid;
  ELSIF _kind = 'auction' THEN
    SELECT true, (i.featured_at IS NOT NULL OR i.featured_until IS NOT NULL)
      INTO v_ok, v_used FROM public.auction_items i WHERE i.id = _entity_id AND i.user_id = v_uid;
  ELSIF _kind = 'coupon' THEN
    SELECT true, (c.featured_at IS NOT NULL OR c.featured_until IS NOT NULL)
      INTO v_ok, v_used FROM public.coupon_listings c WHERE c.id = _entity_id AND c.user_id = v_uid;
  ELSE
    SELECT true, (c.featured_at IS NOT NULL OR c.featured_until IS NOT NULL)
      INTO v_ok, v_used FROM public.courses c WHERE c.id = _entity_id AND c.creator_id = v_uid;
  END IF;

  IF NOT COALESCE(v_ok, false) THEN RAISE EXCEPTION 'NOT_OWNER'; END IF;
  IF COALESCE(v_used, false) THEN RAISE EXCEPTION 'PROMO_ALREADY_USED'; END IF;

  SELECT c.credits_remaining INTO v_before FROM public.ai_credits c WHERE c.user_id = v_uid FOR UPDATE;
  IF v_before IS NULL OR v_before < v_cost THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;

  UPDATE public.ai_credits c SET credits_remaining = c.credits_remaining - v_cost, updated_at = now()
   WHERE c.user_id = v_uid RETURNING c.credits_remaining INTO v_after;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
  VALUES (v_uid, -v_cost, v_before, v_after, _kind || '_launch_promo', _kind, v_uid,
          jsonb_build_object('entity_id', _entity_id, 'days', 30, 'tier', 'top'));

  IF _kind = 'bazaar' THEN
    UPDATE public.bazaar_items SET featured_until = v_until, featured_at = now(), updated_at = now() WHERE id = _entity_id;
  ELSIF _kind = 'auction' THEN
    UPDATE public.auction_items SET featured_until = v_until, featured_at = now(), updated_at = now() WHERE id = _entity_id;
  ELSIF _kind = 'coupon' THEN
    UPDATE public.coupon_listings SET featured_until = v_until, featured_at = now(), updated_at = now() WHERE id = _entity_id;
  ELSE
    UPDATE public.courses SET featured_until = v_until, featured_at = now(), updated_at = now() WHERE id = _entity_id;
  END IF;

  RETURN QUERY SELECT v_until, v_after;
END;
$function$;

REVOKE ALL ON FUNCTION public.marketplace_launch_promo(text, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.marketplace_launch_promo(text, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.marketplace_launch_promo(text, uuid) TO authenticated;