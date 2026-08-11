CREATE OR REPLACE FUNCTION public.purchase_horse_from_market(listing_id uuid, buyer_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_listing RECORD;
  v_price INTEGER;
BEGIN
  SELECT * INTO v_listing
  FROM horse_market_listings
  WHERE id = listing_id AND is_active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found or no longer active';
  END IF;

  IF v_listing.seller_id = buyer_id THEN
    RAISE EXCEPTION 'You cannot buy your own horse';
  END IF;

  v_price := GREATEST(1, LEAST(1000, COALESCE(v_listing.price_coins, 1)));

  -- Charge the buyer from the unified AI credits pool (raises INSUFFICIENT_CREDITS)
  PERFORM public.deduct_ai_credits_atomic(buyer_id, v_price);

  -- Pay the seller in credits
  PERFORM public.add_ai_credits(v_listing.seller_id, v_price, 'horse-market-sale', 'horse_racing');

  INSERT INTO public.ai_usage_history (user_id, usage_type, credits_used, description)
  VALUES (buyer_id, 'custom_generation', v_price, 'horse-racing:market-purchase');

  UPDATE horses
  SET user_id = buyer_id,
      updated_at = now()
  WHERE id = v_listing.horse_id;

  UPDATE horse_market_listings
  SET is_active = false,
      sold_at = now(),
      buyer_id = buyer_id
  WHERE id = listing_id;
END;
$function$;