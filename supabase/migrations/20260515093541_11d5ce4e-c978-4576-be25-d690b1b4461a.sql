
-- Job posting templates
CREATE TABLE public.job_posting_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  benefits TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_public BOOLEAN NOT NULL DEFAULT false,
  use_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.job_posting_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employers manage own templates" ON public.job_posting_templates
  FOR ALL USING (auth.uid() = employer_id) WITH CHECK (auth.uid() = employer_id);
CREATE POLICY "Public templates are viewable" ON public.job_posting_templates
  FOR SELECT USING (is_public = true);

-- Bulk hiring campaigns
CREATE TABLE public.bulk_hiring_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL,
  name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  target_hires INTEGER NOT NULL DEFAULT 1,
  hired_count INTEGER NOT NULL DEFAULT 0,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'active',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bulk_hiring_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employers manage own bulk campaigns" ON public.bulk_hiring_campaigns
  FOR ALL USING (auth.uid() = employer_id) WITH CHECK (auth.uid() = employer_id);

CREATE TABLE public.bulk_hiring_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.bulk_hiring_campaigns(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL,
  stage TEXT NOT NULL DEFAULT 'sourced',
  notes TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bulk_hiring_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Campaign owners manage candidates" ON public.bulk_hiring_candidates
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.bulk_hiring_campaigns c
    WHERE c.id = campaign_id AND c.employer_id = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM public.bulk_hiring_campaigns c
    WHERE c.id = campaign_id AND c.employer_id = auth.uid()
  ));

-- Headhunter marketplace
CREATE TABLE public.headhunter_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT,
  specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
  fee_percent NUMERIC(5,2) NOT NULL DEFAULT 15.0,
  hourly_rate_eur NUMERIC(10,2),
  rating NUMERIC(3,2) DEFAULT 0,
  placements_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.headhunter_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active headhunters publicly viewable" ON public.headhunter_profiles
  FOR SELECT USING (is_active = true);
CREATE POLICY "Headhunters manage own profile" ON public.headhunter_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.headhunter_engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL,
  headhunter_id UUID NOT NULL,
  job_id UUID,
  fee_percent NUMERIC(5,2) NOT NULL,
  agreed_amount_eur NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.headhunter_engagements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parties view own engagements" ON public.headhunter_engagements
  FOR SELECT USING (auth.uid() = employer_id OR auth.uid() = headhunter_id);
CREATE POLICY "Employers create engagements" ON public.headhunter_engagements
  FOR INSERT WITH CHECK (auth.uid() = employer_id);
CREATE POLICY "Parties update own engagements" ON public.headhunter_engagements
  FOR UPDATE USING (auth.uid() = employer_id OR auth.uid() = headhunter_id);

-- AI candidate rankings
CREATE TABLE public.ai_candidate_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  application_id UUID,
  candidate_id UUID NOT NULL,
  employer_id UUID NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  rank_position INTEGER,
  reasoning TEXT,
  strengths TEXT[],
  concerns TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_candidate_rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employers view own rankings" ON public.ai_candidate_rankings
  FOR SELECT USING (auth.uid() = employer_id);
CREATE POLICY "Employers manage own rankings" ON public.ai_candidate_rankings
  FOR ALL USING (auth.uid() = employer_id) WITH CHECK (auth.uid() = employer_id);

-- Triggers
CREATE TRIGGER tr_job_posting_templates_updated BEFORE UPDATE ON public.job_posting_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_bulk_hiring_campaigns_updated BEFORE UPDATE ON public.bulk_hiring_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_headhunter_profiles_updated BEFORE UPDATE ON public.headhunter_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_headhunter_engagements_updated BEFORE UPDATE ON public.headhunter_engagements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_jpt_employer ON public.job_posting_templates(employer_id);
CREATE INDEX idx_bhc_employer ON public.bulk_hiring_campaigns(employer_id);
CREATE INDEX idx_bhcand_campaign ON public.bulk_hiring_candidates(campaign_id);
CREATE INDEX idx_he_employer ON public.headhunter_engagements(employer_id);
CREATE INDEX idx_he_headhunter ON public.headhunter_engagements(headhunter_id);
CREATE INDEX idx_acr_job ON public.ai_candidate_rankings(job_id);
CREATE INDEX idx_acr_employer ON public.ai_candidate_rankings(employer_id);
