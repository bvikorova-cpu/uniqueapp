CREATE OR REPLACE FUNCTION public.activate_promo_listing_with_credits(_listing_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing public.promo_listings;
  v_cost int;
  v_spend jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT * INTO v_listing FROM public.promo_listings
   WHERE id = _listing_id AND user_id = auth.uid();
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'listing_not_found');
  END IF;

  IF v_listing.status = 'active' AND v_listing.active_until IS NOT NULL AND v_listing.active_until > now() THEN
    RETURN jsonb_build_object('ok', true, 'already_active', true, 'active_until', v_listing.active_until);
  END IF;

  v_cost := CASE WHEN v_listing.tier = 'top' THEN 50 ELSE 20 END;

  v_spend := public.spend_ai_credits(v_cost, 'promo_listing_' || v_listing.tier, 'promotions');
  IF COALESCE((v_spend->>'ok')::boolean, false) IS NOT TRUE THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient_credits', 'cost', v_cost);
  END IF;

  UPDATE public.promo_listings
     SET status = 'active',
         active_until = now() + interval '30 days'
   WHERE id = _listing_id
   RETURNING * INTO v_listing;

  RETURN jsonb_build_object('ok', true, 'cost', v_cost, 'active_until', v_listing.active_until);
END;
$$;

GRANT EXECUTE ON FUNCTION public.activate_promo_listing_with_credits(uuid) TO authenticated;