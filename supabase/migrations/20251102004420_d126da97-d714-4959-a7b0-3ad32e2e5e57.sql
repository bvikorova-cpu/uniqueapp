-- Create personality_clones table
CREATE TABLE IF NOT EXISTS public.personality_clones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clone_name TEXT NOT NULL,
  personality_data JSONB NOT NULL DEFAULT '{}',
  training_status TEXT NOT NULL DEFAULT 'pending' CHECK (training_status IN ('pending', 'training', 'active', 'paused')),
  subscription_tier TEXT NOT NULL DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'advanced', 'celebrity')),
  total_conversations INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clone_conversations table
CREATE TABLE IF NOT EXISTS public.clone_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clone_id UUID NOT NULL REFERENCES public.personality_clones(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  participant_type TEXT NOT NULL DEFAULT 'user' CHECK (participant_type IN ('user', 'clone', 'anonymous')),
  messages JSONB NOT NULL DEFAULT '[]',
  session_duration INTEGER DEFAULT 0,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Create clone_dating_sessions table for clone-to-clone interactions
CREATE TABLE IF NOT EXISTS public.clone_dating_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clone_1_id UUID NOT NULL REFERENCES public.personality_clones(id) ON DELETE CASCADE,
  clone_2_id UUID NOT NULL REFERENCES public.personality_clones(id) ON DELETE CASCADE,
  session_data JSONB NOT NULL DEFAULT '{}',
  compatibility_score INTEGER CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  payment_amount DECIMAL(10,2) NOT NULL DEFAULT 4.99,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create clone_exports table for conversation exports
CREATE TABLE IF NOT EXISTS public.clone_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clone_id UUID NOT NULL REFERENCES public.personality_clones(id) ON DELETE CASCADE,
  export_data JSONB NOT NULL,
  payment_amount DECIMAL(10,2) NOT NULL DEFAULT 2.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clone_subscriptions table
CREATE TABLE IF NOT EXISTS public.clone_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clone_id UUID NOT NULL REFERENCES public.personality_clones(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('basic', 'advanced', 'celebrity')),
  price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.personality_clones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clone_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clone_dating_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clone_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clone_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for personality_clones
CREATE POLICY "Users can view all active clones"
  ON public.personality_clones FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can create their own clones"
  ON public.personality_clones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clones"
  ON public.personality_clones FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clones"
  ON public.personality_clones FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for clone_conversations
CREATE POLICY "Users can view their clone conversations"
  ON public.clone_conversations FOR SELECT
  USING (
    clone_id IN (SELECT id FROM public.personality_clones WHERE user_id = auth.uid())
    OR participant_id = auth.uid()
  );

CREATE POLICY "Anyone can create conversations with active clones"
  ON public.clone_conversations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Participants can update their conversations"
  ON public.clone_conversations FOR UPDATE
  USING (
    clone_id IN (SELECT id FROM public.personality_clones WHERE user_id = auth.uid())
    OR participant_id = auth.uid()
  );

-- RLS Policies for clone_dating_sessions
CREATE POLICY "Users can view their clone dating sessions"
  ON public.clone_dating_sessions FOR SELECT
  USING (
    clone_1_id IN (SELECT id FROM public.personality_clones WHERE user_id = auth.uid())
    OR clone_2_id IN (SELECT id FROM public.personality_clones WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create dating sessions for their clones"
  ON public.clone_dating_sessions FOR INSERT
  WITH CHECK (
    clone_1_id IN (SELECT id FROM public.personality_clones WHERE user_id = auth.uid())
    OR clone_2_id IN (SELECT id FROM public.personality_clones WHERE user_id = auth.uid())
  );

-- RLS Policies for clone_exports
CREATE POLICY "Users can view their own exports"
  ON public.clone_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exports"
  ON public.clone_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for clone_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.clone_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
  ON public.clone_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON public.clone_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_personality_clones_user_id ON public.personality_clones(user_id);
CREATE INDEX idx_personality_clones_active ON public.personality_clones(is_active);
CREATE INDEX idx_clone_conversations_clone_id ON public.clone_conversations(clone_id);
CREATE INDEX idx_clone_conversations_participant ON public.clone_conversations(participant_id);
CREATE INDEX idx_clone_dating_sessions_clones ON public.clone_dating_sessions(clone_1_id, clone_2_id);
CREATE INDEX idx_clone_subscriptions_user_id ON public.clone_subscriptions(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_personality_clone_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_personality_clones_updated_at
  BEFORE UPDATE ON public.personality_clones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_personality_clone_updated_at();