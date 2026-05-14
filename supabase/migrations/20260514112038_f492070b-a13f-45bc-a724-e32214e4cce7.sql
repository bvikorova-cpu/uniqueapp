-- Wishlists
CREATE TABLE IF NOT EXISTS public.product_wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON public.product_wishlists(user_id, created_at DESC);
ALTER TABLE public.product_wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view wishlist"
  ON public.product_wishlists FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Owner can add to wishlist"
  ON public.product_wishlists FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can remove from wishlist"
  ON public.product_wishlists FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Price alerts
CREATE TABLE IF NOT EXISTS public.product_price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  target_price_cents INT NOT NULL CHECK (target_price_cents > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_price_alerts_product ON public.product_price_alerts(product_id, is_active);
ALTER TABLE public.product_price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view price alerts"
  ON public.product_price_alerts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Owner can create price alerts"
  ON public.product_price_alerts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can update price alerts"
  ON public.product_price_alerts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Owner can delete price alerts"
  ON public.product_price_alerts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Seller reviews
CREATE TABLE IF NOT EXISTS public.seller_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (seller_id, buyer_id)
);
CREATE INDEX IF NOT EXISTS idx_seller_reviews_seller ON public.seller_reviews(seller_id, created_at DESC);
ALTER TABLE public.seller_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view seller reviews"
  ON public.seller_reviews FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Buyer can create review"
  ON public.seller_reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id AND auth.uid() <> seller_id);
CREATE POLICY "Buyer can edit own review"
  ON public.seller_reviews FOR UPDATE TO authenticated
  USING (auth.uid() = buyer_id);
CREATE POLICY "Buyer can delete own review"
  ON public.seller_reviews FOR DELETE TO authenticated
  USING (auth.uid() = buyer_id);

CREATE TRIGGER trg_seller_reviews_updated_at
  BEFORE UPDATE ON public.seller_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();