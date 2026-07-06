
CREATE TABLE IF NOT EXISTS public.service_offerings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  duration_min integer NOT NULL CHECK (duration_min BETWEEN 5 AND 480),
  price_cents integer NOT NULL CHECK (price_cents >= 100),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.service_offerings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.service_offerings TO authenticated;
GRANT ALL ON public.service_offerings TO service_role;

ALTER TABLE public.service_offerings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view service offerings"
  ON public.service_offerings FOR SELECT USING (true);
CREATE POLICY "Provider manages own offerings"
  ON public.service_offerings FOR ALL
  USING (auth.uid() = provider_id) WITH CHECK (auth.uid() = provider_id);

CREATE INDEX IF NOT EXISTS idx_service_offerings_provider ON public.service_offerings(provider_id, is_active);

DROP TRIGGER IF EXISTS trg_service_offerings_updated_at ON public.service_offerings;
CREATE TRIGGER trg_service_offerings_updated_at
  BEFORE UPDATE ON public.service_offerings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.service_bookings
  ADD COLUMN IF NOT EXISTS offering_id uuid,
  ADD COLUMN IF NOT EXISTS offering_name text;

CREATE INDEX IF NOT EXISTS idx_service_bookings_offering ON public.service_bookings(offering_id);

ALTER TABLE public.promo_listings
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS city text;

CREATE INDEX IF NOT EXISTS idx_promo_listings_category ON public.promo_listings(category);
CREATE INDEX IF NOT EXISTS idx_promo_listings_city ON public.promo_listings(city);
