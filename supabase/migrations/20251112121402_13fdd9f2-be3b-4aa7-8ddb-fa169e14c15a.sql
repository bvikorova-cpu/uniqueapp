-- Create brain_duel_credits table
CREATE TABLE IF NOT EXISTS public.brain_duel_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.brain_duel_credits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own brain duel credits"
ON public.brain_duel_credits
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brain duel credits"
ON public.brain_duel_credits
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brain duel credits"
ON public.brain_duel_credits
FOR UPDATE
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_brain_duel_credits_updated_at
BEFORE UPDATE ON public.brain_duel_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_brain_duel_credits_user_id ON public.brain_duel_credits(user_id);