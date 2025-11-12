-- Create table for friend challenge achievements
CREATE TABLE IF NOT EXISTS public.brain_duel_friend_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, achievement_type)
);

-- Enable RLS
ALTER TABLE public.brain_duel_friend_achievements ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all achievements"
  ON public.brain_duel_friend_achievements
  FOR SELECT
  USING (true);

CREATE POLICY "System can insert achievements"
  ON public.brain_duel_friend_achievements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add index for better performance
CREATE INDEX idx_brain_duel_friend_achievements_user_id 
  ON public.brain_duel_friend_achievements(user_id);

CREATE INDEX idx_brain_duel_friend_achievements_type 
  ON public.brain_duel_friend_achievements(achievement_type);