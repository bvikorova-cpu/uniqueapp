-- New tables for advanced Lie Detector features

-- Voice lie detection analyses
CREATE TABLE IF NOT EXISTS public.lie_detector_voice_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  audio_url TEXT,
  transcript TEXT,
  duration_sec NUMERIC,
  stress_score NUMERIC,
  hesitation_score NUMERIC,
  truthfulness_score NUMERIC,
  results JSONB,
  credits_used INT NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lie_detector_voice_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own voice analyses" ON public.lie_detector_voice_analyses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own voice analyses" ON public.lie_detector_voice_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own voice analyses" ON public.lie_detector_voice_analyses
  FOR DELETE USING (auth.uid() = user_id);

-- Screenshot / DM forensics
CREATE TABLE IF NOT EXISTS public.lie_detector_screenshot_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  extracted_text TEXT,
  truthfulness_score NUMERIC,
  suggested_response TEXT,
  results JSONB,
  credits_used INT NOT NULL DEFAULT 8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lie_detector_screenshot_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own screenshot analyses" ON public.lie_detector_screenshot_analyses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own screenshot analyses" ON public.lie_detector_screenshot_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own screenshot analyses" ON public.lie_detector_screenshot_analyses
  FOR DELETE USING (auth.uid() = user_id);

-- Conversation timelines (deception spike sequences)
CREATE TABLE IF NOT EXISTS public.lie_detector_timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT,
  message_count INT NOT NULL DEFAULT 0,
  overall_score NUMERIC,
  spikes JSONB,
  patterns JSONB,
  results JSONB,
  credits_used INT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lie_detector_timelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own timelines" ON public.lie_detector_timelines
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own timelines" ON public.lie_detector_timelines
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own timelines" ON public.lie_detector_timelines
  FOR DELETE USING (auth.uid() = user_id);

-- Truth report PDF receipts
CREATE TABLE IF NOT EXISTS public.lie_detector_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source_type TEXT NOT NULL,
  source_id UUID,
  title TEXT,
  pdf_url TEXT,
  credits_used INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lie_detector_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own reports" ON public.lie_detector_reports
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own reports" ON public.lie_detector_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own reports" ON public.lie_detector_reports
  FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for evidence (audio + screenshots)
INSERT INTO storage.buckets (id, name, public)
VALUES ('lie-detector-evidence', 'lie-detector-evidence', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "users read own evidence" ON storage.objects
  FOR SELECT USING (bucket_id = 'lie-detector-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "users upload own evidence" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'lie-detector-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "users delete own evidence" ON storage.objects
  FOR DELETE USING (bucket_id = 'lie-detector-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE INDEX IF NOT EXISTS idx_ld_voice_user ON public.lie_detector_voice_analyses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ld_screenshot_user ON public.lie_detector_screenshot_analyses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ld_timeline_user ON public.lie_detector_timelines(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ld_report_user ON public.lie_detector_reports(user_id, created_at DESC);