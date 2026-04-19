-- Time-Capsule: stores user's handwriting samples over time + AI evolution diff analyses
CREATE TABLE public.handwriting_time_capsule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  label TEXT,
  notes TEXT,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.handwriting_time_capsule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own capsule entries"
  ON public.handwriting_time_capsule FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own capsule entries"
  ON public.handwriting_time_capsule FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own capsule entries"
  ON public.handwriting_time_capsule FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_capsule_user_date ON public.handwriting_time_capsule(user_id, captured_at DESC);

-- Diff analyses comparing two capsule entries
CREATE TABLE public.handwriting_evolution_diffs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entry_a_id UUID NOT NULL REFERENCES public.handwriting_time_capsule(id) ON DELETE CASCADE,
  entry_b_id UUID NOT NULL REFERENCES public.handwriting_time_capsule(id) ON DELETE CASCADE,
  diff_summary TEXT,
  changes JSONB NOT NULL DEFAULT '{}'::jsonb,
  emotional_shift TEXT,
  growth_score INTEGER,
  credits_used INTEGER NOT NULL DEFAULT 6,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.handwriting_evolution_diffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own diffs"
  ON public.handwriting_evolution_diffs FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own diffs"
  ON public.handwriting_evolution_diffs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Live Ink: stores stroke-based recordings (point arrays) + AI personality reads
CREATE TABLE public.handwriting_live_ink_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  strokes JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  pressure_avg NUMERIC,
  speed_avg NUMERIC,
  ai_reading JSONB,
  credits_used INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.handwriting_live_ink_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own live ink"
  ON public.handwriting_live_ink_recordings FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own live ink"
  ON public.handwriting_live_ink_recordings FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own live ink"
  ON public.handwriting_live_ink_recordings FOR DELETE
  USING (auth.uid() = user_id);

-- Storage bucket for capsule images
INSERT INTO storage.buckets (id, name, public)
VALUES ('handwriting-capsule', 'handwriting-capsule', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Capsule images are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'handwriting-capsule');

CREATE POLICY "Users upload own capsule images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'handwriting-capsule'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own capsule images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'handwriting-capsule'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );