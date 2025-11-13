-- Create table for tracking kids drawing buddy usage
CREATE TABLE IF NOT EXISTS public.kids_drawing_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tutorials_used INTEGER DEFAULT 0,
  tutorials_limit INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.kids_drawing_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own drawing usage"
  ON public.kids_drawing_usage
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own drawing usage"
  ON public.kids_drawing_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drawing usage"
  ON public.kids_drawing_usage
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create table for kids drawing subscriptions
CREATE TABLE IF NOT EXISTS public.kids_drawing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.kids_drawing_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own drawing subscription"
  ON public.kids_drawing_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own drawing subscription"
  ON public.kids_drawing_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drawing subscription"
  ON public.kids_drawing_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_kids_drawing_usage_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for kids_drawing_usage
CREATE TRIGGER update_kids_drawing_usage_updated_at
  BEFORE UPDATE ON public.kids_drawing_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_kids_drawing_usage_timestamp();

-- Trigger for kids_drawing_subscriptions
CREATE TRIGGER update_kids_drawing_subscription_updated_at
  BEFORE UPDATE ON public.kids_drawing_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_kids_drawing_usage_timestamp();