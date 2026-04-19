CREATE TABLE IF NOT EXISTS public.anonymous_date_ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  match_id UUID,
  feature_type TEXT NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 0,
  input_data JSONB,
  output_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_anon_ai_usage_user ON public.anonymous_date_ai_usage(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anon_ai_usage_feature ON public.anonymous_date_ai_usage(feature_type);

ALTER TABLE public.anonymous_date_ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own AI usage"
ON public.anonymous_date_ai_usage
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System inserts AI usage"
ON public.anonymous_date_ai_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);