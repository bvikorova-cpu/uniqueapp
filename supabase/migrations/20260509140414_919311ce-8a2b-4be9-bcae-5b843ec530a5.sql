
-- Seller ratings (post-purchase reviews)
CREATE TABLE IF NOT EXISTS public.bazaar_seller_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.bazaar_orders(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (order_id, buyer_id)
);

CREATE INDEX IF NOT EXISTS idx_bazaar_seller_ratings_seller ON public.bazaar_seller_ratings(seller_id);

ALTER TABLE public.bazaar_seller_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings are publicly viewable"
  ON public.bazaar_seller_ratings FOR SELECT USING (true);

CREATE POLICY "Buyer can rate completed order"
  ON public.bazaar_seller_ratings FOR INSERT WITH CHECK (
    auth.uid() = buyer_id
    AND EXISTS (
      SELECT 1 FROM public.bazaar_orders o
      WHERE o.id = order_id
        AND o.buyer_id = auth.uid()
        AND o.seller_id = bazaar_seller_ratings.seller_id
        AND o.status IN ('completed','delivered')
    )
  );

CREATE POLICY "Buyer can update own rating"
  ON public.bazaar_seller_ratings FOR UPDATE USING (auth.uid() = buyer_id);

CREATE POLICY "Buyer can delete own rating"
  ON public.bazaar_seller_ratings FOR DELETE USING (auth.uid() = buyer_id);

-- Aggregate view
CREATE OR REPLACE VIEW public.bazaar_seller_rating_summary AS
SELECT
  seller_id,
  COUNT(*)::int AS rating_count,
  ROUND(AVG(rating)::numeric, 2) AS avg_rating
FROM public.bazaar_seller_ratings
GROUP BY seller_id;

GRANT SELECT ON public.bazaar_seller_rating_summary TO anon, authenticated;
