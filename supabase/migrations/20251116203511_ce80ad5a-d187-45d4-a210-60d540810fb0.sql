-- DNA Memory Network Tables

-- DNA Analyses table
CREATE TABLE IF NOT EXISTS public.dna_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sample_id TEXT NOT NULL,
  analysis_data JSONB,
  heritage_breakdown JSONB,
  health_markers JSONB,
  genetic_traits JSONB,
  family_tree_data JSONB,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Ancestral Memories table
CREATE TABLE IF NOT EXISTS public.ancestral_memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dna_analysis_id UUID REFERENCES public.dna_analyses(id) ON DELETE CASCADE,
  ancestor_name TEXT,
  ancestor_era TEXT,
  ancestor_location TEXT,
  memory_story TEXT,
  memory_type TEXT,
  historical_context TEXT,
  restored_photo_url TEXT,
  voice_synthesis_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Genetic Dating Profiles table
CREATE TABLE IF NOT EXISTS public.genetic_dating_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  dna_analysis_id UUID REFERENCES public.dna_analyses(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  age INTEGER,
  location TEXT,
  photo_url TEXT,
  genetic_traits JSONB,
  health_compatibility JSONB,
  personality_dna JSONB,
  preferences JSONB,
  is_active BOOLEAN DEFAULT true,
  subscription_active BOOLEAN DEFAULT false,
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Genetic Matches table
CREATE TABLE IF NOT EXISTS public.genetic_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  compatibility_score INTEGER,
  genetic_compatibility JSONB,
  health_compatibility JSONB,
  personality_compatibility JSONB,
  offspring_predictions JSONB,
  match_status TEXT DEFAULT 'pending',
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_user1 FOREIGN KEY (user1_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user2 FOREIGN KEY (user2_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Digital Offspring table
CREATE TABLE IF NOT EXISTS public.digital_offspring (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dna_analysis_id UUID REFERENCES public.dna_analyses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  voice_profile_url TEXT,
  personality_data JSONB,
  genetic_traits JSONB,
  memory_data JSONB,
  learning_progress JSONB,
  system_prompt TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_interaction_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Digital Offspring Conversations table
CREATE TABLE IF NOT EXISTS public.digital_offspring_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offspring_id UUID NOT NULL REFERENCES public.digital_offspring(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.dna_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ancestral_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genetic_dating_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genetic_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_offspring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_offspring_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dna_analyses
CREATE POLICY "Users can view their own DNA analyses"
  ON public.dna_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own DNA analyses"
  ON public.dna_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own DNA analyses"
  ON public.dna_analyses FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for ancestral_memories
CREATE POLICY "Users can view their own ancestral memories"
  ON public.ancestral_memories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ancestral memories"
  ON public.ancestral_memories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for genetic_dating_profiles
CREATE POLICY "Users can view active dating profiles"
  ON public.genetic_dating_profiles FOR SELECT
  USING (is_active = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own dating profile"
  ON public.genetic_dating_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dating profile"
  ON public.genetic_dating_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for genetic_matches
CREATE POLICY "Users can view their own matches"
  ON public.genetic_matches FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can insert matches"
  ON public.genetic_matches FOR INSERT
  WITH CHECK (true);

-- RLS Policies for digital_offspring
CREATE POLICY "Users can view their own digital offspring"
  ON public.digital_offspring FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own digital offspring"
  ON public.digital_offspring FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own digital offspring"
  ON public.digital_offspring FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for digital_offspring_conversations
CREATE POLICY "Users can view their offspring conversations"
  ON public.digital_offspring_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their offspring conversations"
  ON public.digital_offspring_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_dna_analyses_user_id ON public.dna_analyses(user_id);
CREATE INDEX idx_ancestral_memories_user_id ON public.ancestral_memories(user_id);
CREATE INDEX idx_genetic_dating_profiles_user_id ON public.genetic_dating_profiles(user_id);
CREATE INDEX idx_genetic_dating_profiles_active ON public.genetic_dating_profiles(is_active);
CREATE INDEX idx_genetic_matches_user1_id ON public.genetic_matches(user1_id);
CREATE INDEX idx_genetic_matches_user2_id ON public.genetic_matches(user2_id);
CREATE INDEX idx_digital_offspring_user_id ON public.digital_offspring(user_id);
CREATE INDEX idx_digital_offspring_conversations_offspring_id ON public.digital_offspring_conversations(offspring_id);