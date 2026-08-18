-- 1. Columns for the Bazaar-style listing model
ALTER TABLE public.auction_items
  ADD COLUMN IF NOT EXISTS location text DEFAULT '',
  ADD COLUMN IF NOT EXISTS image_urls text[],
  ADD COLUMN IF NOT EXISTS featured_at timestamptz,
  ADD COLUMN IF NOT EXISTS featured_until timestamptz,
  ADD COLUMN IF NOT EXISTS premium_at timestamptz,
  ADD COLUMN IF NOT EXISTS premium_until timestamptz;

-- 2. Messages
CREATE TABLE IF NOT EXISTS public.auction_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id uuid NOT NULL REFERENCES public.auction_items(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  message text NOT NULL,
  attachment_path text,
  attachment_type text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.auction_messages TO authenticated;
GRANT ALL ON public.auction_messages TO service_role;
ALTER TABLE public.auction_messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS auction_messages_auction_idx ON public.auction_messages(auction_id, created_at);
CREATE INDEX IF NOT EXISTS auction_messages_receiver_idx ON public.auction_messages(receiver_id, is_read);

-- 3. Contact unlocks
CREATE TABLE IF NOT EXISTS public.auction_contact_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id uuid NOT NULL REFERENCES public.auction_items(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (auction_id, buyer_id)
);
GRANT SELECT ON public.auction_contact_unlocks TO authenticated;
GRANT ALL ON public.auction_contact_unlocks TO service_role;
ALTER TABLE public.auction_contact_unlocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auction_unlocks_own" ON public.auction_contact_unlocks;
CREATE POLICY "auction_unlocks_own" ON public.auction_contact_unlocks
  FOR SELECT TO authenticated
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- 4. Unlock helper
CREATE OR REPLACE FUNCTION public.has_auction_contact_unlock(_user_id uuid, _auction_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.auction_contact_unlocks u
    WHERE u.auction_id = _auction_id AND u.buyer_id = _user_id
  );
$$;

-- 5. Message policies
DROP POLICY IF EXISTS "auction_messages_select" ON public.auction_messages;
CREATE POLICY "auction_messages_select" ON public.auction_messages
  FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

DROP POLICY IF EXISTS "auction_messages_insert" ON public.auction_messages;
CREATE POLICY "auction_messages_insert" ON public.auction_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND receiver_id <> auth.uid()
    AND (
      EXISTS (SELECT 1 FROM public.auction_items i WHERE i.id = auction_id AND i.user_id = auth.uid())
      OR public.has_auction_contact_unlock(auth.uid(), auction_id)
    )
  );

