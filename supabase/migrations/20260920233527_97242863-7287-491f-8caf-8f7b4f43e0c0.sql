CREATE OR REPLACE FUNCTION public.publish_skill_offering(_title text, _description text, _category skill_category, _price_per_hour numeric, _location text DEFAULT NULL::text, _image_url text DEFAULT NULL::text, _is_active boolean DEFAULT true)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_offering_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  INSERT INTO public.skill_offerings (
    user_id, title, description, category, price_per_hour, location, image_url, is_active
  ) VALUES (
    v_user_id, _title, _description, _category, _price_per_hour,
    NULLIF(_location, ''), _image_url, COALESCE(_is_active, true)
  )
  RETURNING id INTO v_offering_id;

  RETURN v_offering_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.skill_launch_promo(_offering_id uuid)
 RETURNS TABLE(promoted_until timestamp with time zone, credits_remaining integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_cost int := 10;
  v_before int;
  v_after int;
  v_until timestamptz;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.skill_offerings o
     WHERE o.id = _offering_id AND o.user_id = v_uid
  ) THEN
    RAISE EXCEPTION 'NOT_OWNER';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.skill_offerings o
     WHERE o.id = _offering_id AND (o.featured_at IS NOT NULL OR o.featured_until IS NOT NULL)
  ) THEN
    RAISE EXCEPTION 'PROMO_ALREADY_USED';
  END IF;

  SELECT c.credits_remaining INTO v_before FROM public.ai_credits c WHERE c.user_id = v_uid FOR UPDATE;
  IF v_before IS NULL OR v_before < v_cost THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;

  UPDATE public.ai_credits c SET credits_remaining = c.credits_remaining - v_cost, updated_at = now()
   WHERE c.user_id = v_uid RETURNING c.credits_remaining INTO v_after;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
  VALUES (v_uid, -v_cost, v_before, v_after, 'skills_launch_promo', 'skills_marketplace', v_uid,
          jsonb_build_object('offering_id', _offering_id, 'days', 30, 'tier', 'top'));

  v_until := now() + interval '30 days';

  UPDATE public.skill_offerings o
     SET featured_until = v_until,
         featured_at = now(),
         is_active = true,
         updated_at = now()
   WHERE o.id = _offering_id;

  RETURN QUERY SELECT v_until, v_after;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.skill_launch_promo(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.skill_launch_promo(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_skill_offering(text, text, skill_category, numeric, text, text, boolean) TO authenticated;