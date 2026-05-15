CREATE TABLE public.job_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  referrer_id UUID NOT NULL,
  referred_user_id UUID,
  referred_email TEXT,
  referred_name TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  bonus_amount NUMERIC DEFAULT 0,
  bonus_paid BOOLEAN DEFAULT false,
  hired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.job_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referrer view own" ON public.job_referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);
CREATE POLICY "employer view referrals" ON public.job_referrals FOR SELECT USING (EXISTS (SELECT 1 FROM public.job_listings j WHERE j.id = job_id AND j.employer_id = auth.uid()));
CREATE POLICY "users create referrals" ON public.job_referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);
CREATE POLICY "employer update referral" ON public.job_referrals FOR UPDATE USING (EXISTS (SELECT 1 FROM public.job_listings j WHERE j.id = job_id AND j.employer_id = auth.uid()));

CREATE TABLE public.skill_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  skill TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  passing_score INTEGER NOT NULL DEFAULT 70,
  time_limit_minutes INTEGER DEFAULT 30,
  difficulty TEXT DEFAULT 'medium',
  created_by UUID,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.skill_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view assessments" ON public.skill_assessments FOR SELECT USING (is_public = true OR auth.uid() = created_by);
CREATE POLICY "create assessments" ON public.skill_assessments FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "owner update" ON public.skill_assessments FOR UPDATE USING (auth.uid() = created_by);

CREATE TABLE public.skill_assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.skill_assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  answers JSONB DEFAULT '[]'::jsonb,
  passed BOOLEAN DEFAULT false,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.skill_assessment_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user own attempts" ON public.skill_assessment_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner views attempts" ON public.skill_assessment_attempts FOR SELECT USING (EXISTS (SELECT 1 FROM public.skill_assessments a WHERE a.id = assessment_id AND a.created_by = auth.uid()));
CREATE POLICY "user creates attempt" ON public.skill_assessment_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.career_path_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role_title TEXT NOT NULL,
  target_date DATE,
  order_index INTEGER NOT NULL DEFAULT 0,
  skills_required TEXT[] DEFAULT ARRAY[]::TEXT[],
  resources JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.career_path_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "career owner" ON public.career_path_nodes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.mock_interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  interview_type TEXT NOT NULL DEFAULT 'behavioral',
  difficulty TEXT DEFAULT 'medium',
  transcript JSONB DEFAULT '[]'::jsonb,
  score INTEGER,
  feedback TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mock_interview_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mock owner" ON public.mock_interview_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_referrals_job ON public.job_referrals(job_id);
CREATE INDEX idx_attempts_user ON public.skill_assessment_attempts(user_id);
CREATE INDEX idx_career_user ON public.career_path_nodes(user_id, order_index);
CREATE INDEX idx_mock_user ON public.mock_interview_sessions(user_id, created_at DESC);