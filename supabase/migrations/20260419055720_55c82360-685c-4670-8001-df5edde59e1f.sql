
-- Signature analyses
CREATE TABLE public.handwriting_signature_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  ego_score INT,
  confidence_score INT,
  public_persona TEXT,
  authenticity_score INT,
  analysis JSONB,
  credits_used INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.handwriting_signature_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own signatures select" ON public.handwriting_signature_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own signatures insert" ON public.handwriting_signature_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own signatures delete" ON public.handwriting_signature_analyses FOR DELETE USING (auth.uid() = user_id);

-- Compatibility matches
CREATE TABLE public.handwriting_compatibility_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_a_url TEXT NOT NULL,
  image_b_url TEXT NOT NULL,
  context TEXT NOT NULL DEFAULT 'romantic',
  compatibility_score INT,
  dynamics JSONB,
  strengths TEXT[],
  challenges TEXT[],
  full_report TEXT,
  credits_used INT NOT NULL DEFAULT 12,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.handwriting_compatibility_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own compat select" ON public.handwriting_compatibility_matches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own compat insert" ON public.handwriting_compatibility_matches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own compat delete" ON public.handwriting_compatibility_matches FOR DELETE USING (auth.uid() = user_id);

-- Mood & stress tracker
CREATE TABLE public.handwriting_mood_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  scan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood_score INT,
  stress_score INT,
  energy_score INT,
  focus_score INT,
  notes TEXT,
  ai_insight TEXT,
  credits_used INT NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.handwriting_mood_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own mood select" ON public.handwriting_mood_scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own mood insert" ON public.handwriting_mood_scans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own mood delete" ON public.handwriting_mood_scans FOR DELETE USING (auth.uid() = user_id);

-- Forgery detection
CREATE TABLE public.handwriting_forgery_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reference_url TEXT NOT NULL,
  suspect_url TEXT NOT NULL,
  authenticity_probability INT,
  forgery_probability INT,
  verdict TEXT,
  red_flags JSONB,
  matching_traits JSONB,
  detailed_report TEXT,
  credits_used INT NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.handwriting_forgery_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own forgery select" ON public.handwriting_forgery_checks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own forgery insert" ON public.handwriting_forgery_checks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own forgery delete" ON public.handwriting_forgery_checks FOR DELETE USING (auth.uid() = user_id);

-- Academy progress
CREATE TABLE public.handwriting_academy_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  quiz_score INT,
  xp_earned INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
ALTER TABLE public.handwriting_academy_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own academy select" ON public.handwriting_academy_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own academy insert" ON public.handwriting_academy_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own academy update" ON public.handwriting_academy_progress FOR UPDATE USING (auth.uid() = user_id);

-- Twin finder profiles + matches
CREATE TABLE public.handwriting_twin_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  sample_url TEXT NOT NULL,
  trait_vector JSONB NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.handwriting_twin_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "twin public read" ON public.handwriting_twin_profiles FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "own twin insert" ON public.handwriting_twin_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own twin update" ON public.handwriting_twin_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own twin delete" ON public.handwriting_twin_profiles FOR DELETE USING (auth.uid() = user_id);

-- Famous comparison
CREATE TABLE public.handwriting_famous_comparisons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  matched_figure TEXT NOT NULL,
  match_score INT,
  shared_traits TEXT[],
  ai_blurb TEXT,
  credits_used INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.handwriting_famous_comparisons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own famous select" ON public.handwriting_famous_comparisons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own famous insert" ON public.handwriting_famous_comparisons FOR INSERT WITH CHECK (auth.uid() = user_id);

-- PDF reports
CREATE TABLE public.handwriting_pdf_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_analysis_id UUID,
  report_url TEXT,
  report_type TEXT NOT NULL DEFAULT 'forensic',
  watermark TEXT,
  credits_used INT NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.handwriting_pdf_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pdf select" ON public.handwriting_pdf_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own pdf insert" ON public.handwriting_pdf_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_hw_mood_user_date ON public.handwriting_mood_scans (user_id, scan_date DESC);
CREATE INDEX idx_hw_signature_user ON public.handwriting_signature_analyses (user_id, created_at DESC);
CREATE INDEX idx_hw_compat_user ON public.handwriting_compatibility_matches (user_id, created_at DESC);
CREATE INDEX idx_hw_forgery_user ON public.handwriting_forgery_checks (user_id, created_at DESC);
CREATE INDEX idx_hw_twin_public ON public.handwriting_twin_profiles (is_public);
