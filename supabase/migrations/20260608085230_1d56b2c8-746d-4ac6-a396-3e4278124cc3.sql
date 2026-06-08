
-- 1) Branding (white-label) — Platinum+
CREATE TABLE public.brand_sponsor_branding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL UNIQUE REFERENCES public.brand_sponsors(id) ON DELETE CASCADE,
  primary_color text,
  accent_color text,
  background_color text,
  logo_url text,
  banner_url text,
  custom_css text,
  custom_domain text,
  tagline text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brand_sponsor_branding TO authenticated;
GRANT ALL ON public.brand_sponsor_branding TO service_role;
ALTER TABLE public.brand_sponsor_branding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sponsor reads own branding"
  ON public.brand_sponsor_branding FOR SELECT TO authenticated
  USING (sponsor_id IN (SELECT id FROM public.brand_sponsors WHERE user_id = auth.uid()));
CREATE POLICY "Sponsor writes own branding"
  ON public.brand_sponsor_branding FOR INSERT TO authenticated
  WITH CHECK (sponsor_id IN (
    SELECT id FROM public.brand_sponsors
    WHERE user_id = auth.uid()
      AND tier IN ('platinum','enterprise')
      AND subscription_status = 'active'
  ));
CREATE POLICY "Sponsor updates own branding"
  ON public.brand_sponsor_branding FOR UPDATE TO authenticated
  USING (sponsor_id IN (
    SELECT id FROM public.brand_sponsors
    WHERE user_id = auth.uid()
      AND tier IN ('platinum','enterprise')
      AND subscription_status = 'active'
  ));
CREATE POLICY "Admins manage all branding"
  ON public.brand_sponsor_branding FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_branding_updated
  BEFORE UPDATE ON public.brand_sponsor_branding
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Account manager — Enterprise
CREATE TABLE public.brand_sponsor_account_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL UNIQUE REFERENCES public.brand_sponsors(id) ON DELETE CASCADE,
  manager_user_id uuid,
  manager_name text NOT NULL,
  manager_email text NOT NULL,
  manager_phone text,
  calendar_url text,
  notes text,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.brand_sponsor_account_managers TO authenticated;
GRANT ALL ON public.brand_sponsor_account_managers TO service_role;
ALTER TABLE public.brand_sponsor_account_managers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sponsor reads own account manager"
  ON public.brand_sponsor_account_managers FOR SELECT TO authenticated
  USING (sponsor_id IN (SELECT id FROM public.brand_sponsors WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage account managers"
  ON public.brand_sponsor_account_managers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_am_updated
  BEFORE UPDATE ON public.brand_sponsor_account_managers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Events & custom activations — Platinum+
CREATE TABLE public.brand_sponsor_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES public.brand_sponsors(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  event_type text NOT NULL DEFAULT 'marketing'
    CHECK (event_type IN ('marketing','co_branded','custom_activation','press','social')),
  status text NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned','in_progress','completed','cancelled')),
  scheduled_for timestamptz,
  deliverables jsonb NOT NULL DEFAULT '[]'::jsonb,
  budget_cents integer,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.brand_sponsor_events TO authenticated;
GRANT ALL ON public.brand_sponsor_events TO service_role;
ALTER TABLE public.brand_sponsor_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sponsor reads own events"
  ON public.brand_sponsor_events FOR SELECT TO authenticated
  USING (sponsor_id IN (SELECT id FROM public.brand_sponsors WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage all events"
  ON public.brand_sponsor_events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_brand_sponsor_events_sponsor ON public.brand_sponsor_events(sponsor_id, scheduled_for DESC);

CREATE TRIGGER trg_events_updated
  BEFORE UPDATE ON public.brand_sponsor_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
