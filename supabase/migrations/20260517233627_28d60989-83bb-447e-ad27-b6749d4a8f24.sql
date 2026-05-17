
-- Anonymous Date Parity Pack: 8 new tables
CREATE TABLE public.anon_date_vibe_decoder (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  match_id UUID,
  vibe_label TEXT NOT NULL,
  vibe_score INT NOT NULL DEFAULT 0,
  energy JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.anon_date_vibe_decoder ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all_vibe" ON public.anon_date_vibe_decoder FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

CREATE TABLE public.anon_date_chemistry_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  match_id UUID,
  chemistry_score INT NOT NULL DEFAULT 0,
  emotional INT, intellectual INT, playful INT, romantic INT,
  summary TEXT,
  growth_areas JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.anon_date_chemistry_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all_chem" ON public.anon_date_chemistry_reports FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

CREATE TABLE public.anon_date_red_flag_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  match_id UUID,
  risk_level TEXT NOT NULL DEFAULT 'low',
  flags JSONB DEFAULT '[]'::jsonb,
  green_flags JSONB DEFAULT '[]'::jsonb,
  advice TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.anon_date_red_flag_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all_rfs" ON public.anon_date_red_flag_scans FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

CREATE TABLE public.anon_date_reveal_readiness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  match_id UUID,
  readiness_score INT NOT NULL DEFAULT 0,
  signals JSONB DEFAULT '{}'::jsonb,
  recommendation TEXT,
  recommended_reveal_day INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.anon_date_reveal_readiness ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all_rev" ON public.anon_date_reveal_readiness FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

CREATE TABLE public.anon_date_first_meet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  match_id UUID,
  city TEXT,
  vibe TEXT,
  plan JSONB DEFAULT '{}'::jsonb,
  backup_plan JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.anon_date_first_meet_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all_fmp" ON public.anon_date_first_meet_plans FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

CREATE TABLE public.anon_date_attachment_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  primary_style TEXT NOT NULL,
  secondary_style TEXT,
  scores JSONB DEFAULT '{}'::jsonb,
  insights TEXT,
  partner_advice TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.anon_date_attachment_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all_att" ON public.anon_date_attachment_profiles FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

CREATE TABLE public.anon_date_chat_translator (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  match_id UUID,
  original_message TEXT NOT NULL,
  literal_meaning TEXT,
  hidden_meaning TEXT,
  emotional_subtext TEXT,
  suggested_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.anon_date_chat_translator ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all_xlate" ON public.anon_date_chat_translator FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

CREATE TABLE public.anon_date_breakup_recovery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  match_id UUID,
  stage TEXT,
  recovery_score INT NOT NULL DEFAULT 0,
  daily_plan JSONB DEFAULT '[]'::jsonb,
  affirmation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.anon_date_breakup_recovery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all_brk" ON public.anon_date_breakup_recovery FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

CREATE INDEX idx_vibe_user ON public.anon_date_vibe_decoder(user_id, created_at DESC);
CREATE INDEX idx_chem_user ON public.anon_date_chemistry_reports(user_id, created_at DESC);
CREATE INDEX idx_rfs_user ON public.anon_date_red_flag_scans(user_id, created_at DESC);
CREATE INDEX idx_rev_user ON public.anon_date_reveal_readiness(user_id, created_at DESC);
CREATE INDEX idx_fmp_user ON public.anon_date_first_meet_plans(user_id, created_at DESC);
CREATE INDEX idx_att_user ON public.anon_date_attachment_profiles(user_id, created_at DESC);
CREATE INDEX idx_xlate_user ON public.anon_date_chat_translator(user_id, created_at DESC);
CREATE INDEX idx_brk_user ON public.anon_date_breakup_recovery(user_id, created_at DESC);
