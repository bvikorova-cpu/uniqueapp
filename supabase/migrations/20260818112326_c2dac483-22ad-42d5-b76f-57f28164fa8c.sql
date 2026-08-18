
ALTER TABLE public.bazaar_items
  ADD COLUMN IF NOT EXISTS featured_at timestamptz,
  ADD COLUMN IF NOT EXISTS featured_until timestamptz,
  ADD COLUMN IF NOT EXISTS premium_at timestamptz,
  ADD COLUMN IF NOT EXISTS premium_until timestamptz;

ALTER TABLE public.bazaar_messages
  ADD COLUMN IF NOT EXISTS attachment_path text,
  ADD COLUMN IF NOT EXISTS attachment_type text;

CREATE TABLE IF NOT EXISTS public.bazaar_contact_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.bazaar_items(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item_id, buyer_id)
);

GRANT SELECT ON public.bazaar_contact_unlocks TO authenticated;
GRANT ALL ON public.bazaar_contact_unlocks TO service_role;
ALTER TABLE public.bazaar_contact_unlocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view their bazaar unlocks" ON public.bazaar_contact_unlocks;
CREATE POLICY "Participants can view their bazaar unlocks"
ON public.bazaar_contact_unlocks FOR SELECT TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE OR REPLACE FUNCTION public.has_bazaar_contact_unlock(_user_id uuid, _item_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bazaar_contact_unlocks u
     WHERE u.item_id = _item_id AND u.buyer_id = _user_id
  );
$$;

-- Contact scrubbing on listings (mirrors skills / property)
DROP TRIGGER IF EXISTS scrub_contacts_bazaar_items ON public.bazaar_items;
CREATE TRIGGER scrub_contacts_bazaar_items
BEFORE INSERT OR UPDATE ON public.bazaar_items
FOR EACH ROW EXECUTE FUNCTION public.scrub_listing_contact_info();

-- Publish a listing for 2 AI credits
CREATE OR REPLACE FUNCTION public.publish_bazaar_item(
  _title text,
  _description text,
  _category text,
  _price numeric,
  _location text DEFAULT NULL,
  _condition text DEFAULT 'Good',
  _listing_type text DEFAULT 'sell',
  _image_urls text[] DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_id uuid;
  v_before int;
  v_after int;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF coalesce(trim(_title),'') = '' THEN RAISE EXCEPTION 'TITLE_REQUIRED'; END IF;

  SELECT c.credits_remaining INTO v_before FROM public.ai_credits c WHERE c.user_id = v_uid FOR UPDATE;
  IF v_before IS NULL OR v_before < 2 THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;
  UPDATE public.ai_credits c SET credits_remaining = c.credits_remaining - 2, updated_at = now()
   WHERE c.user_id = v_uid RETURNING c.credits_remaining INTO v_after;

  INSERT INTO public.bazaar_items (
    user_id, title, description, category, price, location, condition, listing_type,
    image_url, image_urls, is_active
  ) VALUES (
    v_uid, _title, coalesce(_description,''), _category, _price, coalesce(NULLIF(_location,''),''),
    _condition, _listing_type,
    CASE WHEN _image_urls IS NOT NULL AND array_length(_image_urls,1) > 0 THEN _image_urls[1] ELSE NULL END,
    _image_urls, true
  ) RETURNING id INTO v_id;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
  VALUES (v_uid, -2, v_before, v_after, 'bazaar_publish', 'bazaar', v_uid, jsonb_build_object('item_id', v_id));

  RETURN v_id;
END;
$$;

-- Promote a listing (TOP / PREMIUM) exactly like skills & property
CREATE OR REPLACE FUNCTION public.bazaar_top_listing(_item_id uuid, _days integer, _tier text DEFAULT 'top')
RETURNS TABLE(promoted_until timestamptz, credits_remaining integer, tier text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  IF NOT EXISTS (SELECT 1 FROM public.bazaar_items i WHERE i.id = _item_id AND i.user_id = v_uid) THEN
    RAISE EXCEPTION 'NOT_OWNER';
  END IF;

  SELECT c.credits_remaining INTO v_before FROM public.ai_credits c WHERE c.user_id = v_uid FOR UPDATE;
  IF v_before IS NULL OR v_before < v_cost THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;
  UPDATE public.ai_credits c SET credits_remaining = c.credits_remaining - v_cost, updated_at = now()
   WHERE c.user_id = v_uid RETURNING c.credits_remaining INTO v_after;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
  VALUES (v_uid, -v_cost, v_before, v_after,
          CASE WHEN _tier='premium' THEN 'bazaar_premium_listing' ELSE 'bazaar_top_listing' END,
          'bazaar', v_uid, jsonb_build_object('item_id', _item_id, 'days', _days, 'tier', _tier));

  IF _tier = 'premium' THEN
    SELECT GREATEST(now(), COALESCE(i.premium_until, now())) INTO v_base FROM public.bazaar_items i WHERE i.id = _item_id;
    v_until := v_base + (_days || ' days')::interval;
    UPDATE public.bazaar_items i
       SET premium_until = v_until, premium_at = COALESCE(i.premium_at, now()), updated_at = now()
     WHERE i.id = _item_id;
  ELSE
    SELECT GREATEST(now(), COALESCE(i.featured_until, now())) INTO v_base FROM public.bazaar_items i WHERE i.id = _item_id;
    v_until := v_base + (_days || ' days')::interval;
    UPDATE public.bazaar_items i
       SET featured_until = v_until, featured_at = COALESCE(i.featured_at, now()),
           top_until = v_until, updated_at = now()
     WHERE i.id = _item_id;
  END IF;

  RETURN QUERY SELECT v_until, v_after, _tier;
END;
$$;

-- Unlock the seller contact / first message for 2 AI credits
CREATE OR REPLACE FUNCTION public.unlock_bazaar_contact(_item_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_owner uuid;
  v_before int;
  v_after int;
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

  SELECT c.credits_remaining INTO v_before FROM public.ai_credits c WHERE c.user_id = v_uid FOR UPDATE;
  IF v_before IS NULL OR v_before < 2 THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;
  UPDATE public.ai_credits c SET credits_remaining = c.credits_remaining - 2, updated_at = now()
   WHERE c.user_id = v_uid RETURNING c.credits_remaining INTO v_after;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
  VALUES (v_uid, -2, v_before, v_after, 'bazaar_contact_unlock', 'bazaar', v_uid,
          jsonb_build_object('item_id', _item_id, 'seller_id', v_owner));

  INSERT INTO public.bazaar_contact_unlocks (item_id, buyer_id, seller_id)
  VALUES (_item_id, v_uid, v_owner) ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object('unlocked', true, 'charged', 2, 'balance', v_after);
END;
$$;

-- Chat is gated: buyers must have unlocked the contact
DROP POLICY IF EXISTS "Users can send messages" ON public.bazaar_messages;
CREATE POLICY "Unlocked participants can send bazaar messages"
ON public.bazaar_messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND (
    EXISTS (SELECT 1 FROM public.bazaar_items i WHERE i.id = item_id AND i.user_id = auth.uid())
    OR public.has_bazaar_contact_unlock(auth.uid(), item_id)
  )
);