DROP POLICY IF EXISTS "auction_messages_mark_read" ON public.auction_messages;
CREATE POLICY "auction_messages_mark_read" ON public.auction_messages
  FOR UPDATE TO authenticated
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- 6. Publish an auction for 2 credits
CREATE OR REPLACE FUNCTION public.publish_auction_item(
  _title text,
  _description text,
  _category text,
  _starting_price numeric,
  _buyout_price numeric DEFAULT NULL,
  _condition text DEFAULT 'Good',
  _location text DEFAULT NULL,
  _duration_hours int DEFAULT 24,
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
  IF _starting_price IS NULL OR _starting_price < 0 THEN RAISE EXCEPTION 'INVALID_PRICE'; END IF;
  IF _duration_hours NOT IN (6, 12, 24, 48, 72, 168) THEN RAISE EXCEPTION 'INVALID_DURATION'; END IF;

  SELECT c.credits_remaining INTO v_before FROM public.ai_credits c WHERE c.user_id = v_uid FOR UPDATE;
  IF v_before IS NULL OR v_before < 2 THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;
  UPDATE public.ai_credits c SET credits_remaining = c.credits_remaining - 2, updated_at = now()
   WHERE c.user_id = v_uid RETURNING c.credits_remaining INTO v_after;

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

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
  VALUES (v_uid, -2, v_before, v_after, 'auction_publish', 'auction', v_uid, jsonb_build_object('auction_id', v_id));

  RETURN v_id;
END;
$$;

-- 7. Unlock auction chat for 2 credits
CREATE OR REPLACE FUNCTION public.unlock_auction_contact(_auction_id uuid)
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

  SELECT i.user_id INTO v_owner FROM public.auction_items i WHERE i.id = _auction_id;
  IF v_owner IS NULL THEN RAISE EXCEPTION 'ITEM_NOT_FOUND'; END IF;

  IF v_owner = v_uid OR public.has_auction_contact_unlock(v_uid, _auction_id) THEN
    RETURN jsonb_build_object('unlocked', true, 'charged', 0);
  END IF;

  SELECT count(*) INTO v_today FROM public.auction_contact_unlocks
   WHERE buyer_id = v_uid AND created_at > now() - interval '1 day';
  IF v_today >= 20 THEN RAISE EXCEPTION 'RATE_LIMIT: daily unlock limit reached (20 per day)'; END IF;

  SELECT c.credits_remaining INTO v_before FROM public.ai_credits c WHERE c.user_id = v_uid FOR UPDATE;
  IF v_before IS NULL OR v_before < 2 THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;
  UPDATE public.ai_credits c SET credits_remaining = c.credits_remaining - 2, updated_at = now()
   WHERE c.user_id = v_uid RETURNING c.credits_remaining INTO v_after;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
  VALUES (v_uid, -2, v_before, v_after, 'auction_contact_unlock', 'auction', v_uid,
          jsonb_build_object('auction_id', _auction_id, 'seller_id', v_owner));

  INSERT INTO public.auction_contact_unlocks (auction_id, buyer_id, seller_id)
  VALUES (_auction_id, v_uid, v_owner) ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object('unlocked', true, 'charged', 2, 'balance', v_after);
END;
$$;

-- 8. TOP / PREMIUM promotion
CREATE OR REPLACE FUNCTION public.auction_top_listing(_item_id uuid, _days int, _tier text DEFAULT 'top')
RETURNS TABLE(promoted_until timestamptz, credits_remaining int, tier text)
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

  IF NOT EXISTS (SELECT 1 FROM public.auction_items i WHERE i.id = _item_id AND i.user_id = v_uid) THEN
    RAISE EXCEPTION 'NOT_OWNER';
  END IF;

  SELECT c.credits_remaining INTO v_before FROM public.ai_credits c WHERE c.user_id = v_uid FOR UPDATE;
  IF v_before IS NULL OR v_before < v_cost THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;
  UPDATE public.ai_credits c SET credits_remaining = c.credits_remaining - v_cost, updated_at = now()
   WHERE c.user_id = v_uid RETURNING c.credits_remaining INTO v_after;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
  VALUES (v_uid, -v_cost, v_before, v_after,
          CASE WHEN _tier='premium' THEN 'auction_premium_listing' ELSE 'auction_top_listing' END,
          'auction', v_uid, jsonb_build_object('auction_id', _item_id, 'days', _days, 'tier', _tier));

  IF _tier = 'premium' THEN
    SELECT GREATEST(now(), COALESCE(i.premium_until, now())) INTO v_base FROM public.auction_items i WHERE i.id = _item_id;
    v_until := v_base + (_days || ' days')::interval;
    UPDATE public.auction_items i
       SET premium_until = v_until, premium_at = COALESCE(i.premium_at, now()), updated_at = now()
     WHERE i.id = _item_id;
  ELSE
    SELECT GREATEST(now(), COALESCE(i.featured_until, now())) INTO v_base FROM public.auction_items i WHERE i.id = _item_id;
    v_until := v_base + (_days || ' days')::interval;
    UPDATE public.auction_items i
       SET featured_until = v_until, featured_at = COALESCE(i.featured_at, now()), updated_at = now()
     WHERE i.id = _item_id;
  END IF;

  RETURN QUERY SELECT v_until, v_after, _tier;
END;
$$;

-- 9. Scrub contact info out of listings
CREATE OR REPLACE FUNCTION public.scrub_auction_item()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.title := public.scrub_contact_info(NEW.title);
  NEW.description := public.scrub_contact_info(NEW.description);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_scrub_auction_item ON public.auction_items;
CREATE TRIGGER trg_scrub_auction_item
  BEFORE INSERT OR UPDATE OF title, description ON public.auction_items
  FOR EACH ROW EXECUTE FUNCTION public.scrub_auction_item();

-- 10. Bell notification for auction messages
CREATE OR REPLACE FUNCTION public.notify_auction_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.push_notification(NEW.receiver_id, NEW.sender_id, 'auction_message', 'New auction message',
    public.actor_name(NEW.sender_id) || ' sent you a message about an auction', '/auction/messages', NEW.auction_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_auction_message ON public.auction_messages;
CREATE TRIGGER trg_notify_auction_message
  AFTER INSERT ON public.auction_messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_auction_message();

-- 11. Outbid notification
CREATE OR REPLACE FUNCTION public.notify_auction_outbid()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prev uuid;
  v_title text;
BEGIN
  SELECT b.user_id INTO v_prev
    FROM public.auction_bids b
   WHERE b.auction_id = NEW.auction_id AND b.id <> NEW.id AND b.user_id <> NEW.user_id
   ORDER BY b.bid_amount DESC
   LIMIT 1;

  IF v_prev IS NULL THEN RETURN NEW; END IF;

  SELECT i.title INTO v_title FROM public.auction_items i WHERE i.id = NEW.auction_id;

  PERFORM public.push_notification(v_prev, NEW.user_id, 'auction_outbid', 'You have been outbid',
    'Someone bid EUR ' || NEW.bid_amount::text || ' on "' || coalesce(v_title,'an auction') || '"',
    '/auction', NEW.auction_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_auction_outbid ON public.auction_bids;
CREATE TRIGGER trg_notify_auction_outbid
  AFTER INSERT ON public.auction_bids
  FOR EACH ROW EXECUTE FUNCTION public.notify_auction_outbid();