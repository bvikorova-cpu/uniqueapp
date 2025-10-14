-- Create routine_entries table for daily tracking
CREATE TABLE public.routine_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sleep_hours NUMERIC(3,1),
  workout_minutes INTEGER,
  work_hours NUMERIC(3,1),
  social_hours NUMERIC(3,1),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, entry_date)
);

-- Create ai_routine_optimizations table
CREATE TABLE public.ai_routine_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  optimization_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  sleep_recommendation TEXT,
  workout_recommendation TEXT,
  work_recommendation TEXT,
  social_recommendation TEXT,
  habit_stacking_suggestions JSONB DEFAULT '[]'::jsonb,
  energy_insights TEXT,
  balance_score INTEGER,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.routine_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_routine_optimizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for routine_entries
CREATE POLICY "Users can view their own entries"
  ON public.routine_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entries"
  ON public.routine_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
  ON public.routine_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
  ON public.routine_entries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for ai_routine_optimizations
CREATE POLICY "Users can view their own optimizations"
  ON public.ai_routine_optimizations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own optimizations"
  ON public.ai_routine_optimizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);