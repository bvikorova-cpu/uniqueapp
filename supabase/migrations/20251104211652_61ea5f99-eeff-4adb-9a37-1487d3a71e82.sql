-- Create IQ credits table
CREATE TABLE public.iq_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_iq_credits UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.iq_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own iq credits"
  ON public.iq_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own iq credits"
  ON public.iq_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own iq credits"
  ON public.iq_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- Create IQ tests table
CREATE TABLE public.iq_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  questions_count INTEGER NOT NULL,
  time_limit INTEGER NOT NULL, -- in minutes
  credits_cost INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.iq_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tests"
  ON public.iq_tests FOR SELECT
  USING (is_active = true);

-- Create IQ test questions table
CREATE TABLE public.iq_test_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID NOT NULL REFERENCES public.iq_tests(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  order_num INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.iq_test_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view test questions"
  ON public.iq_test_questions FOR SELECT
  USING (true);

-- Create IQ test results table
CREATE TABLE public.iq_test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  test_id UUID NOT NULL REFERENCES public.iq_tests(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  iq_score INTEGER NOT NULL,
  time_taken INTEGER NOT NULL, -- in seconds
  answers JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.iq_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own test results"
  ON public.iq_test_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own test results"
  ON public.iq_test_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create IQ competitions table
CREATE TABLE public.iq_competitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  entry_fee INTEGER NOT NULL,
  prize_pool INTEGER NOT NULL DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.iq_competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view competitions"
  ON public.iq_competitions FOR SELECT
  USING (true);

-- Create IQ competition participants table
CREATE TABLE public.iq_competition_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID NOT NULL REFERENCES public.iq_competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  score INTEGER,
  rank INTEGER,
  prize_amount INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_competition_participant UNIQUE (competition_id, user_id)
);

ALTER TABLE public.iq_competition_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view competition participants"
  ON public.iq_competition_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join competitions"
  ON public.iq_competition_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
  ON public.iq_competition_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- Create IQ analyses table
CREATE TABLE public.iq_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('cognitive_profile', 'learning_style', 'strengths_weaknesses', 'improvement_plan')),
  results JSONB NOT NULL,
  credits_cost INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.iq_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses"
  ON public.iq_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON public.iq_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updating iq_credits timestamp
CREATE TRIGGER update_iq_credits_timestamp
  BEFORE UPDATE ON public.iq_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updating iq_tests timestamp
CREATE TRIGGER update_iq_tests_timestamp
  BEFORE UPDATE ON public.iq_tests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updating iq_competitions timestamp
CREATE TRIGGER update_iq_competitions_timestamp
  BEFORE UPDATE ON public.iq_competitions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();