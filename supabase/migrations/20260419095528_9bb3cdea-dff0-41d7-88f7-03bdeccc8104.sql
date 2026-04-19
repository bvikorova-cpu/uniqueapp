-- =========================================================
-- COUPLES SUBSCRIPTION (€14.99/mo for 2 partners)
-- =========================================================
CREATE TABLE public.couples_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_a_user_id UUID NOT NULL,
  partner_b_user_id UUID,
  partner_b_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  invite_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  started_at TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.couples_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can read their couples sub"
  ON public.couples_subscriptions FOR SELECT
  USING (auth.uid() = partner_a_user_id OR auth.uid() = partner_b_user_id);

CREATE POLICY "Partner A can insert"
  ON public.couples_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = partner_a_user_id);

CREATE POLICY "Partner A can update their sub"
  ON public.couples_subscriptions FOR UPDATE
  USING (auth.uid() = partner_a_user_id);

-- =========================================================
-- COUPLES COMPATIBILITY TIMELINE
-- =========================================================
CREATE TABLE public.couples_compatibility_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couples_subscription_id UUID NOT NULL REFERENCES public.couples_subscriptions(id) ON DELETE CASCADE,
  compatibility_score INT NOT NULL,
  mood_trend JSONB DEFAULT '{}'::jsonb,
  full_analysis JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.couples_compatibility_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can read their timeline"
  ON public.couples_compatibility_timeline FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.couples_subscriptions cs
      WHERE cs.id = couples_compatibility_timeline.couples_subscription_id
      AND (cs.partner_a_user_id = auth.uid() OR cs.partner_b_user_id = auth.uid())
    )
  );

CREATE POLICY "System can insert timeline rows"
  ON public.couples_compatibility_timeline FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_couples_timeline_sub ON public.couples_compatibility_timeline(couples_subscription_id, recorded_at DESC);

-- =========================================================
-- HR PRO SUBSCRIPTION (€99/mo)
-- =========================================================
CREATE TABLE public.hr_pro_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  org_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  monthly_candidate_quota INT NOT NULL DEFAULT 500,
  monthly_candidates_used INT NOT NULL DEFAULT 0,
  quota_reset_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hr_pro_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage their HR sub"
  ON public.hr_pro_subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- HR BULK JOBS
-- =========================================================
CREATE TABLE public.hr_bulk_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  org_subscription_id UUID REFERENCES public.hr_pro_subscriptions(id) ON DELETE SET NULL,
  job_title TEXT NOT NULL,
  job_description TEXT,
  required_traits TEXT[],
  total_candidates INT NOT NULL DEFAULT 0,
  completed_candidates INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'queued',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hr_bulk_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage bulk jobs"
  ON public.hr_bulk_jobs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_hr_bulk_jobs_user ON public.hr_bulk_jobs(user_id, created_at DESC);

-- =========================================================
-- HR BULK CANDIDATES
-- =========================================================
CREATE TABLE public.hr_bulk_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bulk_job_id UUID NOT NULL REFERENCES public.hr_bulk_jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  candidate_alias TEXT NOT NULL,
  image_url TEXT NOT NULL,
  leadership_score INT,
  communication_score INT,
  attention_score INT,
  integrity_score INT,
  overall_fit INT,
  ai_summary TEXT,
  ats_export_data JSONB DEFAULT '{}'::jsonb,
  credits_used INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'queued',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE public.hr_bulk_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage candidates"
  ON public.hr_bulk_candidates FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_hr_bulk_candidates_job ON public.hr_bulk_candidates(bulk_job_id);

-- =========================================================
-- VOICE DIARIES (combined voice + handwriting fingerprint)
-- =========================================================
CREATE TABLE public.voice_diaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  handwriting_image_url TEXT NOT NULL,
  voice_transcript TEXT NOT NULL,
  voice_duration_sec INT NOT NULL DEFAULT 0,
  mood_score INT,
  energy_score INT,
  congruence_score INT,
  emotional_fingerprint JSONB DEFAULT '{}'::jsonb,
  ai_analysis JSONB DEFAULT '{}'::jsonb,
  ai_summary TEXT,
  credits_used INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.voice_diaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own voice diaries"
  ON public.voice_diaries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_voice_diaries_user ON public.voice_diaries(user_id, created_at DESC);

-- =========================================================
-- updated_at triggers
-- =========================================================
CREATE OR REPLACE FUNCTION public.handwriting_pro_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_couples_subs_updated
  BEFORE UPDATE ON public.couples_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handwriting_pro_set_updated_at();

CREATE TRIGGER trg_hr_pro_subs_updated
  BEFORE UPDATE ON public.hr_pro_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handwriting_pro_set_updated_at();

CREATE TRIGGER trg_hr_bulk_jobs_updated
  BEFORE UPDATE ON public.hr_bulk_jobs
  FOR EACH ROW EXECUTE FUNCTION public.handwriting_pro_set_updated_at();