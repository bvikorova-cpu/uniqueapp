
-- 1) Cashback ledger
CREATE TABLE IF NOT EXISTS public.coupon_cashback_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  coupon_id uuid REFERENCES public.coupon_listings(id) ON DELETE SET NULL,
  receipt_url text,
  store_name text,
  receipt_total numeric(10,2) NOT NULL DEFAULT 0,
  cashback_amount numeric(10,2) NOT NULL DEFAULT 0,
  cashback_rate numeric(5,4) NOT NULL DEFAULT 0.02,
  status text NOT NULL DEFAULT 'pending', -- pending|approved|rejected|paid
  ai_extracted jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coupon_cashback_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own cashback" ON public.coupon_cashback_ledger FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own cashback" ON public.coupon_cashback_ledger FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins manage cashback" ON public.coupon_cashback_ledger FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS idx_cashback_user ON public.coupon_cashback_ledger(user_id, created_at DESC);

-- 2) Geo deals
ALTER TABLE public.coupon_listings
  ADD COLUMN IF NOT EXISTS geo_lat numeric(9,6),
  ADD COLUMN IF NOT EXISTS geo_lon numeric(9,6),
  ADD COLUMN IF NOT EXISTS geo_city text,
  ADD COLUMN IF NOT EXISTS geo_radius_km numeric(6,2);

CREATE OR REPLACE FUNCTION public.coupon_geo_nearby(_lat numeric, _lon numeric, _radius_km numeric DEFAULT 25)
RETURNS SETOF public.coupon_listings
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT * FROM public.coupon_listings
  WHERE is_sold = false
    AND geo_lat IS NOT NULL AND geo_lon IS NOT NULL
    AND (
      6371 * acos(
        cos(radians(_lat)) * cos(radians(geo_lat)) *
        cos(radians(geo_lon) - radians(_lon)) +
        sin(radians(_lat)) * sin(radians(geo_lat))
      )
    ) <= COALESCE(_radius_km, 25)
  ORDER BY created_at DESC
  LIMIT 50;
$$;

-- 3) Browser extension waitlist
CREATE TABLE IF NOT EXISTS public.coupon_extension_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  user_id uuid,
  browser text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coupon_extension_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can join waitlist" ON public.coupon_extension_waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY "users view own waitlist" ON public.coupon_extension_waitlist FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- 4) Public API keys (affiliate program)
CREATE TABLE IF NOT EXISTS public.coupon_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  key_hash text NOT NULL UNIQUE,
  label text,
  scope text NOT NULL DEFAULT 'read',
  rate_limit_per_min int NOT NULL DEFAULT 60,
  last_used_at timestamptz,
  revoked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coupon_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own api keys" ON public.coupon_api_keys FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5) Storage bucket for receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('coupon-receipts','coupon-receipts', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "users upload own receipts" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'coupon-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "users read own receipts" ON storage.objects FOR SELECT
  USING (bucket_id = 'coupon-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 6) Stacking compatibility check RPC
CREATE OR REPLACE FUNCTION public.coupon_stacking_check(_ids uuid[])
RETURNS TABLE(coupon_id uuid, store_name text, coupon_type text, selling_price numeric, original_value numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, store_name, coupon_type, selling_price, original_value
  FROM public.coupon_listings
  WHERE id = ANY(_ids) AND is_sold = false;
$$;
