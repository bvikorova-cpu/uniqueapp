-- Safety: Wall Reactions (hugs/strength/relate)
CREATE TABLE IF NOT EXISTS public.safety_wall_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('hug','strength','relate','hope')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, reaction_type)
);
ALTER TABLE public.safety_wall_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reactions viewable by all authenticated" ON public.safety_wall_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can add their own reactions" ON public.safety_wall_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own reactions" ON public.safety_wall_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_safety_wall_reactions_message ON public.safety_wall_reactions(message_id);

-- Safety: Buddy Matching (anonymous peer support pairing)
CREATE TABLE IF NOT EXISTS public.safety_buddy_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  anonymous_handle TEXT NOT NULL,
  age_range TEXT,
  experience_tags TEXT[] DEFAULT '{}',
  looking_for TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.safety_buddy_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buddy profiles viewable by all auth" ON public.safety_buddy_profiles FOR SELECT TO authenticated USING (is_active = true OR auth.uid() = user_id);
CREATE POLICY "Users manage own buddy profile" ON public.safety_buddy_profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.safety_buddy_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL,
  user_b UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','ended')),
  match_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.safety_buddy_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buddy match visible to participants" ON public.safety_buddy_matches FOR SELECT TO authenticated USING (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "Users can create match requests" ON public.safety_buddy_matches FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_a);
CREATE POLICY "Participants can update match" ON public.safety_buddy_matches FOR UPDATE TO authenticated USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Safety: Roleplay Voice Sessions + Leaderboard
CREATE TABLE IF NOT EXISTS public.safety_roleplay_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  scenario_id TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy','medium','hard','expert')),
  mode TEXT NOT NULL DEFAULT 'text' CHECK (mode IN ('text','voice')),
  total_score INTEGER NOT NULL DEFAULT 0,
  steps_completed INTEGER NOT NULL DEFAULT 0,
  credits_used INTEGER NOT NULL DEFAULT 0,
  transcript JSONB DEFAULT '[]'::jsonb,
  ai_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.safety_roleplay_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roleplay sessions" ON public.safety_roleplay_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own roleplay sessions" ON public.safety_roleplay_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Public leaderboard view (anonymized)
CREATE OR REPLACE VIEW public.safety_roleplay_leaderboard AS
SELECT
  user_id,
  COALESCE((SELECT anonymous_handle FROM public.safety_buddy_profiles bp WHERE bp.user_id = s.user_id LIMIT 1), 'Anon Hero') AS handle,
  SUM(total_score) AS total_score,
  COUNT(*) AS sessions_played,
  MAX(created_at) AS last_played
FROM public.safety_roleplay_sessions s
GROUP BY user_id
ORDER BY SUM(total_score) DESC
LIMIT 100;

-- Safety: Mood tracking timeseries (separate from journal for graphing)
CREATE TABLE IF NOT EXISTS public.safety_mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mood_score INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 10),
  energy_score INTEGER CHECK (energy_score BETWEEN 1 AND 10),
  anxiety_score INTEGER CHECK (anxiety_score BETWEEN 1 AND 10),
  note TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.safety_mood_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own mood logs" ON public.safety_mood_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own mood logs" ON public.safety_mood_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own mood logs" ON public.safety_mood_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_safety_mood_logs_user_date ON public.safety_mood_logs(user_id, logged_at DESC);

-- Safety: Weekly AI insights (cached so we don't re-run AI every visit)
CREATE TABLE IF NOT EXISTS public.safety_journal_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  insight_text TEXT NOT NULL,
  trend TEXT,
  recommendations JSONB DEFAULT '[]'::jsonb,
  credits_used INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);
ALTER TABLE public.safety_journal_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own insights" ON public.safety_journal_insights FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own insights" ON public.safety_journal_insights FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Safety: SOS country detection cache
CREATE TABLE IF NOT EXISTS public.safety_sos_country_pref (
  user_id UUID PRIMARY KEY,
  country_code TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.safety_sos_country_pref ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own country pref" ON public.safety_sos_country_pref FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);