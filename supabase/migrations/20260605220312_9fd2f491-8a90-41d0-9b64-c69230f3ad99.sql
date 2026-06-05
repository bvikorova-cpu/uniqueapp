
CREATE TABLE public.dating_filters (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  min_age INT NOT NULL DEFAULT 18 CHECK (min_age >= 18),
  max_age INT NOT NULL DEFAULT 99 CHECK (max_age <= 120),
  max_distance_km INT NOT NULL DEFAULT 100 CHECK (max_distance_km > 0),
  preferred_genders TEXT[] NOT NULL DEFAULT ARRAY['male','female','other'],
  required_interests TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  verified_only BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dating_filters TO authenticated;
GRANT ALL ON public.dating_filters TO service_role;
ALTER TABLE public.dating_filters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all_filters" ON public.dating_filters FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.dating_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  credits_spent INT NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_dating_boosts_expires ON public.dating_boosts (expires_at DESC);
CREATE INDEX idx_dating_boosts_user ON public.dating_boosts (user_id, expires_at DESC);
GRANT SELECT ON public.dating_boosts TO authenticated;
GRANT ALL ON public.dating_boosts TO service_role;
ALTER TABLE public.dating_boosts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_active_boosts" ON public.dating_boosts FOR SELECT TO authenticated USING (expires_at > now() OR user_id = auth.uid());

CREATE TABLE public.dating_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);
CREATE INDEX idx_dating_blocks_blocker ON public.dating_blocks (blocker_id);
CREATE INDEX idx_dating_blocks_blocked ON public.dating_blocks (blocked_id);
GRANT SELECT, INSERT, DELETE ON public.dating_blocks TO authenticated;
GRANT ALL ON public.dating_blocks TO service_role;
ALTER TABLE public.dating_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_manage_blocks" ON public.dating_blocks FOR ALL TO authenticated USING (auth.uid() = blocker_id) WITH CHECK (auth.uid() = blocker_id);

CREATE TABLE public.dating_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','resolved','dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  CHECK (reporter_id <> reported_id)
);
CREATE INDEX idx_dating_reports_status ON public.dating_reports (status, created_at DESC);
CREATE INDEX idx_dating_reports_reported ON public.dating_reports (reported_id);
GRANT SELECT, INSERT ON public.dating_reports TO authenticated;
GRANT ALL ON public.dating_reports TO service_role;
ALTER TABLE public.dating_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reporter_read_own" ON public.dating_reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "reporter_insert_own" ON public.dating_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "admin_update_reports" ON public.dating_reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_dating_filters_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER trg_dating_filters_updated_at BEFORE UPDATE ON public.dating_filters FOR EACH ROW EXECUTE FUNCTION public.update_dating_filters_updated_at();
