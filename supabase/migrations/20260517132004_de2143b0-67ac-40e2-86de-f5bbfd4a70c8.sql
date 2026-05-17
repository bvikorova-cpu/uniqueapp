-- Section 4: Crisis Relief — live updates, partners, distribution map

CREATE TABLE IF NOT EXISTS public.crisis_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.crisis_campaigns(id) ON DELETE CASCADE,
  author_user_id uuid NOT NULL,
  title text NOT NULL CHECK (length(title) BETWEEN 3 AND 200),
  body text NOT NULL CHECK (length(body) BETWEEN 3 AND 5000),
  image_url text,
  update_type text NOT NULL DEFAULT 'situation',
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crisis_updates_campaign ON public.crisis_updates(campaign_id, is_pinned DESC, created_at DESC);
ALTER TABLE public.crisis_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view crisis updates" ON public.crisis_updates;
CREATE POLICY "Anyone can view crisis updates" ON public.crisis_updates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owner can insert crisis updates" ON public.crisis_updates;
CREATE POLICY "Owner can insert crisis updates" ON public.crisis_updates FOR INSERT
  WITH CHECK (auth.uid() = author_user_id AND EXISTS (
    SELECT 1 FROM public.crisis_campaigns c WHERE c.id = campaign_id AND c.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Owner can update crisis updates" ON public.crisis_updates;
CREATE POLICY "Owner can update crisis updates" ON public.crisis_updates FOR UPDATE
  USING (auth.uid() = author_user_id);

DROP POLICY IF EXISTS "Owner can delete crisis updates" ON public.crisis_updates;
CREATE POLICY "Owner can delete crisis updates" ON public.crisis_updates FOR DELETE
  USING (auth.uid() = author_user_id);


CREATE TABLE IF NOT EXISTS public.crisis_partner_orgs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.crisis_campaigns(id) ON DELETE CASCADE,
  added_by_user_id uuid NOT NULL,
  name text NOT NULL,
  role text,
  logo_url text,
  website_url text,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crisis_partners_campaign ON public.crisis_partner_orgs(campaign_id);
ALTER TABLE public.crisis_partner_orgs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view partner orgs" ON public.crisis_partner_orgs;
CREATE POLICY "Anyone can view partner orgs" ON public.crisis_partner_orgs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owner can insert partner orgs" ON public.crisis_partner_orgs;
CREATE POLICY "Owner can insert partner orgs" ON public.crisis_partner_orgs FOR INSERT
  WITH CHECK (auth.uid() = added_by_user_id AND EXISTS (
    SELECT 1 FROM public.crisis_campaigns c WHERE c.id = campaign_id AND c.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Owner can delete partner orgs" ON public.crisis_partner_orgs;
CREATE POLICY "Owner can delete partner orgs" ON public.crisis_partner_orgs FOR DELETE
  USING (auth.uid() = added_by_user_id);


CREATE TABLE IF NOT EXISTS public.crisis_distribution_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.crisis_campaigns(id) ON DELETE CASCADE,
  added_by_user_id uuid NOT NULL,
  name text NOT NULL,
  address text,
  latitude numeric,
  longitude numeric,
  items_distributed integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crisis_dist_campaign ON public.crisis_distribution_points(campaign_id);
ALTER TABLE public.crisis_distribution_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view distribution points" ON public.crisis_distribution_points;
CREATE POLICY "Anyone can view distribution points" ON public.crisis_distribution_points FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owner can insert distribution points" ON public.crisis_distribution_points;
CREATE POLICY "Owner can insert distribution points" ON public.crisis_distribution_points FOR INSERT
  WITH CHECK (auth.uid() = added_by_user_id AND EXISTS (
    SELECT 1 FROM public.crisis_campaigns c WHERE c.id = campaign_id AND c.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Owner can update distribution points" ON public.crisis_distribution_points;
CREATE POLICY "Owner can update distribution points" ON public.crisis_distribution_points FOR UPDATE
  USING (auth.uid() = added_by_user_id);

DROP POLICY IF EXISTS "Owner can delete distribution points" ON public.crisis_distribution_points;
CREATE POLICY "Owner can delete distribution points" ON public.crisis_distribution_points FOR DELETE
  USING (auth.uid() = added_by_user_id);
