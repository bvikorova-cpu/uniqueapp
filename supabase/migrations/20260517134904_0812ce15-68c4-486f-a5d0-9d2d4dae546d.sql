
-- Talent sponsorship: sponsor tiers/benefits + milestone proofs
CREATE TABLE IF NOT EXISTS public.talent_sponsor_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL,
  tier_name TEXT NOT NULL,
  min_amount NUMERIC NOT NULL CHECK (min_amount > 0),
  benefits TEXT[] NOT NULL DEFAULT '{}',
  perk_icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.talent_milestone_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  proof_type TEXT NOT NULL DEFAULT 'achievement', -- achievement | performance | award | release
  media_url TEXT,
  external_url TEXT,
  achieved_on DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.talent_sponsor_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_milestone_proofs ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "tiers_public_read" ON public.talent_sponsor_tiers FOR SELECT USING (true);
CREATE POLICY "proofs_public_read" ON public.talent_milestone_proofs FOR SELECT USING (true);

-- Owner-only write (via talent_campaigns.user_id)
CREATE POLICY "tiers_owner_insert" ON public.talent_sponsor_tiers FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.talent_campaigns c WHERE c.id = campaign_id AND c.user_id = auth.uid()));
CREATE POLICY "tiers_owner_update" ON public.talent_sponsor_tiers FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.talent_campaigns c WHERE c.id = campaign_id AND c.user_id = auth.uid()));
CREATE POLICY "tiers_owner_delete" ON public.talent_sponsor_tiers FOR DELETE
USING (EXISTS (SELECT 1 FROM public.talent_campaigns c WHERE c.id = campaign_id AND c.user_id = auth.uid()));

CREATE POLICY "proofs_owner_insert" ON public.talent_milestone_proofs FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.talent_campaigns c WHERE c.id = campaign_id AND c.user_id = auth.uid()));
CREATE POLICY "proofs_owner_update" ON public.talent_milestone_proofs FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.talent_campaigns c WHERE c.id = campaign_id AND c.user_id = auth.uid()));
CREATE POLICY "proofs_owner_delete" ON public.talent_milestone_proofs FOR DELETE
USING (EXISTS (SELECT 1 FROM public.talent_campaigns c WHERE c.id = campaign_id AND c.user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_tiers_campaign ON public.talent_sponsor_tiers(campaign_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_proofs_campaign ON public.talent_milestone_proofs(campaign_id, achieved_on DESC);
