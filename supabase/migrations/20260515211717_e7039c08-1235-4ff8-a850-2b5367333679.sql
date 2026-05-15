
CREATE TABLE public.megatalent_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  tipper_id UUID,
  category_slug TEXT,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 100),
  platform_fee_cents INTEGER NOT NULL DEFAULT 0,
  creator_amount_cents INTEGER NOT NULL DEFAULT 0,
  message TEXT,
  stripe_session_id TEXT UNIQUE,
  stripe_transfer_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
  payout_status TEXT NOT NULL DEFAULT 'pending' CHECK (payout_status IN ('pending','paid','held','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

CREATE INDEX idx_mt_tips_creator ON public.megatalent_tips(creator_id, status, created_at DESC);
CREATE INDEX idx_mt_tips_tipper ON public.megatalent_tips(tipper_id, created_at DESC);
CREATE INDEX idx_mt_tips_payout ON public.megatalent_tips(creator_id, payout_status) WHERE status='completed';

ALTER TABLE public.megatalent_tips ENABLE ROW LEVEL SECURITY;

-- Public can see completed tips for a creator (for fan-facing widgets)
CREATE POLICY "Public sees completed megatalent tips"
ON public.megatalent_tips FOR SELECT
USING (status = 'completed');

-- Tipper sees own tips (any status)
CREATE POLICY "Tipper sees own megatalent tips"
ON public.megatalent_tips FOR SELECT
USING (auth.uid() = tipper_id);

-- Creator sees all tips received
CREATE POLICY "Creator sees own received megatalent tips"
ON public.megatalent_tips FOR SELECT
USING (auth.uid() = creator_id);

-- Admin full access
CREATE POLICY "Admins manage megatalent tips"
ON public.megatalent_tips FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Aggregate helper for creator stats (public)
CREATE OR REPLACE FUNCTION public.get_megatalent_tip_stats(_creator_id UUID)
RETURNS TABLE(total_tips BIGINT, total_amount_cents BIGINT, last_tip_at TIMESTAMPTZ)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::BIGINT,
         COALESCE(SUM(amount_cents), 0)::BIGINT,
         MAX(completed_at)
  FROM public.megatalent_tips
  WHERE creator_id = _creator_id AND status = 'completed';
$$;
