DROP FUNCTION IF EXISTS public.purchase_horse_from_market(uuid, uuid);

CREATE OR REPLACE FUNCTION public.purchase_horse_from_market(listing_id uuid, buyer_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_listing_id uuid := listing_id;
  v_buyer uuid := buyer_id;
  v_listing RECORD;
  v_price integer;
  v_before integer;
  v_after integer;
  v_seller_before integer;
  v_seller_after integer;
  v_horse_name text;
BEGIN
  IF v_buyer IS NULL OR v_buyer <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO v_listing
  FROM public.horse_market_listings
  WHERE id = v_listing_id AND is_active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found or no longer active';
  END IF;

  IF v_listing.seller_id = v_buyer THEN
    RAISE EXCEPTION 'You cannot buy your own horse';
  END IF;

  v_price := GREATEST(1, COALESCE(v_listing.price_coins, 1));

  -- Buyer wallet (create if missing) and lock it
  INSERT INTO public.ai_credits (user_id, credits_remaining)
  VALUES (v_buyer, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT credits_remaining INTO v_before
  FROM public.ai_credits WHERE user_id = v_buyer FOR UPDATE;

  IF COALESCE(v_before, 0) < v_price THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS: need % credits, you have %', v_price, COALESCE(v_before, 0);
  END IF;

  v_after := v_before - v_price;

  UPDATE public.ai_credits
  SET credits_remaining = v_after,
      last_used_at = now(),
      updated_at = now()
  WHERE user_id = v_buyer;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
  VALUES (v_buyer, -v_price, v_before, v_after, 'horse-market-purchase', 'horse_racing', v_buyer,
          jsonb_build_object('listing_id', v_listing_id, 'horse_id', v_listing.horse_id, 'seller_id', v_listing.seller_id));

  -- Seller wallet (create if missing) and lock it
  INSERT INTO public.ai_credits (user_id, credits_remaining)
  VALUES (v_listing.seller_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT credits_remaining INTO v_seller_before
  FROM public.ai_credits WHERE user_id = v_listing.seller_id FOR UPDATE;

  v_seller_after := COALESCE(v_seller_before, 0) + v_price;

  UPDATE public.ai_credits
  SET credits_remaining = v_seller_after,
      updated_at = now()
  WHERE user_id = v_listing.seller_id;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
  VALUES (v_listing.seller_id, v_price, COALESCE(v_seller_before, 0), v_seller_after, 'horse-market-sale', 'horse_racing', v_buyer,
          jsonb_build_object('listing_id', v_listing_id, 'horse_id', v_listing.horse_id, 'buyer_id', v_buyer));

  INSERT INTO public.ai_usage_history (user_id, usage_type, credits_used, description)
  VALUES (v_buyer, 'custom_generation', v_price, 'horse-racing:market-purchase');

  -- Transfer the horse to the buyer
  UPDATE public.horses
  SET user_id = v_buyer,
      updated_at = now()
  WHERE id = v_listing.horse_id
  RETURNING name INTO v_horse_name;

  -- Close the listing with the real buyer
  UPDATE public.horse_market_listings
  SET is_active = false,
      sold_at = now(),
      buyer_id = v_buyer
  WHERE id = v_listing_id;

  -- Remove any other active listings for the same horse
  UPDATE public.horse_market_listings
  SET is_active = false
  WHERE horse_id = v_listing.horse_id AND id <> v_listing_id AND is_active = true;

  RETURN jsonb_build_object(
    'success', true,
    'horse_id', v_listing.horse_id,
    'horse_name', v_horse_name,
    'price', v_price,
    'buyer_balance', v_after
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.purchase_horse_from_market(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.purchase_horse_from_market(uuid, uuid) TO authenticated, service_role;