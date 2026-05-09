DROP POLICY IF EXISTS "Buyers can view purchased coupon listing" ON public.coupon_listings;
CREATE POLICY "Buyers can view purchased coupon listing"
  ON public.coupon_listings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coupon_orders o
      WHERE o.coupon_id = coupon_listings.id
        AND o.buyer_id = auth.uid()
        AND o.status = 'completed'
    )
  );