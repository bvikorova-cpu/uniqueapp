
CREATE TABLE IF NOT EXISTS crystal_user_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  crystal_name TEXT NOT NULL,
  crystal_type TEXT,
  photo_url TEXT,
  notes TEXT,
  energy_profile TEXT,
  acquired_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crystal_oracle_draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  crystal_name TEXT NOT NULL,
  mantra TEXT,
  guidance TEXT,
  drawn_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crystal_community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  category TEXT DEFAULT 'general',
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crystal_meditation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  duration_seconds INT NOT NULL,
  frequency_type TEXT,
  chakra_focus TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crystal_energy_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_type TEXT NOT NULL,
  energy_level INT,
  analysis_text TEXT,
  image_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crystal_chakra_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_number INT NOT NULL,
  chakra_name TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  program_started_at DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, program_started_at, day_number)
);

CREATE TABLE IF NOT EXISTS crystal_user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  total_points INT DEFAULT 0,
  total_readings INT DEFAULT 0,
  total_meditations INT DEFAULT 0,
  crystals_collected INT DEFAULT 0,
  chakras_balanced INT DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE crystal_user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE crystal_oracle_draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE crystal_community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crystal_meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crystal_energy_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE crystal_chakra_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE crystal_user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own crystal collections" ON crystal_user_collections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own oracle draws" ON crystal_oracle_draws FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read community posts" ON crystal_community_posts FOR SELECT USING (true);
CREATE POLICY "Users create own community posts" ON crystal_community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own community posts" ON crystal_community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own community posts" ON crystal_community_posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users manage own meditation sessions" ON crystal_meditation_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own energy readings" ON crystal_energy_readings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own chakra progress" ON crystal_chakra_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own stats" ON crystal_user_stats FOR ALL USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION increment_crystal_stat(p_user_id UUID, p_stat TEXT, p_value INT DEFAULT 1)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO crystal_user_stats (user_id, total_readings, total_meditations, crystals_collected, total_points, current_streak, longest_streak, last_activity_date, updated_at)
  VALUES (
    p_user_id,
    CASE WHEN p_stat = 'readings' THEN p_value ELSE 0 END,
    CASE WHEN p_stat = 'meditations' THEN p_value ELSE 0 END,
    CASE WHEN p_stat = 'crystals' THEN p_value ELSE 0 END,
    p_value * 10,
    1, 1, CURRENT_DATE, NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_readings = CASE WHEN p_stat = 'readings' THEN crystal_user_stats.total_readings + p_value ELSE crystal_user_stats.total_readings END,
    total_meditations = CASE WHEN p_stat = 'meditations' THEN crystal_user_stats.total_meditations + p_value ELSE crystal_user_stats.total_meditations END,
    crystals_collected = CASE WHEN p_stat = 'crystals' THEN crystal_user_stats.crystals_collected + p_value ELSE crystal_user_stats.crystals_collected END,
    total_points = crystal_user_stats.total_points + (p_value * 10),
    current_streak = CASE
      WHEN crystal_user_stats.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN crystal_user_stats.current_streak + 1
      WHEN crystal_user_stats.last_activity_date = CURRENT_DATE THEN crystal_user_stats.current_streak
      ELSE 1
    END,
    longest_streak = GREATEST(crystal_user_stats.longest_streak,
      CASE
        WHEN crystal_user_stats.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN crystal_user_stats.current_streak + 1
        WHEN crystal_user_stats.last_activity_date = CURRENT_DATE THEN crystal_user_stats.current_streak
        ELSE 1
      END
    ),
    last_activity_date = CURRENT_DATE,
    updated_at = NOW();
END;
$$;
