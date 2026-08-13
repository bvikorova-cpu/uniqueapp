CREATE TABLE public.face_insight_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mode TEXT NOT NULL DEFAULT 'basic',
  credits_used INTEGER NOT NULL DEFAULT 0,
  headline TEXT,
  summary TEXT,
  report TEXT,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  traits JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_comparison BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.face_insight_reports TO authenticated;
GRANT ALL ON public.face_insight_reports TO service_role;

ALTER TABLE public.face_insight_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own face reports"
ON public.face_insight_reports FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users create own face reports"
ON public.face_insight_reports FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own face reports"
ON public.face_insight_reports FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_face_insight_reports_user_created
ON public.face_insight_reports (user_id, created_at DESC);