
CREATE TABLE public.dating_weekly_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  prev_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_summary TEXT,
  tips JSONB NOT NULL DEFAULT '[]'::jsonb,
  seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);

GRANT SELECT, UPDATE ON public.dating_weekly_insights TO authenticated;
GRANT ALL ON public.dating_weekly_insights TO service_role;

ALTER TABLE public.dating_weekly_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own insights" ON public.dating_weekly_insights
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users mark seen" ON public.dating_weekly_insights
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_dwi_user_week ON public.dating_weekly_insights (user_id, week_start DESC);
