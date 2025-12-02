-- Create lie_detector_credits table
CREATE TABLE IF NOT EXISTS public.lie_detector_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create lie_detector_analyses table
CREATE TABLE IF NOT EXISTS public.lie_detector_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('single_message', 'conversation_thread', 'psychological_profile')),
  input_text TEXT NOT NULL,
  results JSONB,
  truthfulness_score INTEGER,
  credits_used INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create lie_detector_sessions table
CREATE TABLE IF NOT EXISTS public.lie_detector_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'real_time_monitoring',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  credits_used INTEGER NOT NULL DEFAULT 25,
  messages_analyzed INTEGER DEFAULT 0,
  session_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.lie_detector_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lie_detector_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lie_detector_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lie_detector_credits
CREATE POLICY "Users can view their own credits"
  ON public.lie_detector_credits
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits"
  ON public.lie_detector_credits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON public.lie_detector_credits
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for lie_detector_analyses
CREATE POLICY "Users can view their own analyses"
  ON public.lie_detector_analyses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses"
  ON public.lie_detector_analyses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for lie_detector_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.lie_detector_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON public.lie_detector_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.lie_detector_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lie_detector_credits_user_id ON public.lie_detector_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_lie_detector_analyses_user_id ON public.lie_detector_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_lie_detector_sessions_user_id ON public.lie_detector_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_lie_detector_sessions_status ON public.lie_detector_sessions(status);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_lie_detector_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lie_detector_credits_timestamp
  BEFORE UPDATE ON public.lie_detector_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_lie_detector_credits_updated_at();