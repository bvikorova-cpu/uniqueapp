CREATE TABLE IF NOT EXISTS psychology_dream_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text DEFAULT 'Untitled Dream',
  description text NOT NULL,
  dream_type text DEFAULT 'Normal',
  vividness_score integer DEFAULT 5 CHECK (vividness_score BETWEEN 1 AND 10),
  ai_interpretation text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE psychology_dream_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own dream entries" ON psychology_dream_entries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS psychology_wellness_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_content text NOT NULL,
  mood_entries_count integer DEFAULT 0,
  meditation_count integer DEFAULT 0,
  credits_used integer DEFAULT 10,
  week_start timestamptz,
  week_end timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE psychology_wellness_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own wellness reports" ON psychology_wellness_reports
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);