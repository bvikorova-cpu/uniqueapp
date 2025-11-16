-- Create past_life_regressions table
CREATE TABLE IF NOT EXISTS public.past_life_regressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  life_era TEXT NOT NULL,
  life_location TEXT NOT NULL,
  life_role TEXT NOT NULL,
  life_name TEXT,
  life_story TEXT NOT NULL,
  key_events JSONB,
  relationships JSONB,
  lessons_learned TEXT[],
  emotional_themes TEXT[],
  historical_context TEXT,
  verification_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create karmic_debts table
CREATE TABLE IF NOT EXISTS public.karmic_debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  debt_type TEXT NOT NULL,
  description TEXT NOT NULL,
  origin_life TEXT,
  severity INTEGER CHECK (severity BETWEEN 1 AND 10),
  balance_score INTEGER DEFAULT 0,
  resolution_steps JSONB,
  current_status TEXT DEFAULT 'active',
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create soul_matches table
CREATE TABLE IF NOT EXISTS public.soul_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  connection_type TEXT NOT NULL,
  past_lives_together INTEGER DEFAULT 0,
  relationship_history JSONB,
  soul_contract TEXT,
  compatibility_score INTEGER CHECK (compatibility_score BETWEEN 0 AND 100),
  karmic_lessons JSONB,
  reunion_probability INTEGER,
  match_status TEXT DEFAULT 'discovered',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Create reincarnation_plans table
CREATE TABLE IF NOT EXISTS public.reincarnation_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_name TEXT NOT NULL,
  next_life_goal TEXT NOT NULL,
  desired_era TEXT,
  desired_location TEXT,
  desired_role TEXT,
  soul_missions JSONB,
  karmic_lessons_to_complete TEXT[],
  preservation_protocol JSONB,
  destiny_mapping JSONB,
  plan_status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create soul_profiles table for matching
CREATE TABLE IF NOT EXISTS public.soul_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT,
  age INTEGER,
  location TEXT,
  spiritual_level INTEGER DEFAULT 1,
  past_lives_count INTEGER DEFAULT 0,
  karma_balance INTEGER DEFAULT 0,
  soul_age TEXT DEFAULT 'young',
  seeking_connection_types TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.past_life_regressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.karmic_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soul_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reincarnation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soul_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for past_life_regressions
CREATE POLICY "Users can view their own regressions"
  ON public.past_life_regressions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own regressions"
  ON public.past_life_regressions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for karmic_debts
CREATE POLICY "Users can view their own karmic debts"
  ON public.karmic_debts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own karmic debts"
  ON public.karmic_debts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own karmic debts"
  ON public.karmic_debts FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for soul_matches
CREATE POLICY "Users can view their soul matches"
  ON public.soul_matches FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can insert soul matches"
  ON public.soul_matches FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- RLS Policies for reincarnation_plans
CREATE POLICY "Users can view their own plans"
  ON public.reincarnation_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans"
  ON public.reincarnation_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
  ON public.reincarnation_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for soul_profiles
CREATE POLICY "Users can view active soul profiles"
  ON public.soul_profiles FOR SELECT
  USING (is_active = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.soul_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.soul_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_past_life_regressions_user_id ON public.past_life_regressions(user_id);
CREATE INDEX idx_karmic_debts_user_id ON public.karmic_debts(user_id);
CREATE INDEX idx_soul_matches_users ON public.soul_matches(user1_id, user2_id);
CREATE INDEX idx_reincarnation_plans_user_id ON public.reincarnation_plans(user_id);
CREATE INDEX idx_soul_profiles_user_id ON public.soul_profiles(user_id);