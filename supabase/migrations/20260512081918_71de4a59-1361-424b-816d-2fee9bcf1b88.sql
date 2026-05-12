
-- 1. pet_profiles
CREATE TABLE public.pet_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL DEFAULT 'dog',
  breed TEXT,
  age_years NUMERIC,
  gender TEXT,
  photo_url TEXT,
  personality TEXT,
  is_indoor BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pet_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all" ON public.pet_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_pet_profiles_user ON public.pet_profiles(user_id);

-- 2. pet_translations
CREATE TABLE public.pet_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES public.pet_profiles(id) ON DELETE SET NULL,
  kind TEXT NOT NULL DEFAULT 'audio',
  emotion TEXT,
  confidence NUMERIC,
  text_result TEXT,
  audio_url TEXT,
  photo_url TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pet_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all" ON public.pet_translations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_pet_translations_user ON public.pet_translations(user_id, created_at DESC);

-- 3. pet_quiz_responses
CREATE TABLE public.pet_quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES public.pet_profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pet_quiz_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all" ON public.pet_quiz_responses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. pet_sound_wall (community)
CREATE TABLE public.pet_sound_wall (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_name TEXT,
  species TEXT,
  audio_url TEXT NOT NULL,
  caption TEXT,
  emotion TEXT,
  votes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pet_sound_wall ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone_read" ON public.pet_sound_wall FOR SELECT USING (true);
CREATE POLICY "owner_write" ON public.pet_sound_wall FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update" ON public.pet_sound_wall FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner_delete" ON public.pet_sound_wall FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_pet_sound_wall_recent ON public.pet_sound_wall(created_at DESC);

-- 5. pet_symptoms_log
CREATE TABLE public.pet_symptoms_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES public.pet_profiles(id) ON DELETE SET NULL,
  symptoms JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_assessment TEXT,
  urgency TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pet_symptoms_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_all" ON public.pet_symptoms_log FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
