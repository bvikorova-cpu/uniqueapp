-- Create table for tracking Teen Career Counselor usage
CREATE TABLE IF NOT EXISTS public.teen_career_counselor_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  free_generations_used INTEGER NOT NULL DEFAULT 0,
  paid_generations INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.teen_career_counselor_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own usage"
  ON public.teen_career_counselor_usage
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON public.teen_career_counselor_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
  ON public.teen_career_counselor_usage
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_teen_career_counselor_usage_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_teen_career_counselor_usage_updated_at
  BEFORE UPDATE ON public.teen_career_counselor_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_teen_career_counselor_usage_timestamp();

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_teen_career_counselor_usage_user_id 
  ON public.teen_career_counselor_usage(user_id);