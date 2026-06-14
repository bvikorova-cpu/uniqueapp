
CREATE OR REPLACE FUNCTION public.place_collectible_bid(
  p_auction_id uuid,
  p_bid integer
)
RETURNS TABLE(success boolean, new_price integer, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_auction record;
BEGIN
  IF v_uid IS NULL THEN
    RETURN QUERY SELECT false, 0, 'not_authenticated'::text; RETURN;
  END IF;
  IF p_bid IS NULL OR p_bid <= 0 OR p_bid > 100000000 THEN
    RETURN QUERY SELECT false, 0, 'invalid_bid'::text; RETURN;
  END IF;

  SELECT * INTO v_auction
  FROM public.collectible_auctions
  WHERE id = p_auction_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 'not_found'::text; RETURN;
  END IF;
  IF v_auction.status <> 'active' THEN
    RETURN QUERY SELECT false, v_auction.current_price, 'not_active'::text; RETURN;
  END IF;
  IF v_auction.expires_at <= now() THEN
    RETURN QUERY SELECT false, v_auction.current_price, 'expired'::text; RETURN;
  END IF;
  IF v_auction.seller_id = v_uid THEN
    RETURN QUERY SELECT false, v_auction.current_price, 'own_auction'::text; RETURN;
  END IF;
  IF p_bid <= v_auction.current_price THEN
    RETURN QUERY SELECT false, v_auction.current_price, 'bid_too_low'::text; RETURN;
  END IF;

  UPDATE public.collectible_auctions
  SET current_price = p_bid, updated_at = now()
  WHERE id = p_auction_id;

  RETURN QUERY SELECT true, p_bid, 'ok'::text;
END;
$$;

GRANT EXECUTE ON FUNCTION public.place_collectible_bid(uuid, integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.buyout_collectible_auction(
  p_auction_id uuid
)
RETURNS TABLE(success boolean, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_auction record;
BEGIN
  IF v_uid IS NULL THEN
    RETURN QUERY SELECT false, 'not_authenticated'::text; RETURN;
  END IF;

  SELECT * INTO v_auction
  FROM public.collectible_auctions
  WHERE id = p_auction_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'not_found'::text; RETURN;
  END IF;
  IF v_auction.status <> 'active' THEN
    RETURN QUERY SELECT false, 'not_active'::text; RETURN;
  END IF;
  IF v_auction.expires_at <= now() THEN
    RETURN QUERY SELECT false, 'expired'::text; RETURN;
  END IF;
  IF v_auction.seller_id = v_uid THEN
    RETURN QUERY SELECT false, 'own_auction'::text; RETURN;
  END IF;
  IF v_auction.buyout_price IS NULL THEN
    RETURN QUERY SELECT false, 'no_buyout'::text; RETURN;
  END IF;

  UPDATE public.collectible_auctions
  SET status = 'sold',
      current_price = v_auction.buyout_price,
      updated_at = now()
  WHERE id = p_auction_id;

  IF v_auction.user_collectible_id IS NOT NULL THEN
    UPDATE public.user_collectibles
    SET user_id = v_uid,
        is_for_sale = false,
        is_for_trade = false,
        acquired_at = now(),
        acquired_method = 'auction_buyout'
    WHERE id = v_auction.user_collectible_id
      AND user_id = v_auction.seller_id;
  END IF;

  RETURN QUERY SELECT true, 'ok'::text;
END;
$$;

GRANT EXECUTE ON FUNCTION public.buyout_collectible_auction(uuid) TO authenticated;
