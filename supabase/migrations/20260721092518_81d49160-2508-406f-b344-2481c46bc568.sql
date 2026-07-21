
CREATE TABLE public.influking_brand_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  generated_for UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  logo TEXT NOT NULL DEFAULT '💼',
  category TEXT NOT NULL,
  budget TEXT NOT NULL,
  requirements TEXT NOT NULL,
  description TEXT NOT NULL,
  deadline DATE NOT NULL,
  applicants INT NOT NULL DEFAULT 0,
  deal_type TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.influking_brand_deals TO anon, authenticated;
GRANT INSERT, UPDATE ON public.influking_brand_deals TO authenticated;
GRANT ALL ON public.influking_brand_deals TO service_role;

ALTER TABLE public.influking_brand_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active deals"
ON public.influking_brand_deals FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can view their own generated deals"
ON public.influking_brand_deals FOR SELECT
TO authenticated
USING (generated_for = auth.uid());

CREATE INDEX idx_brand_deals_active_created ON public.influking_brand_deals(is_active, created_at DESC);
CREATE INDEX idx_brand_deals_category ON public.influking_brand_deals(category);

CREATE TABLE public.influking_brand_deal_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.influking_brand_deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pitch TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (deal_id, user_id)
);

GRANT SELECT, INSERT ON public.influking_brand_deal_applications TO authenticated;
GRANT ALL ON public.influking_brand_deal_applications TO service_role;

ALTER TABLE public.influking_brand_deal_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own applications"
ON public.influking_brand_deal_applications FOR SELECT
TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can apply"
ON public.influking_brand_deal_applications FOR INSERT
TO authenticated WITH CHECK (user_id = auth.uid());

-- Auto-increment applicants counter
CREATE OR REPLACE FUNCTION public.bump_brand_deal_applicants()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.influking_brand_deals SET applicants = applicants + 1 WHERE id = NEW.deal_id;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_bump_brand_deal_applicants
AFTER INSERT ON public.influking_brand_deal_applications
FOR EACH ROW EXECUTE FUNCTION public.bump_brand_deal_applicants();
