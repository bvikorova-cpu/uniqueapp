-- Create lottery_generations table
CREATE TABLE public.lottery_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lottery_type TEXT NOT NULL,
  main_numbers INTEGER[] NOT NULL,
  bonus_numbers INTEGER[],
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on lottery_generations
ALTER TABLE public.lottery_generations ENABLE ROW LEVEL SECURITY;

-- Lottery generations policies
CREATE POLICY "Users can view their own generations"
  ON public.lottery_generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generations"
  ON public.lottery_generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generations"
  ON public.lottery_generations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generations"
  ON public.lottery_generations FOR DELETE
  USING (auth.uid() = user_id);

-- Create user_subscriptions table for tracking subscription status
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_product_id TEXT,
  subscription_tier TEXT CHECK (subscription_tier IN ('basic', 'pro')),
  subscription_status TEXT CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  subscription_end TIMESTAMP WITH TIME ZONE,
  generations_used INTEGER DEFAULT 0,
  generations_limit INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- User subscriptions policies
CREATE POLICY "Users can view their own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger for user_subscriptions
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation for lottery subscriptions
CREATE OR REPLACE FUNCTION public.handle_lottery_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, generations_used, generations_limit)
  VALUES (NEW.id, 0, 10)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created_lottery ON auth.users;
CREATE TRIGGER on_auth_user_created_lottery
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_lottery_user();