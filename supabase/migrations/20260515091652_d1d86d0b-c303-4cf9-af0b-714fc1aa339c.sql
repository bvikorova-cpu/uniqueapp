-- Batch 6: Video resumes, Diversity reporting, Salary transparency, Job boost/promote

CREATE TABLE public.video_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title TEXT,
  duration_seconds INT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.video_resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manage video resumes" ON public.video_resumes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "public video resumes viewable" ON public.video_resumes FOR SELECT USING (is_public = true);

CREATE TABLE public.diversity_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL,
  job_id UUID,
  report_period TEXT NOT NULL,
  total_applicants INT NOT NULL DEFAULT 0,
  gender_breakdown JSONB DEFAULT '{}'::jsonb,
  ethnicity_breakdown JSONB DEFAULT '{}'::jsonb,
  age_breakdown JSONB DEFAULT '{}'::jsonb,
  hired_breakdown JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.diversity_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employers manage own diversity" ON public.diversity_reports FOR ALL USING (auth.uid() = employer_id) WITH CHECK (auth.uid() = employer_id);

CREATE TABLE public.diversity_self_id (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  gender TEXT,
  ethnicity TEXT,
  age_range TEXT,
  veteran_status TEXT,
  disability_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.diversity_self_id ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manage self id" ON public.diversity_self_id FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.job_listings 
  ADD COLUMN IF NOT EXISTS salary_transparency_score INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pay_range_disclosed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS equity_range TEXT,
  ADD COLUMN IF NOT EXISTS bonus_structure TEXT,
  ADD COLUMN IF NOT EXISTS boost_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS boost_tier TEXT,
  ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;

CREATE TABLE public.job_boost_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  employer_id UUID NOT NULL,
  boost_tier TEXT NOT NULL,
  duration_days INT NOT NULL,
  amount_eur NUMERIC NOT NULL,
  stripe_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.job_boost_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employer view own boosts" ON public.job_boost_purchases FOR SELECT USING (auth.uid() = employer_id);
CREATE POLICY "employer create own boosts" ON public.job_boost_purchases FOR INSERT WITH CHECK (auth.uid() = employer_id);

CREATE INDEX IF NOT EXISTS idx_jobs_boost_until ON public.job_listings(boost_until DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_jobs_featured_until ON public.job_listings(featured_until DESC NULLS LAST);

INSERT INTO storage.buckets (id, name, public) VALUES ('video-resumes', 'video-resumes', true) ON CONFLICT DO NOTHING;
CREATE POLICY "video resume read" ON storage.objects FOR SELECT USING (bucket_id = 'video-resumes');
CREATE POLICY "video resume own upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'video-resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "video resume own update" ON storage.objects FOR UPDATE USING (bucket_id = 'video-resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "video resume own delete" ON storage.objects FOR DELETE USING (bucket_id = 'video-resumes' AND auth.uid()::text = (storage.foldername(name))[1]);