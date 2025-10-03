-- Create enum for skill categories
CREATE TYPE public.skill_category AS ENUM (
  'construction',
  'repairs',
  'cleaning',
  'gardening',
  'technology',
  'teaching',
  'creative',
  'other'
);

-- Create table for skill offerings
CREATE TABLE public.skill_offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category skill_category NOT NULL,
  price_per_hour DECIMAL(10, 2),
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create table for marketplace subscriptions (2 EUR monthly)
CREATE TABLE public.marketplace_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.skill_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for skill_offerings
CREATE POLICY "Anyone can view active skill offerings"
  ON public.skill_offerings
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Subscribed users can create skill offerings"
  ON public.skill_offerings
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.marketplace_subscriptions 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Users can update their own skill offerings"
  ON public.skill_offerings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skill offerings"
  ON public.skill_offerings
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for marketplace_subscriptions
CREATE POLICY "Users can view their own subscription"
  ON public.marketplace_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscription"
  ON public.marketplace_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.marketplace_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_skill_offerings_updated_at
  BEFORE UPDATE ON public.skill_offerings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();