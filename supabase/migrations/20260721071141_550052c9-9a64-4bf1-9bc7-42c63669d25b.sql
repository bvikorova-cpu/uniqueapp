
-- ─── Fan Clubs ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.influencer_fan_clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('bronze','silver','gold')),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  currency TEXT NOT NULL DEFAULT 'eur',
  perks JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  member_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fan_clubs_creator ON public.influencer_fan_clubs(creator_id);

GRANT SELECT ON public.influencer_fan_clubs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.influencer_fan_clubs TO authenticated;
GRANT ALL ON public.influencer_fan_clubs TO service_role;
ALTER TABLE public.influencer_fan_clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active fan clubs"
  ON public.influencer_fan_clubs FOR SELECT
  USING (is_active OR auth.uid() = creator_id);

CREATE POLICY "Creators manage own fan clubs"
  ON public.influencer_fan_clubs FOR ALL
  USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

-- ─── Members ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.influencer_fan_club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_club_id UUID NOT NULL REFERENCES public.influencer_fan_clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','past_due','canceled','expired')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (fan_club_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_fcm_user ON public.influencer_fan_club_members(user_id);
CREATE INDEX IF NOT EXISTS idx_fcm_club ON public.influencer_fan_club_members(fan_club_id);
CREATE INDEX IF NOT EXISTS idx_fcm_status ON public.influencer_fan_club_members(status);

GRANT SELECT ON public.influencer_fan_club_members TO authenticated;
GRANT ALL ON public.influencer_fan_club_members TO service_role;
ALTER TABLE public.influencer_fan_club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own memberships"
  ON public.influencer_fan_club_members FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.influencer_fan_clubs c
      WHERE c.id = fan_club_id AND c.creator_id = auth.uid()
    )
  );

-- ─── Exclusive posts ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.influencer_fan_club_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_club_id UUID NOT NULL REFERENCES public.influencer_fan_clubs(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  media_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fcp_club ON public.influencer_fan_club_posts(fan_club_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.influencer_fan_club_posts TO authenticated;
GRANT ALL ON public.influencer_fan_club_posts TO service_role;
ALTER TABLE public.influencer_fan_club_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators manage own club posts"
  ON public.influencer_fan_club_posts FOR ALL
  USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Active members can view club posts"
  ON public.influencer_fan_club_posts FOR SELECT
  USING (
    auth.uid() = creator_id
    OR EXISTS (
      SELECT 1 FROM public.influencer_fan_club_members m
      WHERE m.fan_club_id = influencer_fan_club_posts.fan_club_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
        AND (m.current_period_end IS NULL OR m.current_period_end > now())
    )
  );

-- ─── updated_at trigger reuse ────────────────────────────────
CREATE OR REPLACE FUNCTION public.tg_fanclub_touch()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_fc_touch ON public.influencer_fan_clubs;
CREATE TRIGGER trg_fc_touch BEFORE UPDATE ON public.influencer_fan_clubs
  FOR EACH ROW EXECUTE FUNCTION public.tg_fanclub_touch();
DROP TRIGGER IF EXISTS trg_fcm_touch ON public.influencer_fan_club_members;
CREATE TRIGGER trg_fcm_touch BEFORE UPDATE ON public.influencer_fan_club_members
  FOR EACH ROW EXECUTE FUNCTION public.tg_fanclub_touch();
DROP TRIGGER IF EXISTS trg_fcp_touch ON public.influencer_fan_club_posts;
CREATE TRIGGER trg_fcp_touch BEFORE UPDATE ON public.influencer_fan_club_posts
  FOR EACH ROW EXECUTE FUNCTION public.tg_fanclub_touch();

-- ─── member_count maintenance ────────────────────────────────
CREATE OR REPLACE FUNCTION public.tg_fanclub_member_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'active')
     OR (TG_OP = 'UPDATE' AND NEW.status = 'active' AND OLD.status <> 'active') THEN
    UPDATE public.influencer_fan_clubs SET member_count = member_count + 1 WHERE id = NEW.fan_club_id;
  ELSIF (TG_OP = 'UPDATE' AND NEW.status <> 'active' AND OLD.status = 'active') THEN
    UPDATE public.influencer_fan_clubs SET member_count = GREATEST(member_count - 1, 0) WHERE id = NEW.fan_club_id;
  ELSIF (TG_OP = 'DELETE' AND OLD.status = 'active') THEN
    UPDATE public.influencer_fan_clubs SET member_count = GREATEST(member_count - 1, 0) WHERE id = OLD.fan_club_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;

DROP TRIGGER IF EXISTS trg_fcm_count ON public.influencer_fan_club_members;
CREATE TRIGGER trg_fcm_count
  AFTER INSERT OR UPDATE OR DELETE ON public.influencer_fan_club_members
  FOR EACH ROW EXECUTE FUNCTION public.tg_fanclub_member_count();
