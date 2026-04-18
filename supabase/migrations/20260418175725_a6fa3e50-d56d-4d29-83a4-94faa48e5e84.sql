-- Wellness Dream Interpretations
CREATE TABLE public.wellness_dream_interpretations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dream_text TEXT NOT NULL,
  interpretation TEXT,
  symbols JSONB DEFAULT '[]'::jsonb,
  emotional_themes JSONB DEFAULT '[]'::jsonb,
  illustration_url TEXT,
  credits_used INT DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wellness_dream_interpretations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own dreams" ON public.wellness_dream_interpretations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own dreams" ON public.wellness_dream_interpretations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own dreams" ON public.wellness_dream_interpretations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own dreams" ON public.wellness_dream_interpretations FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_dream_user ON public.wellness_dream_interpretations(user_id, created_at DESC);

-- Personalized Meditations
CREATE TABLE public.wellness_personalized_meditations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 5,
  meditation_script TEXT,
  voice_id TEXT DEFAULT 'EXAVITQu4vr4xnSDxMaL',
  audio_url TEXT,
  credits_used INT DEFAULT 15,
  status TEXT NOT NULL DEFAULT 'pending',
  play_count INT DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wellness_personalized_meditations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own meditations" ON public.wellness_personalized_meditations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own meditations" ON public.wellness_personalized_meditations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own meditations" ON public.wellness_personalized_meditations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own meditations" ON public.wellness_personalized_meditations FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_pers_med_user ON public.wellness_personalized_meditations(user_id, created_at DESC);

-- Mood Mirror (selfie analysis)
CREATE TABLE public.wellness_mood_mirror (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  selfie_url TEXT,
  detected_mood TEXT,
  stress_level INT,
  fatigue_level INT,
  emotion_breakdown JSONB DEFAULT '{}'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  ai_insight TEXT,
  credits_used INT DEFAULT 8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wellness_mood_mirror ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own mood" ON public.wellness_mood_mirror FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own mood" ON public.wellness_mood_mirror FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own mood" ON public.wellness_mood_mirror FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_mood_user ON public.wellness_mood_mirror(user_id, created_at DESC);

-- AI Generated Sleep Stories (with voice)
CREATE TABLE public.wellness_ai_sleep_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  protagonist TEXT,
  setting TEXT,
  story_text TEXT,
  voice_id TEXT DEFAULT 'XrExE9yKIg1WjnnlVkGX',
  audio_url TEXT,
  duration_minutes INT DEFAULT 10,
  credits_used INT DEFAULT 20,
  status TEXT NOT NULL DEFAULT 'pending',
  play_count INT DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wellness_ai_sleep_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own ai stories" ON public.wellness_ai_sleep_stories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own ai stories" ON public.wellness_ai_sleep_stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own ai stories" ON public.wellness_ai_sleep_stories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own ai stories" ON public.wellness_ai_sleep_stories FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_ai_sleep_user ON public.wellness_ai_sleep_stories(user_id, created_at DESC);

-- Storage bucket for wellness AI audio + selfies
INSERT INTO storage.buckets (id, name, public)
VALUES ('wellness-ai', 'wellness-ai', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read wellness-ai" ON storage.objects FOR SELECT USING (bucket_id = 'wellness-ai');
CREATE POLICY "Users upload wellness-ai" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'wellness-ai' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update wellness-ai" ON storage.objects FOR UPDATE USING (bucket_id = 'wellness-ai' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete wellness-ai" ON storage.objects FOR DELETE USING (bucket_id = 'wellness-ai' AND auth.uid()::text = (storage.foldername(name))[1]);