-- Create mentor areas enum
CREATE TYPE public.mentor_area AS ENUM ('career', 'fitness', 'mindset', 'relationships');

-- Create mentor subscriptions table
CREATE TABLE public.mentor_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_area mentor_area NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, mentor_area)
);

-- Create mentor goals table
CREATE TABLE public.mentor_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_area mentor_area NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create mentor check-ins table
CREATE TABLE public.mentor_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_area mentor_area NOT NULL,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  notes TEXT,
  achievements TEXT[],
  challenges TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create mentor sessions table (for chat history)
CREATE TABLE public.mentor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_area mentor_area NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create mentor progress table
CREATE TABLE public.mentor_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_area mentor_area NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.mentor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mentor_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.mentor_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
  ON public.mentor_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON public.mentor_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for mentor_goals
CREATE POLICY "Users can view their own goals"
  ON public.mentor_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
  ON public.mentor_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON public.mentor_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON public.mentor_goals FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for mentor_checkins
CREATE POLICY "Users can view their own check-ins"
  ON public.mentor_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own check-ins"
  ON public.mentor_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for mentor_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.mentor_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON public.mentor_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.mentor_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for mentor_progress
CREATE POLICY "Users can view their own progress"
  ON public.mentor_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
  ON public.mentor_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_mentor_subscriptions_user_id ON public.mentor_subscriptions(user_id);
CREATE INDEX idx_mentor_goals_user_id ON public.mentor_goals(user_id);
CREATE INDEX idx_mentor_checkins_user_id ON public.mentor_checkins(user_id);
CREATE INDEX idx_mentor_sessions_user_id ON public.mentor_sessions(user_id);
CREATE INDEX idx_mentor_progress_user_id ON public.mentor_progress(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_mentor_subscriptions_updated_at
  BEFORE UPDATE ON public.mentor_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentor_goals_updated_at
  BEFORE UPDATE ON public.mentor_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentor_sessions_updated_at
  BEFORE UPDATE ON public.mentor_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();