GRANT SELECT ON public.promo_listing_likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.promo_listing_likes TO authenticated;
GRANT ALL ON public.promo_listing_likes TO service_role;