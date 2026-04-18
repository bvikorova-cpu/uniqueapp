-- Live Lie Coach sessions
CREATE TABLE public.lie_coach_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  conversation_text TEXT NOT NULL,
  analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  manipulation_score INTEGER DEFAULT 0,
  suggestions JSONB DEFAULT '[]'::jsonb,
  credits_used INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_coach_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own coach sessions select" ON public.lie_coach_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own coach sessions insert" ON public.lie_coach_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own coach sessions delete" ON public.lie_coach_sessions FOR DELETE USING (auth.uid() = user_id);

-- Multi-Person Profiles (relationship maps)
CREATE TABLE public.lie_relationship_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  people JSONB NOT NULL DEFAULT '[]'::jsonb,
  analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  credits_used INTEGER DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_relationship_maps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rel maps select" ON public.lie_relationship_maps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own rel maps insert" ON public.lie_relationship_maps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own rel maps update" ON public.lie_relationship_maps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own rel maps delete" ON public.lie_relationship_maps FOR DELETE USING (auth.uid() = user_id);

-- Voice Cloning / Deepfake checks
CREATE TABLE public.lie_deepfake_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  audio_url TEXT,
  is_synthetic BOOLEAN,
  confidence NUMERIC(5,2),
  indicators JSONB DEFAULT '[]'::jsonb,
  analysis TEXT,
  credits_used INTEGER DEFAULT 12,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_deepfake_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own deepfake select" ON public.lie_deepfake_checks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own deepfake insert" ON public.lie_deepfake_checks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own deepfake delete" ON public.lie_deepfake_checks FOR DELETE USING (auth.uid() = user_id);

-- Daily Spot the Lie challenges + attempts + leaderboard
CREATE TABLE public.lie_daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE NOT NULL UNIQUE,
  scenario TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_daily_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "challenges public read" ON public.lie_daily_challenges FOR SELECT USING (true);

CREATE TABLE public.lie_challenge_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.lie_daily_challenges(id) ON DELETE CASCADE,
  selected_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken_ms INTEGER,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);
ALTER TABLE public.lie_challenge_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attempts public read" ON public.lie_challenge_attempts FOR SELECT USING (true);
CREATE POLICY "own attempts insert" ON public.lie_challenge_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.lie_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  total_points INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leaderboard public read" ON public.lie_leaderboard FOR SELECT USING (true);
CREATE POLICY "own leaderboard upsert" ON public.lie_leaderboard FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own leaderboard update" ON public.lie_leaderboard FOR UPDATE USING (auth.uid() = user_id);

-- Public verification tokens for Watermarked PDFs
CREATE TABLE public.lie_report_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID,
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  title TEXT,
  summary TEXT,
  truthfulness_score INTEGER,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_report_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "verifications public read" ON public.lie_report_verifications FOR SELECT USING (true);
CREATE POLICY "own verifications insert" ON public.lie_report_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User UI preferences (for Dark Interrogation Mode toggle)
CREATE TABLE public.lie_detector_preferences (
  user_id UUID PRIMARY KEY,
  interrogation_mode BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_detector_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own prefs select" ON public.lie_detector_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own prefs insert" ON public.lie_detector_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own prefs update" ON public.lie_detector_preferences FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_lie_attempts_user ON public.lie_challenge_attempts(user_id);
CREATE INDEX idx_lie_attempts_challenge ON public.lie_challenge_attempts(challenge_id);
CREATE INDEX idx_lie_leaderboard_points ON public.lie_leaderboard(total_points DESC);
CREATE INDEX idx_lie_verifications_token ON public.lie_report_verifications(token);