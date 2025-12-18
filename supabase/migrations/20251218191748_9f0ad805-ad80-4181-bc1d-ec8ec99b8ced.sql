-- Create emotion credits table for AI analysis monetization
CREATE TABLE IF NOT EXISTS public.emotion_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  credits_remaining INTEGER NOT NULL DEFAULT 10,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  total_credits_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT emotion_credits_user_id_unique UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.emotion_credits ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own emotion credits"
  ON public.emotion_credits
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own emotion credits"
  ON public.emotion_credits
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emotion credits"
  ON public.emotion_credits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_emotion_credits_updated_at
  BEFORE UPDATE ON public.emotion_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();