-- Create educational_progress table to track user learning progress
CREATE TABLE IF NOT EXISTS public.educational_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  lessons_completed INTEGER DEFAULT 0,
  total_lessons INTEGER NOT NULL,
  quiz_score INTEGER DEFAULT 0,
  quiz_attempts INTEGER DEFAULT 0,
  stars_earned INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- Create educational_quiz_answers table to track quiz attempts
CREATE TABLE IF NOT EXISTS public.educational_quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.educational_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_quiz_answers ENABLE ROW LEVEL SECURITY;

-- Create policies for educational_progress
CREATE POLICY "Users can view their own progress"
  ON public.educational_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.educational_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.educational_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policies for educational_quiz_answers
CREATE POLICY "Users can view their own quiz answers"
  ON public.educational_quiz_answers
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz answers"
  ON public.educational_quiz_answers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_educational_progress_user_id ON public.educational_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_educational_progress_topic_id ON public.educational_progress(topic_id);
CREATE INDEX IF NOT EXISTS idx_educational_quiz_answers_user_id ON public.educational_quiz_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_educational_quiz_answers_topic_id ON public.educational_quiz_answers(topic_id);

-- Create trigger for updated_at
CREATE TRIGGER update_educational_progress_updated_at
  BEFORE UPDATE ON public.educational_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();