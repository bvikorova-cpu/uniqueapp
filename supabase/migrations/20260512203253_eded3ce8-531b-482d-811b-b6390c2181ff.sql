-- Endorsements
CREATE TABLE public.endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endorsed_user_id uuid NOT NULL,
  endorser_id uuid NOT NULL,
  skill text NOT NULL,
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(endorsed_user_id, endorser_id, skill)
);
ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "endorsements_public_read" ON public.endorsements FOR SELECT USING (true);
CREATE POLICY "endorsements_self_insert" ON public.endorsements FOR INSERT WITH CHECK (auth.uid() = endorser_id AND auth.uid() <> endorsed_user_id);
CREATE POLICY "endorsements_self_delete" ON public.endorsements FOR DELETE USING (auth.uid() = endorser_id);
CREATE INDEX idx_endorsements_user ON public.endorsements(endorsed_user_id);

-- CSAT ratings (linked to support tickets/chat)
CREATE TABLE public.csat_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ticket_id text,
  channel text NOT NULL DEFAULT 'live_chat',
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.csat_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "csat_self_insert" ON public.csat_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "csat_self_read" ON public.csat_ratings FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_csat_user ON public.csat_ratings(user_id, created_at DESC);

-- Admin impersonation sessions (auditable)
CREATE TABLE public.admin_impersonation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  reason text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  ip_address text
);
ALTER TABLE public.admin_impersonation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "impersonation_admin_only" ON public.admin_impersonation_sessions FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_impersonation_admin ON public.admin_impersonation_sessions(admin_id, started_at DESC);