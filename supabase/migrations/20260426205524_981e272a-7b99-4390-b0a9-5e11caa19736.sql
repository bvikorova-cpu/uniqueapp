-- P1.4a: Brand Collaboration escrow infrastructure

-- 1. Add helper columns to campaign_applications for fast lookup.
ALTER TABLE public.campaign_applications
  ADD COLUMN IF NOT EXISTS agreed_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending','paid','released','refunded','disputed'));

-- 2. Create the escrow table itself.
CREATE TABLE IF NOT EXISTS public.campaign_escrow (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.campaign_applications(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.brand_campaigns(id) ON DELETE CASCADE,
  brand_user_id UUID NOT NULL,
  influencer_id UUID NOT NULL,
  influencer_user_id UUID NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  platform_fee_cents INTEGER NOT NULL CHECK (platform_fee_cents >= 0),
  net_cents INTEGER NOT NULL CHECK (net_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'awaiting_payment'
    CHECK (status IN ('awaiting_payment','held','released','refunded','disputed')),
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  release_note TEXT,
  refund_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaign_escrow_application ON public.campaign_escrow(application_id);
CREATE INDEX IF NOT EXISTS idx_campaign_escrow_brand ON public.campaign_escrow(brand_user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_escrow_influencer ON public.campaign_escrow(influencer_user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_escrow_session ON public.campaign_escrow(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_campaign_escrow_status ON public.campaign_escrow(status);

ALTER TABLE public.campaign_escrow ENABLE ROW LEVEL SECURITY;

-- 3. RLS policies for campaign_escrow.
CREATE POLICY "Brands can view their own escrow"
  ON public.campaign_escrow
  FOR SELECT
  TO authenticated
  USING (brand_user_id = auth.uid());

CREATE POLICY "Influencers can view escrow for their applications"
  ON public.campaign_escrow
  FOR SELECT
  TO authenticated
  USING (influencer_user_id = auth.uid());

CREATE POLICY "Admins can view all escrow"
  ON public.campaign_escrow
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- INSERT/UPDATE/DELETE: only the service role from edge functions (RLS is auto-bypassed).
-- We do NOT add a permissive policy here so any direct REST call from a client is denied.

CREATE TRIGGER trg_campaign_escrow_updated_at
BEFORE UPDATE ON public.campaign_escrow
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Allow the campaign owner (brand) to approve/reject applications on their own campaign.
DROP POLICY IF EXISTS "Brand owners can manage applications on their campaigns"
  ON public.campaign_applications;

CREATE POLICY "Brand owners can manage applications on their campaigns"
  ON public.campaign_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.brand_campaigns bc
      WHERE bc.id = campaign_applications.campaign_id
        AND bc.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.brand_campaigns bc
      WHERE bc.id = campaign_applications.campaign_id
        AND bc.user_id = auth.uid()
    )
  );
