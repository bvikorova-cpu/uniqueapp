
CREATE TABLE public.promo_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image','video')),
  link_url TEXT,
  tier TEXT NOT NULL DEFAULT 'standard' CHECK (tier IN ('standard','top')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','expired','cancelled')),
  active_until TIMESTAMPTZ,
  stripe_session_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_promo_listings_active ON public.promo_listings (status, tier, active_until DESC);
CREATE INDEX idx_promo_listings_user ON public.promo_listings (user_id);

GRANT SELECT ON public.promo_listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_listings TO authenticated;
GRANT ALL ON public.promo_listings TO service_role;

ALTER TABLE public.promo_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active promo listings"
  ON public.promo_listings FOR SELECT
  USING (status = 'active' AND (active_until IS NULL OR active_until > now()));

CREATE POLICY "Users can view own promo listings"
  ON public.promo_listings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own promo listings"
  ON public.promo_listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own promo listings"
  ON public.promo_listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own promo listings"
  ON public.promo_listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_promo_listings_updated_at
  BEFORE UPDATE ON public.promo_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
