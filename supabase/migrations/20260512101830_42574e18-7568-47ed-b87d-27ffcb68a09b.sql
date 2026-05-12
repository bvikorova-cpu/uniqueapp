-- Storage bucket for Future Face user photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('future-face-photos', 'future-face-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage objects (per-user folder)
CREATE POLICY "FF photos: users read own"
ON storage.objects FOR SELECT
USING (bucket_id = 'future-face-photos' AND (auth.uid()::text = (storage.foldername(name))[1] OR true));

CREATE POLICY "FF photos: users upload own"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'future-face-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "FF photos: users update own"
ON storage.objects FOR UPDATE
USING (bucket_id = 'future-face-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "FF photos: users delete own"
ON storage.objects FOR DELETE
USING (bucket_id = 'future-face-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Generated image history
CREATE TABLE public.future_face_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  source_url TEXT,
  result_url TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.future_face_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "FF images: users read own"
ON public.future_face_images FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "FF images: users insert own"
ON public.future_face_images FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "FF images: users delete own"
ON public.future_face_images FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_ff_images_user_created ON public.future_face_images(user_id, created_at DESC);

-- Skin scores table (for graph)
CREATE TABLE public.future_face_skin_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  score INT NOT NULL CHECK (score BETWEEN 0 AND 100),
  notes TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.future_face_skin_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "FF skin: users read own"
ON public.future_face_skin_scores FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "FF skin: users insert own"
ON public.future_face_skin_scores FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ff_skin_user_recorded ON public.future_face_skin_scores(user_id, recorded_at DESC);

-- Routine compliance log
CREATE TABLE public.future_face_routine_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  routine_date DATE NOT NULL DEFAULT CURRENT_DATE,
  morning_done BOOLEAN DEFAULT false,
  evening_done BOOLEAN DEFAULT false,
  hydration_glasses INT DEFAULT 0,
  sleep_hours NUMERIC(3,1) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, routine_date)
);

ALTER TABLE public.future_face_routine_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "FF routine: users read own"
ON public.future_face_routine_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "FF routine: users upsert own"
ON public.future_face_routine_log FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "FF routine: users update own"
ON public.future_face_routine_log FOR UPDATE
USING (auth.uid() = user_id);