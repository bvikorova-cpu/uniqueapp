
-- Lesson progress
CREATE TABLE public.education_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_key TEXT NOT NULL,
  lesson_key TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_key, lesson_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_lesson_progress TO authenticated;
GRANT ALL ON public.education_lesson_progress TO service_role;
ALTER TABLE public.education_lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own lesson progress"
  ON public.education_lesson_progress FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_elp_user_course ON public.education_lesson_progress(user_id, course_key);

-- Exercise submissions
CREATE TABLE public.education_exercise_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_key TEXT NOT NULL,
  lesson_key TEXT NOT NULL,
  submission_text TEXT NOT NULL,
  ai_feedback JSONB,
  score INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_key, lesson_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_exercise_submissions TO authenticated;
GRANT ALL ON public.education_exercise_submissions TO service_role;
ALTER TABLE public.education_exercise_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own exercise submissions"
  ON public.education_exercise_submissions FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_ees_user_course ON public.education_exercise_submissions(user_id, course_key);

CREATE OR REPLACE FUNCTION public.education_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER trg_ees_touch BEFORE UPDATE ON public.education_exercise_submissions
  FOR EACH ROW EXECUTE FUNCTION public.education_touch_updated_at();
