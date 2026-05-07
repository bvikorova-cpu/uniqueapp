CREATE TABLE public.stock_licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_item_id UUID NOT NULL,
  license_type TEXT NOT NULL CHECK (license_type IN ('standard','extended','editorial')),
  price_paid NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  purchase_reference TEXT,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked','expired')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own licenses" ON public.stock_licenses
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Users insert own licenses" ON public.stock_licenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins update licenses" ON public.stock_licenses
  FOR UPDATE USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins delete licenses" ON public.stock_licenses
  FOR DELETE USING (public.has_role(auth.uid(),'admin'));

CREATE INDEX idx_stock_licenses_user ON public.stock_licenses(user_id, created_at DESC);
CREATE INDEX idx_stock_licenses_item ON public.stock_licenses(content_item_id);

CREATE TRIGGER update_stock_licenses_updated_at
  BEFORE UPDATE ON public.stock_licenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();