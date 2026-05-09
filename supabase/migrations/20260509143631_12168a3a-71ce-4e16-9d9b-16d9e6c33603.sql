-- Seller verifications
CREATE TABLE IF NOT EXISTS public.bazaar_seller_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected')),
  verified_at timestamptz,
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bazaar_seller_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verifications are viewable by everyone"
  ON public.bazaar_seller_verifications FOR SELECT USING (true);

CREATE POLICY "Sellers can request own verification"
  ON public.bazaar_seller_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins manage verifications"
  ON public.bazaar_seller_verifications FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete verifications"
  ON public.bazaar_seller_verifications FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Item reports
CREATE TABLE IF NOT EXISTS public.bazaar_item_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.bazaar_items(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL,
  reason text NOT NULL CHECK (reason IN ('scam','prohibited','offensive','duplicate','wrong_category','other')),
  details text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','resolved','dismissed')),
  resolution_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bazaar_item_reports_item ON public.bazaar_item_reports(item_id);
CREATE INDEX IF NOT EXISTS idx_bazaar_item_reports_status ON public.bazaar_item_reports(status);

ALTER TABLE public.bazaar_item_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own reports, admins see all"
  ON public.bazaar_item_reports FOR SELECT
  USING (auth.uid() = reporter_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can report"
  ON public.bazaar_item_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins update reports"
  ON public.bazaar_item_reports FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_bazaar_seller_verifications_updated
  BEFORE UPDATE ON public.bazaar_seller_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_bazaar_item_reports_updated
  BEFORE UPDATE ON public.bazaar_item_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();