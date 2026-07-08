
CREATE OR REPLACE FUNCTION public.place_memory_auction_bid(p_auction_id uuid, p_amount numeric)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_auction public.memory_auctions;
  v_memory public.memories;
  v_min numeric;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  SELECT * INTO v_auction FROM public.memory_auctions WHERE id = p_auction_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'auction not found'; END IF;
  IF v_auction.status <> 'active' OR v_auction.ends_at <= now() THEN
    UPDATE public.memory_auctions SET status='ended' WHERE id = p_auction_id AND status='active';
    RAISE EXCEPTION 'auction ended';
  END IF;
  SELECT * INTO v_memory FROM public.memories WHERE id = v_auction.memory_id;
  IF v_memory.user_id = v_user THEN RAISE EXCEPTION 'cannot bid on your own memory'; END IF;
  v_min := COALESCE(v_auction.current_bid, v_auction.starting_price) + 1;
  IF p_amount < v_min THEN
    RAISE EXCEPTION 'bid too low; minimum is %', v_min;
  END IF;
  INSERT INTO public.memory_auction_bids(auction_id, bidder_id, bid_amount)
    VALUES (p_auction_id, v_user, p_amount);
  UPDATE public.memory_auctions
     SET current_bid = p_amount, highest_bidder_id = v_user, updated_at = now()
   WHERE id = p_auction_id;
  INSERT INTO public.notifications(user_id, title, message, type, related_id)
  VALUES (v_memory.user_id, 'New bid on your memory',
    'A bidder offered €' || p_amount::text || ' for "' || v_memory.title || '"',
    'memory_auction_bid', p_auction_id);
  RETURN jsonb_build_object('ok', true, 'current_bid', p_amount);
END;
$$;

GRANT EXECUTE ON FUNCTION public.place_memory_auction_bid(uuid, numeric) TO authenticated;
