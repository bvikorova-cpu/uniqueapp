
-- ============ ENUMS ============
CREATE TYPE public.campaign_status AS ENUM ('draft','active','paused','closed');
CREATE TYPE public.campaign_urgency AS ENUM ('normal','urgent','critical');
CREATE TYPE public.fundraising_payout_status AS ENUM ('pending','paid','cancelled');
CREATE TYPE public.recurring_donation_status AS ENUM ('active','cancelled');

-- ============ SHARED updated_at TRIGGER ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ fundraising_campaigns ============
CREATE TABLE public.fundraising_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  story_md TEXT NOT NULL DEFAULT '',
  cover_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  goal_cents BIGINT NOT NULL CHECK (goal_cents > 0),
  currency TEXT NOT NULL DEFAULT 'EUR' CHECK (currency = 'EUR'),
  deadline_at TIMESTAMPTZ,
  status public.campaign_status NOT NULL DEFAULT 'draft',
  urgency public.campaign_urgency NOT NULL DEFAULT 'normal',
  allow_recurring BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fundraising_campaigns TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fundraising_campaigns TO authenticated;
GRANT ALL ON public.fundraising_campaigns TO service_role;
ALTER TABLE public.fundraising_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active fundraising campaigns"
  ON public.fundraising_campaigns FOR SELECT
  USING (status = 'active' OR auth.uid() = owner_id);
CREATE POLICY "Owners can insert fundraising campaigns"
  ON public.fundraising_campaigns FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update fundraising campaigns"
  ON public.fundraising_campaigns FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can delete draft fundraising campaigns"
  ON public.fundraising_campaigns FOR DELETE TO authenticated
  USING (auth.uid() = owner_id AND status = 'draft');

CREATE INDEX idx_fundraising_campaigns_status ON public.fundraising_campaigns(status) WHERE status = 'active';
CREATE INDEX idx_fundraising_campaigns_owner ON public.fundraising_campaigns(owner_id);
CREATE INDEX idx_fundraising_campaigns_category ON public.fundraising_campaigns(category);
CREATE TRIGGER trg_fundraising_campaigns_updated_at BEFORE UPDATE ON public.fundraising_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ donations ============
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.fundraising_campaigns(id) ON DELETE CASCADE,
  donor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'EUR' CHECK (currency = 'EUR'),
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  stripe_session_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  message TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Donors see their own donations"
  ON public.donations FOR SELECT TO authenticated
  USING (auth.uid() = donor_id);
CREATE POLICY "Campaign owners see donations to their campaigns"
  ON public.donations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.fundraising_campaigns c WHERE c.id = campaign_id AND c.owner_id = auth.uid()));

CREATE INDEX idx_fundraising_donations_campaign ON public.donations(campaign_id);
CREATE INDEX idx_fundraising_donations_donor ON public.donations(donor_id);

-- Public sanitized donor wall (no auth.users PII, honors is_anonymous)
CREATE OR REPLACE VIEW public.donor_wall
WITH (security_invoker = true)
AS
SELECT
  d.id,
  d.campaign_id,
  d.amount_cents,
  d.currency,
  d.message,
  d.created_at,
  CASE WHEN d.is_anonymous THEN NULL ELSE d.donor_id END AS donor_id,
  CASE WHEN d.is_anonymous OR d.donor_id IS NULL THEN 'Anonymous'
       ELSE COALESCE(p.full_name, 'Supporter') END AS display_name,
  CASE WHEN d.is_anonymous THEN NULL ELSE p.avatar_url END AS avatar_url
FROM public.donations d
LEFT JOIN public.profiles p ON p.id = d.donor_id
WHERE EXISTS (SELECT 1 FROM public.fundraising_campaigns c WHERE c.id = d.campaign_id AND c.status = 'active');

-- Public wall needs an explicit SELECT policy on donations for anon (view is security_invoker)
CREATE POLICY "Anon can read donations only via donor_wall view"
  ON public.donations FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.fundraising_campaigns c WHERE c.id = campaign_id AND c.status='active'));
GRANT SELECT ON public.donations TO anon;
GRANT SELECT ON public.donor_wall TO anon, authenticated;

-- ============ fundraising_payouts ============
CREATE TABLE public.fundraising_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  campaign_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gross_cents BIGINT NOT NULL CHECK (gross_cents > 0),
  fee_cents BIGINT NOT NULL CHECK (fee_cents >= 0),
  net_cents BIGINT NOT NULL CHECK (net_cents >= 0),
  status public.fundraising_payout_status NOT NULL DEFAULT 'pending',
  stripe_transfer_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fundraising_payouts TO authenticated;
GRANT ALL ON public.fundraising_payouts TO service_role;
ALTER TABLE public.fundraising_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners see their fundraising payouts"
  ON public.fundraising_payouts FOR SELECT TO authenticated
  USING (auth.uid() = campaign_owner_id);

CREATE INDEX idx_fundraising_payouts_owner ON public.fundraising_payouts(campaign_owner_id);
CREATE INDEX idx_fundraising_payouts_status ON public.fundraising_payouts(status);
CREATE TRIGGER trg_fundraising_payouts_updated_at BEFORE UPDATE ON public.fundraising_payouts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ recurring_donations ============
CREATE TABLE public.recurring_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.fundraising_campaigns(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  status public.recurring_donation_status NOT NULL DEFAULT 'active',
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.recurring_donations TO authenticated;
GRANT ALL ON public.recurring_donations TO service_role;
ALTER TABLE public.recurring_donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Donor sees their recurring donations"
  ON public.recurring_donations FOR SELECT TO authenticated
  USING (auth.uid() = donor_id);
CREATE POLICY "Donor can cancel their recurring donations"
  ON public.recurring_donations FOR UPDATE TO authenticated
  USING (auth.uid() = donor_id) WITH CHECK (auth.uid() = donor_id);

CREATE INDEX idx_recurring_donations_donor ON public.recurring_donations(donor_id);
CREATE INDEX idx_recurring_donations_campaign ON public.recurring_donations(campaign_id);
CREATE TRIGGER trg_recurring_donations_updated_at BEFORE UPDATE ON public.recurring_donations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ talent_sponsorships ============
CREATE TABLE public.talent_sponsorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sponsor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'EUR' CHECK (currency = 'EUR'),
  stripe_session_id TEXT UNIQUE,
  message TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.talent_sponsorships TO authenticated;
GRANT ALL ON public.talent_sponsorships TO service_role;
ALTER TABLE public.talent_sponsorships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Talent sees sponsorships received"
  ON public.talent_sponsorships FOR SELECT TO authenticated
  USING (auth.uid() = talent_id);
CREATE POLICY "Sponsor sees sponsorships sent"
  ON public.talent_sponsorships FOR SELECT TO authenticated
  USING (auth.uid() = sponsor_id);

CREATE INDEX idx_talent_sponsorships_talent ON public.talent_sponsorships(talent_id);
CREATE INDEX idx_talent_sponsorships_sponsor ON public.talent_sponsorships(sponsor_id);
