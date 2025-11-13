-- Create table for Kids Science Lab subscription and usage tracking
CREATE TABLE IF NOT EXISTS public.kids_science_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experiments_this_month INTEGER NOT NULL DEFAULT 0,
  subscription_status TEXT CHECK (subscription_status IN ('free', 'premium')) DEFAULT 'free',
  product_id TEXT,
  subscription_end TIMESTAMP WITH TIME ZONE,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.kids_science_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own science usage"
ON public.kids_science_usage
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own science usage"
ON public.kids_science_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own science usage"
ON public.kids_science_usage
FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_kids_science_usage_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_kids_science_usage_updated_at
BEFORE UPDATE ON public.kids_science_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_kids_science_usage_timestamp();

-- Create index for faster queries
CREATE INDEX idx_kids_science_usage_user_id ON public.kids_science_usage(user_id);