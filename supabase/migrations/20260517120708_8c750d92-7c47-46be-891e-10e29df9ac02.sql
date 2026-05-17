
ALTER TABLE public.dream_campaigns
  ADD COLUMN IF NOT EXISTS reward_tiers jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS stretch_goals jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS funding_mode text NOT NULL DEFAULT 'keep_it_all',
  ADD COLUMN IF NOT EXISTS backers_count integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.dream_campaign_backers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.dream_campaigns(id) ON DELETE CASCADE,
  user_id uuid,
  donor_email text,
  donor_name text,
  amount numeric NOT NULL,
  reward_tier_id text,
  reward_tier_label text,
  shipping_address jsonb,
  fulfillment_status text NOT NULL DEFAULT 'pending',
  message text,
  is_anonymous boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dream_backers_campaign ON public.dream_campaign_backers(campaign_id);
CREATE INDEX IF NOT EXISTS idx_dream_backers_user ON public.dream_campaign_backers(user_id);

ALTER TABLE public.dream_campaign_backers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Backers viewable by campaign owner or self" ON public.dream_campaign_backers;
CREATE POLICY "Backers viewable by campaign owner or self"
ON public.dream_campaign_backers
FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM public.dream_campaigns dc WHERE dc.id = campaign_id AND dc.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can create their own backer record" ON public.dream_campaign_backers;
CREATE POLICY "Users can create their own backer record"
ON public.dream_campaign_backers
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Owner can update fulfillment" ON public.dream_campaign_backers;
CREATE POLICY "Owner can update fulfillment"
ON public.dream_campaign_backers
FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.dream_campaigns dc WHERE dc.id = campaign_id AND dc.user_id = auth.uid())
);
