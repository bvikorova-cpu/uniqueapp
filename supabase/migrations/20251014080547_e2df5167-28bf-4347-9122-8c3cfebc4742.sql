-- Create enum for mood types
CREATE TYPE mood_type AS ENUM ('very_bad', 'bad', 'neutral', 'good', 'very_good');

-- Create dream_entries table
CREATE TABLE dream_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  dream_date DATE NOT NULL DEFAULT CURRENT_DATE,
  ai_analysis TEXT,
  themes JSONB DEFAULT '[]'::jsonb,
  emotions JSONB DEFAULT '[]'::jsonb,
  symbols JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create journal_entries table
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  mood mood_type NOT NULL,
  ai_insights TEXT,
  emotions_detected JSONB DEFAULT '[]'::jsonb,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create mood_logs table
CREATE TABLE mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mood mood_type NOT NULL,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  notes TEXT,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE dream_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dream_entries
CREATE POLICY "Users can view their own dreams"
  ON dream_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dreams"
  ON dream_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dreams"
  ON dream_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dreams"
  ON dream_entries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for journal_entries
CREATE POLICY "Users can view their own journals"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journals"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journals"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journals"
  ON journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for mood_logs
CREATE POLICY "Users can view their own moods"
  ON mood_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own moods"
  ON mood_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own moods"
  ON mood_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own moods"
  ON mood_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_dream_entries_user_id ON dream_entries(user_id);
CREATE INDEX idx_dream_entries_dream_date ON dream_entries(dream_date);
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX idx_mood_logs_user_id ON mood_logs(user_id);
CREATE INDEX idx_mood_logs_log_date ON mood_logs(log_date);

-- Create triggers for updated_at
CREATE TRIGGER update_dream_entries_updated_at
  BEFORE UPDATE ON dream_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();