-- Create kids_reading_usage table to track user usage and limits
CREATE TABLE IF NOT EXISTS public.kids_reading_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  analyses_used INTEGER NOT NULL DEFAULT 0,
  analyses_limit INTEGER NOT NULL DEFAULT 10,
  quizzes_used INTEGER NOT NULL DEFAULT 0,
  quizzes_limit INTEGER NOT NULL DEFAULT 10,
  subscription_start DATE,
  subscription_end DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kids_reading_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for kids_reading_usage
CREATE POLICY "Users can view their own reading usage"
  ON public.kids_reading_usage
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading usage"
  ON public.kids_reading_usage
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading usage"
  ON public.kids_reading_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create trigger to update timestamp
CREATE TRIGGER update_kids_reading_usage_timestamp
  BEFORE UPDATE ON public.kids_reading_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_kids_drawing_usage_timestamp();