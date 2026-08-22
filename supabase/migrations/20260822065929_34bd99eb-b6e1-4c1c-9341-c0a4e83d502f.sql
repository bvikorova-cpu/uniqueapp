CREATE TABLE public.promo_listing_likes (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.promo_listings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (listing_id, user_id)
);
GRANT SELECT ON public.promo_listing_likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.promo_listing_likes TO authenticated;
GRANT ALL ON public.promo_listing_likes TO service_role;
ALTER TABLE public.promo_listing_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view promo likes" ON public.promo_listing_likes FOR SELECT USING (true);
CREATE POLICY "Users can like promos" ON public.promo_listing_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike own promo likes" ON public.promo_listing_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_promo_listing_likes_listing ON public.promo_listing_likes(listing_id);