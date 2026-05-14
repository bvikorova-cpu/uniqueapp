
-- Saved jobs (bookmarks)
CREATE TABLE public.saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  job_id uuid NOT NULL REFERENCES public.job_listings(id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, job_id)
);
CREATE INDEX idx_saved_jobs_user ON public.saved_jobs(user_id, created_at DESC);
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saved jobs select" ON public.saved_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own saved jobs insert" ON public.saved_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own saved jobs update" ON public.saved_jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own saved jobs delete" ON public.saved_jobs FOR DELETE USING (auth.uid() = user_id);

-- Candidate resumes (CV upload + parsed data)
CREATE TABLE public.candidate_resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  parsed_skills text[] DEFAULT '{}',
  parsed_experience jsonb DEFAULT '[]'::jsonb,
  parsed_education jsonb DEFAULT '[]'::jsonb,
  parsed_summary text,
  parsed_full_text text,
  years_experience integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_candidate_resumes_user ON public.candidate_resumes(user_id);
ALTER TABLE public.candidate_resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own resumes select" ON public.candidate_resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own resumes insert" ON public.candidate_resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own resumes update" ON public.candidate_resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own resumes delete" ON public.candidate_resumes FOR DELETE USING (auth.uid() = user_id);

-- Cover letters (AI generated / manual)
CREATE TABLE public.cover_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  job_id uuid REFERENCES public.job_listings(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text NOT NULL,
  is_ai_generated boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cover_letters_user ON public.cover_letters(user_id, created_at DESC);
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cl select" ON public.cover_letters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own cl insert" ON public.cover_letters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own cl update" ON public.cover_letters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own cl delete" ON public.cover_letters FOR DELETE USING (auth.uid() = user_id);

-- Job match scores (cached)
CREATE TABLE public.job_match_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  job_id uuid NOT NULL REFERENCES public.job_listings(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  reasons jsonb DEFAULT '[]'::jsonb,
  computed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, job_id)
);
CREATE INDEX idx_match_scores_user_score ON public.job_match_scores(user_id, score DESC);
ALTER TABLE public.job_match_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own match select" ON public.job_match_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own match insert" ON public.job_match_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own match update" ON public.job_match_scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own match delete" ON public.job_match_scores FOR DELETE USING (auth.uid() = user_id);

-- Job alert matches (for notifications history)
CREATE TABLE public.job_alert_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  job_id uuid NOT NULL REFERENCES public.job_listings(id) ON DELETE CASCADE,
  notified_at timestamptz NOT NULL DEFAULT now(),
  is_read boolean NOT NULL DEFAULT false,
  UNIQUE(user_id, job_id)
);
CREATE INDEX idx_alert_matches_user ON public.job_alert_matches(user_id, notified_at DESC);
ALTER TABLE public.job_alert_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own alerts select" ON public.job_alert_matches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own alerts update" ON public.job_alert_matches FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own alerts insert" ON public.job_alert_matches FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Application status log (timeline)
CREATE TABLE public.application_status_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  status text NOT NULL,
  note text,
  changed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_status_log_app ON public.application_status_log(application_id, created_at DESC);
ALTER TABLE public.application_status_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view app status log" ON public.application_status_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.job_applications a
      LEFT JOIN public.job_listings j ON j.id = a.job_id
      WHERE a.id = application_status_log.application_id
        AND (a.applicant_id = auth.uid() OR j.employer_id = auth.uid())
    )
  );
CREATE POLICY "insert app status log employer" ON public.application_status_log FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.job_applications a
      JOIN public.job_listings j ON j.id = a.job_id
      WHERE a.id = application_status_log.application_id
        AND j.employer_id = auth.uid()
    )
  );

-- Storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own resumes" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users read own resumes" ON storage.objects FOR SELECT
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own resumes" ON storage.objects FOR DELETE
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
