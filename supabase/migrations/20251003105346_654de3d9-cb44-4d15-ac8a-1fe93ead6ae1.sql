-- Create enum for subscription tiers
CREATE TYPE public.megatalent_tier AS ENUM ('basic', 'top_premium');

-- Create table for Megatalent subscriptions
CREATE TABLE public.megatalent_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier megatalent_tier NOT NULL DEFAULT 'basic',
  price DECIMAL(10, 2) NOT NULL,
  bonus_votes INTEGER DEFAULT 0,
  win_chance_boost INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Create table for talent submissions
CREATE TABLE public.talent_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('photo', 'video')),
  votes_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create table for votes
CREATE TABLE public.talent_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.talent_submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(submission_id, user_id)
);

-- Enable RLS
ALTER TABLE public.megatalent_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for megatalent_subscriptions
CREATE POLICY "Users can view their own subscription"
  ON public.megatalent_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscription"
  ON public.megatalent_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.megatalent_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for talent_submissions
CREATE POLICY "Anyone can view active submissions"
  ON public.talent_submissions
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Subscribed users can create submissions"
  ON public.talent_submissions
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.megatalent_subscriptions 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Users can update their own submissions"
  ON public.talent_submissions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own submissions"
  ON public.talent_submissions
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for talent_votes
CREATE POLICY "Anyone can view votes"
  ON public.talent_votes
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON public.talent_votes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON public.talent_votes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update votes count
CREATE OR REPLACE FUNCTION public.update_submission_votes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.talent_submissions
    SET votes_count = votes_count + 1
    WHERE id = NEW.submission_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.talent_submissions
    SET votes_count = votes_count - 1
    WHERE id = OLD.submission_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for votes count
CREATE TRIGGER update_votes_count_on_vote
  AFTER INSERT OR DELETE ON public.talent_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_submission_votes_count();

-- Create function to add bonus votes for premium users
CREATE OR REPLACE FUNCTION public.add_premium_bonus_votes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bonus_amount INTEGER;
BEGIN
  -- Get bonus votes for the user's subscription tier
  SELECT bonus_votes INTO bonus_amount
  FROM public.megatalent_subscriptions
  WHERE user_id = NEW.user_id
    AND status = 'active'
    AND tier = 'top_premium';

  -- If user has top premium, add bonus votes
  IF bonus_amount IS NOT NULL AND bonus_amount > 0 THEN
    UPDATE public.talent_submissions
    SET votes_count = votes_count + bonus_amount
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for adding bonus votes when submission is created
CREATE TRIGGER add_bonus_votes_on_submission
  AFTER INSERT ON public.talent_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.add_premium_bonus_votes();

-- Create triggers for updated_at
CREATE TRIGGER update_megatalent_subscriptions_updated_at
  BEFORE UPDATE ON public.megatalent_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_talent_submissions_updated_at
  BEFORE UPDATE ON public.talent_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();