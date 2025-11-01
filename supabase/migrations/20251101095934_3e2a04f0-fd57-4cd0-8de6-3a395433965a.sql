-- Create astrology credits table
CREATE TABLE IF NOT EXISTS public.astrology_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.astrology_credits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own astrology credits"
ON public.astrology_credits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own astrology credits"
ON public.astrology_credits FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own astrology credits"
ON public.astrology_credits FOR UPDATE
USING (auth.uid() = user_id);

-- Create dream interpretations table
CREATE TABLE IF NOT EXISTS public.dream_interpretations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dream_description TEXT NOT NULL,
  interpretation TEXT NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dream_interpretations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own dream interpretations"
ON public.dream_interpretations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dream interpretations"
ON public.dream_interpretations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create palmistry readings table
CREATE TABLE IF NOT EXISTS public.palmistry_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  reading TEXT NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.palmistry_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own palmistry readings"
ON public.palmistry_readings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own palmistry readings"
ON public.palmistry_readings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create yes/no questions table
CREATE TABLE IF NOT EXISTS public.universe_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  explanation TEXT,
  credits_used INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.universe_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own universe questions"
ON public.universe_questions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own universe questions"
ON public.universe_questions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create rune readings table
CREATE TABLE IF NOT EXISTS public.rune_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rune_name TEXT NOT NULL,
  rune_meaning TEXT NOT NULL,
  guidance TEXT NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rune_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rune readings"
ON public.rune_readings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rune readings"
ON public.rune_readings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create astrology subscriptions table for unlimited chat
CREATE TABLE IF NOT EXISTS public.astrology_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_type TEXT NOT NULL DEFAULT 'unlimited_chat',
  active BOOLEAN NOT NULL DEFAULT true,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, subscription_type)
);

ALTER TABLE public.astrology_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own astrology subscriptions"
ON public.astrology_subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_astrology_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_astrology_credits_updated_at
BEFORE UPDATE ON public.astrology_credits
FOR EACH ROW
EXECUTE FUNCTION update_astrology_credits_updated_at();