-- Create tables for Kids AI features

-- AI Homework Helper
CREATE TABLE IF NOT EXISTS public.kids_homework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  question TEXT NOT NULL,
  ai_explanation TEXT,
  fun_facts JSONB DEFAULT '[]'::jsonb,
  difficulty_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.kids_homework ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kids can view their homework" ON public.kids_homework
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Kids can create homework entries" ON public.kids_homework
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI Story Creator
CREATE TABLE IF NOT EXISTS public.kids_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  story_text TEXT NOT NULL,
  illustration_url TEXT,
  characters JSONB DEFAULT '[]'::jsonb,
  theme TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.kids_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kids can view their stories" ON public.kids_stories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Kids can create stories" ON public.kids_stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kids can delete their stories" ON public.kids_stories
  FOR DELETE USING (auth.uid() = user_id);

-- AI Math Games
CREATE TABLE IF NOT EXISTS public.kids_math_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  game_type TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  score INTEGER DEFAULT 0,
  problems_solved INTEGER DEFAULT 0,
  accuracy_percentage INTEGER DEFAULT 0,
  last_played_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.kids_math_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kids can view their math progress" ON public.kids_math_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Kids can update their math progress" ON public.kids_math_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kids can modify their math progress" ON public.kids_math_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- AI Science Lab
CREATE TABLE IF NOT EXISTS public.kids_science_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  experiment_name TEXT NOT NULL,
  category TEXT NOT NULL,
  hypothesis TEXT,
  observations TEXT,
  conclusion TEXT,
  ai_insights JSONB DEFAULT '{}'::jsonb,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.kids_science_experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kids can view their experiments" ON public.kids_science_experiments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Kids can create experiments" ON public.kids_science_experiments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kids can update their experiments" ON public.kids_science_experiments
  FOR UPDATE USING (auth.uid() = user_id);

-- AI Drawing Buddy
CREATE TABLE IF NOT EXISTS public.kids_drawings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  drawing_url TEXT,
  tutorial_topic TEXT NOT NULL,
  steps_completed INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,
  difficulty TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.kids_drawings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kids can view their drawings" ON public.kids_drawings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Kids can create drawings" ON public.kids_drawings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kids can delete their drawings" ON public.kids_drawings
  FOR DELETE USING (auth.uid() = user_id);

-- AI Reading Companion
CREATE TABLE IF NOT EXISTS public.kids_reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  book_title TEXT NOT NULL,
  content TEXT NOT NULL,
  current_page INTEGER DEFAULT 1,
  comprehension_score INTEGER,
  vocabulary_learned JSONB DEFAULT '[]'::jsonb,
  quiz_results JSONB DEFAULT '[]'::jsonb,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.kids_reading_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kids can view their reading sessions" ON public.kids_reading_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Kids can create reading sessions" ON public.kids_reading_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kids can update their reading sessions" ON public.kids_reading_sessions
  FOR UPDATE USING (auth.uid() = user_id);