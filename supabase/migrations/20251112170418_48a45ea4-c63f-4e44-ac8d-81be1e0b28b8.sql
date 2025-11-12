-- Create daily challenges table
CREATE TABLE public.kids_homework_daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_date DATE NOT NULL UNIQUE,
  challenge_type TEXT NOT NULL,
  challenge_title TEXT NOT NULL,
  challenge_description TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  bonus_points INTEGER NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user challenge completions table
CREATE TABLE public.kids_homework_challenge_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES kids_homework_daily_challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  bonus_earned INTEGER NOT NULL,
  UNIQUE(user_id, challenge_id)
);

-- Create user daily progress tracking table
CREATE TABLE public.kids_homework_daily_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_date DATE NOT NULL,
  questions_today INTEGER NOT NULL DEFAULT 0,
  subjects_today TEXT[] NOT NULL DEFAULT '{}',
  perfect_answers INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_date)
);

-- Enable RLS
ALTER TABLE public.kids_homework_daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kids_homework_challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kids_homework_daily_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily challenges
CREATE POLICY "Anyone can view daily challenges"
  ON public.kids_homework_daily_challenges FOR SELECT
  USING (true);

-- RLS Policies for challenge completions
CREATE POLICY "Users can view their own completions"
  ON public.kids_homework_challenge_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions"
  ON public.kids_homework_challenge_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for daily progress
CREATE POLICY "Users can view their own progress"
  ON public.kids_homework_daily_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.kids_homework_daily_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.kids_homework_daily_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at on daily progress
CREATE TRIGGER update_kids_homework_daily_progress_updated_at
  BEFORE UPDATE ON public.kids_homework_daily_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate daily challenge
CREATE OR REPLACE FUNCTION public.generate_daily_homework_challenge()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_challenge_exists BOOLEAN;
  v_challenge_type TEXT;
  v_random INTEGER;
BEGIN
  -- Check if today's challenge already exists
  SELECT EXISTS(
    SELECT 1 FROM kids_homework_daily_challenges 
    WHERE challenge_date = v_today
  ) INTO v_challenge_exists;
  
  IF v_challenge_exists THEN
    RETURN;
  END IF;
  
  -- Randomly select challenge type
  v_random := FLOOR(RANDOM() * 6) + 1;
  
  CASE v_random
    WHEN 1 THEN
      -- Answer 3 questions today
      INSERT INTO kids_homework_daily_challenges (
        challenge_date, challenge_type, challenge_title, challenge_description,
        requirement_value, bonus_points, icon
      ) VALUES (
        v_today, 'questions_count', 'Daily Learner',
        'Answer 3 homework questions today',
        3, 30, '🎯'
      );
    WHEN 2 THEN
      -- Try 2 different subjects
      INSERT INTO kids_homework_daily_challenges (
        challenge_date, challenge_type, challenge_title, challenge_description,
        requirement_value, bonus_points, icon
      ) VALUES (
        v_today, 'diverse_subjects', 'Subject Explorer',
        'Ask questions from 2 different subjects today',
        2, 40, '🌈'
      );
    WHEN 3 THEN
      -- Answer 5 questions
      INSERT INTO kids_homework_daily_challenges (
        challenge_date, challenge_type, challenge_title, challenge_description,
        requirement_value, bonus_points, icon
      ) VALUES (
        v_today, 'questions_count', 'Super Student',
        'Complete 5 homework questions today',
        5, 50, '⚡'
      );
    WHEN 4 THEN
      -- Focus on one subject - 3 questions
      INSERT INTO kids_homework_daily_challenges (
        challenge_date, challenge_type, challenge_title, challenge_description,
        requirement_value, bonus_points, icon
      ) VALUES (
        v_today, 'subject_focus', 'Subject Master',
        'Answer 3 questions from the same subject',
        3, 35, '🎓'
      );
    WHEN 5 THEN
      -- Early bird challenge
      INSERT INTO kids_homework_daily_challenges (
        challenge_date, challenge_type, challenge_title, challenge_description,
        requirement_value, bonus_points, icon
      ) VALUES (
        v_today, 'questions_count', 'Early Bird',
        'Complete your first question before noon',
        1, 25, '🌅'
      );
    ELSE
      -- Weekend warrior
      INSERT INTO kids_homework_daily_challenges (
        challenge_date, challenge_type, challenge_title, challenge_description,
        requirement_value, bonus_points, icon
      ) VALUES (
        v_today, 'questions_count', 'Knowledge Seeker',
        'Ask 2 questions today to keep learning',
        2, 20, '📚'
      );
  END CASE;
END;
$$;