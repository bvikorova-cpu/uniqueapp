-- Create table for tracking kids homework daily usage
CREATE TABLE IF NOT EXISTS public.kids_homework_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  questions_asked_today INTEGER NOT NULL DEFAULT 0,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.kids_homework_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own usage
CREATE POLICY "Users can view own homework usage"
ON public.kids_homework_usage
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can insert their own usage record
CREATE POLICY "Users can insert own homework usage"
ON public.kids_homework_usage
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own usage
CREATE POLICY "Users can update own homework usage"
ON public.kids_homework_usage
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION public.update_kids_homework_usage_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for timestamp
CREATE TRIGGER update_kids_homework_usage_timestamp
BEFORE UPDATE ON public.kids_homework_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_kids_homework_usage_timestamp();