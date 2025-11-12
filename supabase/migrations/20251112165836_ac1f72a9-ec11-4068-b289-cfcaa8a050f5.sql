-- Create kids homework points table
CREATE TABLE public.kids_homework_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  questions_answered INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create achievements/badges table
CREATE TABLE public.kids_homework_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  points_required INTEGER NOT NULL,
  achievement_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user achievements table
CREATE TABLE public.kids_homework_user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES kids_homework_achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.kids_homework_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kids_homework_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kids_homework_user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for points
CREATE POLICY "Users can view their own points"
  ON public.kids_homework_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own points"
  ON public.kids_homework_points FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points"
  ON public.kids_homework_points FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for achievements
CREATE POLICY "Anyone can view achievements"
  ON public.kids_homework_achievements FOR SELECT
  USING (true);

-- RLS Policies for user achievements
CREATE POLICY "Users can view their own achievements"
  ON public.kids_homework_user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON public.kids_homework_user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_kids_homework_points_updated_at
  BEFORE UPDATE ON public.kids_homework_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default achievements
INSERT INTO public.kids_homework_achievements (name, description, icon, points_required, achievement_type) VALUES
  ('First Steps', 'Complete your first homework question!', '🌟', 10, 'questions'),
  ('Learning Star', 'Answer 5 homework questions', '⭐', 50, 'questions'),
  ('Homework Hero', 'Answer 10 homework questions', '🏆', 100, 'questions'),
  ('Knowledge Master', 'Answer 25 homework questions', '👑', 250, 'questions'),
  ('Weekend Warrior', 'Maintain a 3-day learning streak', '🔥', 30, 'streak'),
  ('Dedication Champion', 'Maintain a 7-day learning streak', '💪', 70, 'streak'),
  ('Math Wizard', 'Answer 5 math questions', '🧮', 50, 'subject_math'),
  ('Science Explorer', 'Answer 5 science questions', '🔬', 50, 'subject_science'),
  ('Word Master', 'Answer 5 English questions', '📚', 50, 'subject_english'),
  ('Century Club', 'Earn 100 total points', '💯', 100, 'points'),
  ('Point Collector', 'Earn 250 total points', '💎', 250, 'points'),
  ('Super Learner', 'Earn 500 total points', '🚀', 500, 'points');