-- Fix race condition: if auction already has a different winner, refund path must
-- trigger by RAISING. verify-payment catches the error and logs; second buyer's
-- payment_records row will be flagged for manual refund (stripe-webhook handles
-- charge.refunded). This prevents the silent winner_id overwrite.
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

  -- Idempotent: same winner re-verifying (e.g. webhook + frontend both call)
  IF v_auction.winner_id IS NOT NULL AND v_auction.winner_id = p_winner_id THEN
    RETURN jsonb_build_object('ok', true, 'already', true);
  END IF;

  -- RACE GUARD: another buyer already won this auction. Do NOT overwrite.
  -- Caller (verify-payment) should flag this session for manual refund.
  IF v_auction.winner_id IS NOT NULL AND v_auction.winner_id <> p_winner_id THEN
    RAISE EXCEPTION 'auction already sold to another buyer'
      USING ERRCODE = 'P0002', HINT = 'refund_required';
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

-- Safer delete: prevent removing auctions that already have bids or a winner.
CREATE OR REPLACE FUNCTION public.delete_auction_if_safe(p_auction_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_auction record;
  v_bid_count integer;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;

  SELECT * INTO v_auction FROM public.auction_items
    WHERE id = p_auction_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'auction not found'; END IF;
  IF v_auction.user_id <> v_user THEN RAISE EXCEPTION 'not your auction'; END IF;
  IF v_auction.winner_id IS NOT NULL THEN
    RAISE EXCEPTION 'cannot delete sold auction';
  END IF;

  SELECT COUNT(*) INTO v_bid_count FROM public.auction_bids
    WHERE auction_id = p_auction_id;
  IF v_bid_count > 0 THEN
    RAISE EXCEPTION 'cannot delete auction with bids';
  END IF;

  DELETE FROM public.auction_items WHERE id = p_auction_id;
  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.delete_auction_if_safe(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_auction_if_safe(uuid) TO authenticated;