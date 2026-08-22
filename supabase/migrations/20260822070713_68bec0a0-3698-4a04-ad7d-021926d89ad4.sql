GRANT SELECT, INSERT, DELETE ON public.promo_listing_likes TO authenticated;
GRANT ALL ON public.promo_listing_likes TO service_role;
CREATE INDEX IF NOT EXISTS idx_promo_listing_likes_listing_id ON public.promo_listing_likes(listing_id);