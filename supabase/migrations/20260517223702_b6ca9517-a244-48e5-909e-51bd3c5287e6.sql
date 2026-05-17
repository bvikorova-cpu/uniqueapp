
-- Handwriting Parity Pack: 8 new specialized tools
CREATE TABLE public.handwriting_zone_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  upper_zone jsonb,
  middle_zone jsonb,
  lower_zone jsonb,
  dominant_zone text,
  ai_summary text,
  credits_used int DEFAULT 6,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.handwriting_zone_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own zone analyses" ON public.handwriting_zone_analyses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.handwriting_letter_decoder (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  letters jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_summary text,
  credits_used int DEFAULT 6,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.handwriting_letter_decoder ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own letter decoder" ON public.handwriting_letter_decoder FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.handwriting_career_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  top_careers jsonb NOT NULL DEFAULT '[]'::jsonb,
  avoid_careers jsonb DEFAULT '[]'::jsonb,
  reasoning text,
  credits_used int DEFAULT 6,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.handwriting_career_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own career matches" ON public.handwriting_career_matches FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.handwriting_health_screens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  tremor_score int,
  micrographia_score int,
  fatigue_score int,
  flags jsonb DEFAULT '[]'::jsonb,
  disclaimer text,
  ai_summary text,
  credits_used int DEFAULT 6,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.handwriting_health_screens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own health screens" ON public.handwriting_health_screens FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.handwriting_mental_screens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  anxiety_score int,
  depression_score int,
  burnout_score int,
  resilience_score int,
  recommendations jsonb DEFAULT '[]'::jsonb,
  ai_summary text,
  credits_used int DEFAULT 6,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.handwriting_mental_screens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own mental screens" ON public.handwriting_mental_screens FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.handwriting_coach_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  before_image_url text NOT NULL,
  goal text,
  exercises jsonb DEFAULT '[]'::jsonb,
  ai_plan text,
  credits_used int DEFAULT 6,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.handwriting_coach_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own coach sessions" ON public.handwriting_coach_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.handwriting_forensic_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  estimated_age_range text,
  estimated_handedness text,
  estimated_gender_tendency text,
  personality_summary text,
  behavioral_markers jsonb DEFAULT '[]'::jsonb,
  confidence int,
  disclaimer text,
  credits_used int DEFAULT 6,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.handwriting_forensic_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own forensic profiles" ON public.handwriting_forensic_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.handwriting_cultural_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  matched_styles jsonb DEFAULT '[]'::jsonb,
  primary_style text,
  era_estimate text,
  ai_summary text,
  credits_used int DEFAULT 6,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.handwriting_cultural_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cultural matches" ON public.handwriting_cultural_matches FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
