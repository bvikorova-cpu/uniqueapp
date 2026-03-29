-- Mood tracker entries
CREATE TABLE IF NOT EXISTS psychology_mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_score INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 10),
  mood_label TEXT NOT NULL,
  journal_entry TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE psychology_mood_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own mood entries" ON psychology_mood_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Meditation sessions
CREATE TABLE IF NOT EXISTS psychology_meditation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL DEFAULT 'breathing',
  duration_seconds INTEGER NOT NULL,
  completed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE psychology_meditation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own meditation sessions" ON psychology_meditation_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- AI emotion analyses (paid)
CREATE TABLE IF NOT EXISTS psychology_emotion_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  analysis_result JSONB,
  credits_used INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE psychology_emotion_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own emotion analyses" ON psychology_emotion_analyses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);