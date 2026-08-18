ALTER TABLE public.coupon_listings
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS featured_at timestamptz,
  ADD COLUMN IF NOT EXISTS featured_until timestamptz,
  ADD COLUMN IF NOT EXISTS premium_at timestamptz,
  ADD COLUMN IF NOT EXISTS premium_until timestamptz;

ALTER TABLE public.coupon_messages
  ADD COLUMN IF NOT EXISTS attachment_path text,
  ADD COLUMN IF NOT EXISTS attachment_type text;

CREATE TABLE IF NOT EXISTS public.coupon_contact_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupon_listings(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (coupon_id, buyer_id)
);

GRANT SELECT ON public.coupon_contact_unlocks TO authenticated;
GRANT ALL ON public.coupon_contact_unlocks TO service_role;

ALTER TABLE public.coupon_contact_unlocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view coupon contact unlocks" ON public.coupon_contact_unlocks;
CREATE POLICY "Participants can view coupon contact unlocks"
  ON public.coupon_contact_unlocks FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE INDEX IF NOT EXISTS idx_coupon_unlocks_buyer ON public.coupon_contact_unlocks(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coupon_listings_promo ON public.coupon_listings(premium_until DESC NULLS LAST, featured_until DESC NULLS LAST, created_at DESC);

CREATE OR REPLACE FUNCTION public.has_coupon_contact_unlock(_user_id uuid, _coupon_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.coupon_contact_unlocks u
     WHERE u.coupon_id = _coupon_id AND u.buyer_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.unlock_coupon_contact(_coupon_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_owner uuid;
  v_before int;
  v_after int;
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

  SELECT c.credits_remaining INTO v_before FROM public.ai_credits c WHERE c.user_id = v_uid FOR UPDATE;
  IF v_before IS NULL OR v_before < 2 THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;
  UPDATE public.ai_credits c SET credits_remaining = c.credits_remaining - 2, updated_at = now()
   WHERE c.user_id = v_uid RETURNING c.credits_remaining INTO v_after;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
  VALUES (v_uid, -2, v_before, v_after, 'coupon_contact_unlock', 'coupon_marketplace', v_uid,
          jsonb_build_object('coupon_id', _coupon_id, 'seller_id', v_owner));

  INSERT INTO public.coupon_contact_unlocks (coupon_id, buyer_id, seller_id)
  VALUES (_coupon_id, v_uid, v_owner) ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object('unlocked', true, 'charged', 2, 'balance', v_after);
END;
$$;

CREATE OR REPLACE FUNCTION public.publish_coupon_listing(
  _title text,
  _description text,
  _store_name text,
  _original_value numeric,
  _selling_price numeric,
  _category text DEFAULT 'general',
  _coupon_type text DEFAULT 'discount_code',
  _expiry_date date DEFAULT NULL,
  _location text DEFAULT NULL,
  _terms_conditions text DEFAULT NULL,
  _image_url text DEFAULT NULL,
  _discount_code text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_id uuid;
  v_before int;
  v_after int;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF coalesce(trim(_title),'') = '' THEN RAISE EXCEPTION 'TITLE_REQUIRED'; END IF;
  IF coalesce(trim(_store_name),'') = '' THEN RAISE EXCEPTION 'STORE_REQUIRED'; END IF;

  SELECT c.credits_remaining INTO v_before FROM public.ai_credits c WHERE c.user_id = v_uid FOR UPDATE;
  IF v_before IS NULL OR v_before < 2 THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;
  UPDATE public.ai_credits c SET credits_remaining = c.credits_remaining - 2, updated_at = now()
   WHERE c.user_id = v_uid RETURNING c.credits_remaining INTO v_after;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
  VALUES (v_uid, -2, v_before, v_after, 'coupon_listing_publish', 'coupon_marketplace', v_uid, '{}'::jsonb);

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
$$;

CREATE OR REPLACE FUNCTION public.coupon_top_listing(_coupon_id uuid, _days integer, _tier text DEFAULT 'top')
RETURNS TABLE(promoted_until timestamptz, credits_remaining integer, tier text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
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

  IF NOT EXISTS (SELECT 1 FROM public.coupon_listings c WHERE c.id = _coupon_id AND c.user_id = v_uid) THEN
    RAISE EXCEPTION 'NOT_OWNER';
  END IF;

  SELECT c.credits_remaining INTO v_before FROM public.ai_credits c WHERE c.user_id = v_uid FOR UPDATE;
  IF v_before IS NULL OR v_before < v_cost THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;
  UPDATE public.ai_credits c SET credits_remaining = c.credits_remaining - v_cost, updated_at = now()
   WHERE c.user_id = v_uid RETURNING c.credits_remaining INTO v_after;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
  VALUES (v_uid, -v_cost, v_before, v_after,
          CASE WHEN _tier='premium' THEN 'coupon_premium_listing' ELSE 'coupon_top_listing' END,
          'coupon_marketplace', v_uid, jsonb_build_object('coupon_id', _coupon_id, 'days', _days, 'tier', _tier));

  IF _tier = 'premium' THEN
    SELECT GREATEST(now(), COALESCE(c.premium_until, now())) INTO v_base FROM public.coupon_listings c WHERE c.id = _coupon_id;
    v_until := v_base + (_days || ' days')::interval;
    UPDATE public.coupon_listings c
       SET premium_until = v_until, premium_at = COALESCE(c.premium_at, now()), updated_at = now()
     WHERE c.id = _coupon_id;
  ELSE
    SELECT GREATEST(now(), COALESCE(c.featured_until, now())) INTO v_base FROM public.coupon_listings c WHERE c.id = _coupon_id;
    v_until := v_base + (_days || ' days')::interval;
    UPDATE public.coupon_listings c
       SET featured_until = v_until, featured_at = COALESCE(c.featured_at, now()), updated_at = now()
     WHERE c.id = _coupon_id;
  END IF;

  RETURN QUERY SELECT v_until, v_after, _tier;
END;
$$;

DROP FUNCTION IF EXISTS public.get_public_coupon_listings();
CREATE OR REPLACE FUNCTION public.get_public_coupon_listings()
RETURNS TABLE(
  id uuid, user_id uuid, title text, description text, store_name text,
  original_value numeric, selling_price numeric, expiry_date date, category text,
  coupon_type text, is_digital boolean, image_url text, terms_conditions text,
  is_active boolean, is_sold boolean, created_at timestamptz, updated_at timestamptz,
  location text, featured_at timestamptz, featured_until timestamptz,
  premium_at timestamptz, premium_until timestamptz, tags text[], balance_confirmed boolean
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT
    id, user_id, title, description, store_name, original_value, selling_price,
    expiry_date, category, coupon_type, is_digital, image_url, terms_conditions,
    is_active, is_sold, created_at, updated_at,
    location, featured_at, featured_until, premium_at, premium_until, tags, balance_confirmed
  FROM public.coupon_listings
  WHERE is_active = true;
$$;

CREATE OR REPLACE FUNCTION public.scrub_coupon_listing()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  NEW.title := public.scrub_contact_info(NEW.title);
  NEW.description := public.scrub_contact_info(NEW.description);
  NEW.terms_conditions := public.scrub_contact_info(NEW.terms_conditions);
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_scrub_coupon_listing ON public.coupon_listings;
CREATE TRIGGER trg_scrub_coupon_listing
  BEFORE INSERT OR UPDATE OF title, description, terms_conditions ON public.coupon_listings
  FOR EACH ROW EXECUTE FUNCTION public.scrub_coupon_listing();

CREATE OR REPLACE FUNCTION public.scrub_coupon_message()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.coupon_contact_unlocks u
     WHERE u.coupon_id = NEW.coupon_id
       AND (u.buyer_id = NEW.sender_id OR u.buyer_id = NEW.receiver_id)
  ) THEN
    NEW.message := public.scrub_contact_info(NEW.message);
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_scrub_coupon_message ON public.coupon_messages;
CREATE TRIGGER trg_scrub_coupon_message
  BEFORE INSERT ON public.coupon_messages
  FOR EACH ROW EXECUTE FUNCTION public.scrub_coupon_message();

CREATE OR REPLACE FUNCTION public.notify_coupon_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  PERFORM public.push_notification(NEW.receiver_id, NEW.sender_id, 'coupon_message', 'New coupon message',
    public.actor_name(NEW.sender_id) || ' sent you a message about a coupon listing', '/coupon-marketplace/messages', NEW.coupon_id);
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_coupon_message ON public.coupon_messages;
CREATE TRIGGER trg_notify_coupon_message
  AFTER INSERT ON public.coupon_messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_coupon_message();

DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.coupon_messages;
CREATE POLICY "Unlocked participants can send coupon messages"
  ON public.coupon_messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND (
      EXISTS (SELECT 1 FROM public.coupon_listings c WHERE c.id = coupon_id AND c.user_id = auth.uid())
      OR public.has_coupon_contact_unlock(auth.uid(), coupon_id)
    )
  );

DROP POLICY IF EXISTS "Participants can mark coupon messages read" ON public.coupon_messages;
CREATE POLICY "Participants can mark coupon messages read"
  ON public.coupon_messages FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id) WITH CHECK (auth.uid() = receiver_id);