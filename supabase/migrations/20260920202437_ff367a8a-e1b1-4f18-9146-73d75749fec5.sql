CREATE OR REPLACE FUNCTION public.publish_auction_item(_title text, _description text, _category text, _starting_price numeric, _buyout_price numeric DEFAULT NULL::numeric, _condition text DEFAULT 'Good'::text, _location text DEFAULT NULL::text, _duration_hours integer DEFAULT 24, _image_urls text[] DEFAULT NULL::text[])
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF coalesce(trim(_title),'') = '' THEN RAISE EXCEPTION 'TITLE_REQUIRED'; END IF;
  IF _starting_price IS NULL OR _starting_price < 0 THEN RAISE EXCEPTION 'INVALID_PRICE'; END IF;
  IF _duration_hours NOT IN (6, 12, 24, 48, 72, 168) THEN RAISE EXCEPTION 'INVALID_DURATION'; END IF;

  INSERT INTO public.auction_items (
    user_id, title, description, category, condition, location,
    starting_price, current_price, buyout_price, ends_at, is_active,
    image_url, image_urls
  ) VALUES (
    v_uid, _title, coalesce(_description,''), coalesce(_category,'other'), coalesce(_condition,'Good'),
    coalesce(NULLIF(_location,''),''),
    _starting_price, _starting_price, _buyout_price,
    now() + (_duration_hours || ' hours')::interval, true,
    CASE WHEN _image_urls IS NOT NULL AND array_length(_image_urls,1) > 0 THEN _image_urls[1] ELSE NULL END,
    _image_urls
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.publish_bazaar_item(_title text, _description text, _category text, _price numeric, _location text DEFAULT NULL::text, _condition text DEFAULT 'Good'::text, _listing_type text DEFAULT 'sell'::text, _image_urls text[] DEFAULT NULL::text[])
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF coalesce(trim(_title),'') = '' THEN RAISE EXCEPTION 'TITLE_REQUIRED'; END IF;

  INSERT INTO public.bazaar_items (
    user_id, title, description, category, price, location, condition, listing_type,
    image_url, image_urls, is_active
  ) VALUES (
    v_uid, _title, coalesce(_description,''), _category, _price, coalesce(NULLIF(_location,''),''),
    _condition, _listing_type,
    CASE WHEN _image_urls IS NOT NULL AND array_length(_image_urls,1) > 0 THEN _image_urls[1] ELSE NULL END,
    _image_urls, true
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.publish_coupon_listing(_title text, _description text, _store_name text, _original_value numeric, _selling_price numeric, _category text DEFAULT 'general'::text, _coupon_type text DEFAULT 'discount_code'::text, _expiry_date date DEFAULT NULL::date, _location text DEFAULT NULL::text, _terms_conditions text DEFAULT NULL::text, _image_url text DEFAULT NULL::text, _discount_code text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF coalesce(trim(_title),'') = '' THEN RAISE EXCEPTION 'TITLE_REQUIRED'; END IF;
  IF coalesce(trim(_store_name),'') = '' THEN RAISE EXCEPTION 'STORE_REQUIRED'; END IF;

  INSERT INTO public.coupon_listings (
    user_id, title, description, store_name, original_value, selling_price,
    category, coupon_type, expiry_date, location, terms_conditions, image_url,
    discount_code, is_active, is_sold, balance_confirmed, balance_confirmed_value
  ) VALUES (
    v_uid, _title, _description, _store_name, _original_value, _selling_price,
    coalesce(_category,'general'), coalesce(_coupon_type,'discount_code'), _expiry_date,
    _location, _terms_conditions, _image_url, _discount_code, true, false, true, _original_value
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.unlock_auction_contact(_auction_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_owner uuid;
  v_today int;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;

  SELECT i.user_id INTO v_owner FROM public.auction_items i WHERE i.id = _auction_id;
  IF v_owner IS NULL THEN RAISE EXCEPTION 'ITEM_NOT_FOUND'; END IF;

  IF v_owner = v_uid OR public.has_auction_contact_unlock(v_uid, _auction_id) THEN
    RETURN jsonb_build_object('unlocked', true, 'charged', 0);
  END IF;

  SELECT count(*) INTO v_today FROM public.auction_contact_unlocks
   WHERE buyer_id = v_uid AND created_at > now() - interval '1 day';
  IF v_today >= 20 THEN RAISE EXCEPTION 'RATE_LIMIT: daily unlock limit reached (20 per day)'; END IF;

  INSERT INTO public.auction_contact_unlocks (auction_id, buyer_id, seller_id)
  VALUES (_auction_id, v_uid, v_owner) ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object('unlocked', true, 'charged', 0);
END;
$function$;

CREATE OR REPLACE FUNCTION public.unlock_bazaar_contact(_item_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_owner uuid;
  v_today int;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;

  SELECT i.user_id INTO v_owner FROM public.bazaar_items i WHERE i.id = _item_id;
  IF v_owner IS NULL THEN RAISE EXCEPTION 'ITEM_NOT_FOUND'; END IF;

  IF v_owner = v_uid OR public.has_bazaar_contact_unlock(v_uid, _item_id) THEN
    RETURN jsonb_build_object('unlocked', true, 'charged', 0);
  END IF;

  SELECT count(*) INTO v_today FROM public.bazaar_contact_unlocks
   WHERE buyer_id = v_uid AND created_at > now() - interval '1 day';
  IF v_today >= 20 THEN RAISE EXCEPTION 'RATE_LIMIT: daily unlock limit reached (20 per day)'; END IF;

  INSERT INTO public.bazaar_contact_unlocks (item_id, buyer_id, seller_id)
  VALUES (_item_id, v_uid, v_owner) ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object('unlocked', true, 'charged', 0);
END;
$function$;

CREATE OR REPLACE FUNCTION public.unlock_coupon_contact(_coupon_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_owner uuid;
  v_today int;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;

  SELECT c.user_id INTO v_owner FROM public.coupon_listings c WHERE c.id = _coupon_id;
  IF v_owner IS NULL THEN RAISE EXCEPTION 'ITEM_NOT_FOUND'; END IF;

  IF v_owner = v_uid OR public.has_coupon_contact_unlock(v_uid, _coupon_id) THEN
    RETURN jsonb_build_object('unlocked', true, 'charged', 0);
  END IF;

  SELECT count(*) INTO v_today FROM public.coupon_contact_unlocks
   WHERE buyer_id = v_uid AND created_at > now() - interval '1 day';
  IF v_today >= 20 THEN RAISE EXCEPTION 'RATE_LIMIT: daily unlock limit reached (20 per day)'; END IF;

  INSERT INTO public.coupon_contact_unlocks (coupon_id, buyer_id, seller_id)
  VALUES (_coupon_id, v_uid, v_owner) ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object('unlocked', true, 'charged', 0);
END;
$function$;

CREATE OR REPLACE FUNCTION public.unlock_skill_contact(_offering_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_owner uuid;
  v_today integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  SELECT o.user_id INTO v_owner FROM public.skill_offerings o WHERE o.id = _offering_id;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'OFFERING_NOT_FOUND';
  END IF;

  IF v_owner = v_user_id OR public.has_skill_contact_unlock(v_user_id, _offering_id) THEN
    RETURN jsonb_build_object('unlocked', true, 'charged', 0);
  END IF;

  SELECT count(*) INTO v_today
  FROM public.skill_contact_unlocks
  WHERE buyer_id = v_user_id AND created_at > now() - interval '1 day';
  IF v_today >= 20 THEN
    RAISE EXCEPTION 'RATE_LIMIT: daily contact unlock limit reached (20 per day)';
  END IF;

  INSERT INTO public.skill_contact_unlocks (offering_id, buyer_id, seller_id)
  VALUES (_offering_id, v_user_id, v_owner)
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object('unlocked', true, 'charged', 0);
END;
$function$;