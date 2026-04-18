-- ===== POLYGRAPH 3D =====
CREATE TABLE public.lie_polygraph_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source_text TEXT NOT NULL,
  stress_curve JSONB NOT NULL DEFAULT '[]'::jsonb,
  peak_moments JSONB DEFAULT '[]'::jsonb,
  overall_stress NUMERIC,
  truthfulness_score NUMERIC,
  credits_used INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_polygraph_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own polygraph select" ON public.lie_polygraph_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own polygraph insert" ON public.lie_polygraph_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own polygraph delete" ON public.lie_polygraph_sessions FOR DELETE USING (auth.uid() = user_id);

-- ===== CROSS-EXAMINATION =====
CREATE TABLE public.lie_cross_examinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subject_text TEXT NOT NULL,
  qa_thread JSONB NOT NULL DEFAULT '[]'::jsonb,
  contradictions JSONB DEFAULT '[]'::jsonb,
  verdict TEXT,
  credits_used INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_cross_examinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own xexam all" ON public.lie_cross_examinations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===== VOICE HEATMAP =====
CREATE TABLE public.lie_voice_heatmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  audio_duration_sec NUMERIC,
  segments JSONB NOT NULL DEFAULT '[]'::jsonb,
  transcript TEXT,
  overall_score NUMERIC,
  credits_used INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_voice_heatmaps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own heatmap select" ON public.lie_voice_heatmaps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own heatmap insert" ON public.lie_voice_heatmaps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own heatmap delete" ON public.lie_voice_heatmaps FOR DELETE USING (auth.uid() = user_id);

-- ===== BODY LANGUAGE VIDEO SCAN =====
CREATE TABLE public.lie_body_language_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  video_url TEXT,
  thumbnail_url TEXT,
  micro_expressions JSONB DEFAULT '[]'::jsonb,
  blink_rate NUMERIC,
  gaze_pattern TEXT,
  deception_indicators JSONB DEFAULT '[]'::jsonb,
  overall_score NUMERIC,
  credits_used INTEGER NOT NULL DEFAULT 25,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_body_language_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bodylang select" ON public.lie_body_language_scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own bodylang insert" ON public.lie_body_language_scans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own bodylang delete" ON public.lie_body_language_scans FOR DELETE USING (auth.uid() = user_id);

-- ===== DETECTIVE RANKS =====
CREATE TABLE public.lie_detective_ranks (
  user_id UUID PRIMARY KEY,
  xp INTEGER NOT NULL DEFAULT 0,
  rank_tier TEXT NOT NULL DEFAULT 'Rookie',
  badges JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_analyses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_detective_ranks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rank select" ON public.lie_detective_ranks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ranks public select" ON public.lie_detective_ranks FOR SELECT USING (true);
CREATE POLICY "own rank upsert" ON public.lie_detective_ranks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own rank update" ON public.lie_detective_ranks FOR UPDATE USING (auth.uid() = user_id);

-- ===== CASE FILES =====
CREATE TABLE public.lie_case_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  suspect_profile JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_case_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own case all" ON public.lie_case_files FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.lie_case_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.lie_case_files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  item_ref UUID,
  payload JSONB DEFAULT '{}'::jsonb,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_case_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own caseitem all" ON public.lie_case_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_lie_case_items_case ON public.lie_case_items(case_id);

-- ===== SOCIAL CARDS =====
CREATE TABLE public.lie_social_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  blurred_quote TEXT,
  truth_score NUMERIC,
  card_image_url TEXT,
  source_type TEXT,
  source_id UUID,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_social_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "social public select" ON public.lie_social_cards FOR SELECT USING (true);
CREATE POLICY "own social insert" ON public.lie_social_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own social update" ON public.lie_social_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own social delete" ON public.lie_social_cards FOR DELETE USING (auth.uid() = user_id);

-- ===== BULK JOBS =====
CREATE TABLE public.lie_bulk_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_type TEXT NOT NULL,
  total_items INTEGER NOT NULL DEFAULT 0,
  processed_items INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'queued',
  results JSONB DEFAULT '[]'::jsonb,
  credits_used INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_bulk_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bulk all" ON public.lie_bulk_jobs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===== API KEYS =====
CREATE TABLE public.lie_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  requests_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own apikey select" ON public.lie_api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own apikey insert" ON public.lie_api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own apikey update" ON public.lie_api_keys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own apikey delete" ON public.lie_api_keys FOR DELETE USING (auth.uid() = user_id);

-- ===== COMPARISONS =====
CREATE TABLE public.lie_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT,
  source_a TEXT NOT NULL,
  source_b TEXT NOT NULL,
  diff_findings JSONB DEFAULT '[]'::jsonb,
  verdict TEXT,
  credits_used INTEGER NOT NULL DEFAULT 6,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_comparisons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own compare all" ON public.lie_comparisons FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===== MONITORING =====
CREATE TABLE public.lie_monitoring_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  thread_seed TEXT NOT NULL,
  notify_email TEXT,
  cadence TEXT NOT NULL DEFAULT 'daily',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ,
  last_alert_score NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_monitoring_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own monitor all" ON public.lie_monitoring_jobs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===== updated_at triggers =====
CREATE TRIGGER trg_xexam_updated BEFORE UPDATE ON public.lie_cross_examinations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_rank_updated BEFORE UPDATE ON public.lie_detective_ranks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_case_updated BEFORE UPDATE ON public.lie_case_files FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bulk_updated BEFORE UPDATE ON public.lie_bulk_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_monitor_updated BEFORE UPDATE ON public.lie_monitoring_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();