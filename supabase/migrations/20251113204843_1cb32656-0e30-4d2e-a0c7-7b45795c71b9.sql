-- Create wellness meditation sessions table
CREATE TABLE public.wellness_meditation_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL, -- 'body_scan', 'breathing', 'grounding', 'nature_sounds'
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wellness journal entries table
CREATE TABLE public.wellness_journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_text TEXT NOT NULL,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
  ai_insights TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wellness usage statistics table
CREATE TABLE public.wellness_usage_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'meditation', 'journal', 'breathing', 'sounds', 'mandala', 'grounding'
  activity_count INTEGER NOT NULL DEFAULT 0,
  total_duration_seconds INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_type)
);

-- Enable Row Level Security
ALTER TABLE public.wellness_meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_usage_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meditation sessions
CREATE POLICY "Users can view their own meditation sessions"
  ON public.wellness_meditation_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meditation sessions"
  ON public.wellness_meditation_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meditation sessions"
  ON public.wellness_meditation_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meditation sessions"
  ON public.wellness_meditation_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for journal entries
CREATE POLICY "Users can view their own journal entries"
  ON public.wellness_journal_entries
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries"
  ON public.wellness_journal_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
  ON public.wellness_journal_entries
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
  ON public.wellness_journal_entries
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for usage statistics
CREATE POLICY "Users can view their own usage stats"
  ON public.wellness_usage_stats
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage stats"
  ON public.wellness_usage_stats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage stats"
  ON public.wellness_usage_stats
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update journal entry timestamp
CREATE OR REPLACE FUNCTION public.update_wellness_journal_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for journal entries
CREATE TRIGGER update_wellness_journal_updated_at
  BEFORE UPDATE ON public.wellness_journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_wellness_journal_timestamp();

-- Create function to update usage stats timestamp
CREATE OR REPLACE FUNCTION public.update_wellness_stats_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for usage stats
CREATE TRIGGER update_wellness_stats_updated_at
  BEFORE UPDATE ON public.wellness_usage_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_wellness_stats_timestamp();

-- Create indexes for better query performance
CREATE INDEX idx_wellness_meditation_user_id ON public.wellness_meditation_sessions(user_id);
CREATE INDEX idx_wellness_meditation_created_at ON public.wellness_meditation_sessions(created_at DESC);
CREATE INDEX idx_wellness_journal_user_id ON public.wellness_journal_entries(user_id);
CREATE INDEX idx_wellness_journal_created_at ON public.wellness_journal_entries(created_at DESC);
CREATE INDEX idx_wellness_stats_user_id ON public.wellness_usage_stats(user_id);
CREATE INDEX idx_wellness_stats_activity_type ON public.wellness_usage_stats(activity_type);