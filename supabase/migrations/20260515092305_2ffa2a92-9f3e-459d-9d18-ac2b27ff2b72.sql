CREATE TABLE public.background_check_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL,
  candidate_id UUID NOT NULL,
  job_id UUID,
  check_types TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_at TIMESTAMPTZ,
  vendor TEXT,
  vendor_ref TEXT,
  result_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.background_check_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bg employer manage" ON public.background_check_requests FOR ALL USING (auth.uid() = employer_id) WITH CHECK (auth.uid() = employer_id);
CREATE POLICY "bg candidate view" ON public.background_check_requests FOR SELECT USING (auth.uid() = candidate_id);
CREATE POLICY "bg candidate consent" ON public.background_check_requests FOR UPDATE USING (auth.uid() = candidate_id) WITH CHECK (auth.uid() = candidate_id);

CREATE TABLE public.reference_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL,
  ref_name TEXT NOT NULL,
  ref_email TEXT NOT NULL,
  ref_phone TEXT,
  relationship TEXT,
  company TEXT,
  contacted BOOLEAN NOT NULL DEFAULT false,
  contacted_at TIMESTAMPTZ,
  feedback TEXT,
  rating INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reference_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ref candidate manage" ON public.reference_checks FOR ALL USING (auth.uid() = candidate_id) WITH CHECK (auth.uid() = candidate_id);

CREATE TABLE public.onboarding_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.onboarding_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "onb tpl employer manage" ON public.onboarding_templates FOR ALL USING (auth.uid() = employer_id) WITH CHECK (auth.uid() = employer_id);

CREATE TABLE public.onboarding_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.onboarding_templates(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL,
  hire_id UUID NOT NULL,
  job_id UUID,
  status TEXT NOT NULL DEFAULT 'in_progress',
  task_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  start_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.onboarding_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "onb run employer manage" ON public.onboarding_runs FOR ALL USING (auth.uid() = employer_id) WITH CHECK (auth.uid() = employer_id);
CREATE POLICY "onb run hire view" ON public.onboarding_runs FOR SELECT USING (auth.uid() = hire_id);
CREATE POLICY "onb run hire update tasks" ON public.onboarding_runs FOR UPDATE USING (auth.uid() = hire_id) WITH CHECK (auth.uid() = hire_id);

CREATE TABLE public.ai_job_description_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT,
  prompt TEXT,
  result TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_job_description_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jd draft owner" ON public.ai_job_description_drafts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);