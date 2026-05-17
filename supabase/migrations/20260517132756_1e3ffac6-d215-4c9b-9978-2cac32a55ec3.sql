-- Section 6: Student Support — academic verification, scholarships, progress reports

ALTER TABLE public.student_campaigns
  ADD COLUMN IF NOT EXISTS institution_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS enrollment_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS enrollment_doc_url text,
  ADD COLUMN IF NOT EXISTS verifier_name text,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS current_gpa numeric(3,2),
  ADD COLUMN IF NOT EXISTS expected_graduation date,
  ADD COLUMN IF NOT EXISTS open_to_scholarship_match boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS scholarship_tags text[] NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS public.student_progress_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.student_campaigns(id) ON DELETE CASCADE,
  author_user_id uuid NOT NULL,
  semester text NOT NULL,
  gpa numeric(3,2),
  courses_completed integer,
  achievements text,
  transcript_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_student_reports_campaign ON public.student_progress_reports(campaign_id, created_at DESC);
ALTER TABLE public.student_progress_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view student reports" ON public.student_progress_reports;
CREATE POLICY "Anyone can view student reports" ON public.student_progress_reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owner can insert student reports" ON public.student_progress_reports;
CREATE POLICY "Owner can insert student reports" ON public.student_progress_reports FOR INSERT
  WITH CHECK (auth.uid() = author_user_id AND EXISTS (
    SELECT 1 FROM public.student_campaigns c WHERE c.id = campaign_id AND c.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Owner can update student reports" ON public.student_progress_reports;
CREATE POLICY "Owner can update student reports" ON public.student_progress_reports FOR UPDATE
  USING (auth.uid() = author_user_id);

DROP POLICY IF EXISTS "Owner can delete student reports" ON public.student_progress_reports;
CREATE POLICY "Owner can delete student reports" ON public.student_progress_reports FOR DELETE
  USING (auth.uid() = author_user_id);
