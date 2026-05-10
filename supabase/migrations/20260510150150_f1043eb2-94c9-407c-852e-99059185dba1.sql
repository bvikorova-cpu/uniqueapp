
-- 1) Expand SELECT on auction_items so winner & seller can also see ended auctions
DROP POLICY IF EXISTS "Anyone can view active auctions" ON public.auction_items;
CREATE POLICY "Auctions visible to participants and active to all"
ON public.auction_items
FOR SELECT
USING (
  is_active = true
  OR auth.uid() = user_id
  OR auth.uid() = winner_id
);

-- 2) SECURITY DEFINER RPC: place_auction_bid
-- Validates, inserts bid, atomically updates current_price, notifies seller.
CREATE OR REPLACE FUNCTION public.place_auction_bid(
  p_auction_id uuid,
  p_amount numeric
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_auction record;
  v_bidder_name text;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'auth required';
  END IF;

  SELECT * INTO v_auction FROM public.auction_items
    WHERE id = p_auction_id FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'auction not found'; END IF;
  IF v_auction.is_active = false THEN RAISE EXCEPTION 'auction inactive'; END IF;
  IF v_auction.ends_at <= now() THEN RAISE EXCEPTION 'auction ended'; END IF;
  IF v_user = v_auction.user_id THEN RAISE EXCEPTION 'cannot bid on own auction'; END IF;
  IF p_amount <= v_auction.current_price THEN
    RAISE EXCEPTION 'bid must exceed current price';
  END IF;

  INSERT INTO public.auction_bids (auction_id, user_id, bid_amount)
    VALUES (p_auction_id, v_user, p_amount);

  UPDATE public.auction_items
     SET current_price = p_amount, updated_at = now()
   WHERE id = p_auction_id;

  SELECT COALESCE(full_name, 'A bidder') INTO v_bidder_name
    FROM public.profiles WHERE id = v_user;

  INSERT INTO public.notifications (user_id, title, message, type, related_id)
  VALUES (
    v_auction.user_id,
    'New bid',
    v_bidder_name || ' bid €' || p_amount::text || ' on "' || v_auction.title || '"',
    'auction_bid',
    p_auction_id
  );

  RETURN jsonb_build_object('ok', true, 'current_price', p_amount);
END;
$$;

REVOKE ALL ON FUNCTION public.place_auction_bid(uuid, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_auction_bid(uuid, numeric) TO authenticated;

-- 3) Auto-expiry helper (called by check-expired-listings cron)
CREATE OR REPLACE FUNCTION public.expire_auctions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  WITH upd AS (
    UPDATE public.auction_items
       SET is_active = false, updated_at = now()
     WHERE is_active = true AND ends_at <= now()
     RETURNING id
  )
  SELECT COUNT(*) INTO v_count FROM upd;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.expire_auctions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_auctions() TO service_role;

-- 4) SECURITY DEFINER RPC: complete_auction_buyout (called from verify-payment via service role,
-- but also usable by buyer post-payment validation)
CREATE OR REPLACE FUNCTION public.complete_auction_buyout(
  p_auction_id uuid,
  p_winner_id uuid,
  p_stripe_session_id text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auction record;
  v_winner_name text;
BEGIN
  SELECT * INTO v_auction FROM public.auction_items
    WHERE id = p_auction_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'auction not found'; END IF;

  -- Idempotent: if already sold to same winner, no-op
  IF v_auction.is_active = false AND v_auction.winner_id = p_winner_id THEN
    RETURN jsonb_build_object('ok', true, 'already', true);
  END IF;

  IF v_auction.buyout_price IS NULL THEN
    RAISE EXCEPTION 'no buyout price';
  END IF;

  UPDATE public.auction_items
     SET is_active = false,
         winner_id = p_winner_id,
         current_price = v_auction.buyout_price,
         stripe_session_id = p_stripe_session_id,
         paid_at = now(),
         escrow_status = 'paid',
         updated_at = now()
   WHERE id = p_auction_id;

  INSERT INTO public.auction_bids (auction_id, user_id, bid_amount)
    VALUES (p_auction_id, p_winner_id, v_auction.buyout_price);

  SELECT COALESCE(full_name, 'A buyer') INTO v_winner_name
    FROM public.profiles WHERE id = p_winner_id;

  INSERT INTO public.notifications (user_id, title, message, type, related_id)
  VALUES (
    v_auction.user_id,
    'Item purchased',
    v_winner_name || ' bought "' || v_auction.title || '" for €' || v_auction.buyout_price::text,
    'auction_buyout',
    p_auction_id
  );

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.complete_auction_buyout(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_auction_buyout(uuid, uuid, text) TO service_role;
