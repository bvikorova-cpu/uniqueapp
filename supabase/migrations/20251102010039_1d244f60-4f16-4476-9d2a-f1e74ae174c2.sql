-- Create emotion_wallets table
CREATE TABLE IF NOT EXISTS public.emotion_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  joy_balance INTEGER NOT NULL DEFAULT 100,
  sadness_balance INTEGER NOT NULL DEFAULT 0,
  motivation_balance INTEGER NOT NULL DEFAULT 50,
  love_balance INTEGER NOT NULL DEFAULT 50,
  anger_balance INTEGER NOT NULL DEFAULT 0,
  fear_balance INTEGER NOT NULL DEFAULT 0,
  excitement_balance INTEGER NOT NULL DEFAULT 30,
  peace_balance INTEGER NOT NULL DEFAULT 40,
  total_mined INTEGER NOT NULL DEFAULT 0,
  total_traded INTEGER NOT NULL DEFAULT 0,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  has_insurance BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emotion_posts table
CREATE TABLE IF NOT EXISTS public.emotion_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  emotion_cost JSONB NOT NULL DEFAULT '{}',
  emotion_reward JSONB NOT NULL DEFAULT '{}',
  ai_detected_emotions JSONB NOT NULL DEFAULT '{}',
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emotion_transactions table
CREATE TABLE IF NOT EXISTS public.emotion_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell', 'trade', 'mine', 'reward')),
  emotion_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  price DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emotion_mining_activities table
CREATE TABLE IF NOT EXISTS public.emotion_mining_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  miner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  emotion_type TEXT NOT NULL,
  amount_mined INTEGER NOT NULL,
  commission_earned DECIMAL(10,2) NOT NULL DEFAULT 0,
  mining_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emotion_insurance table
CREATE TABLE IF NOT EXISTS public.emotion_insurance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coverage_level TEXT NOT NULL CHECK (coverage_level IN ('basic', 'standard', 'premium')),
  monthly_price DECIMAL(10,2) NOT NULL,
  negative_emotions_blocked INTEGER NOT NULL DEFAULT 0,
  claims_used INTEGER NOT NULL DEFAULT 0,
  max_claims INTEGER NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emotion_drops table
CREATE TABLE IF NOT EXISTS public.emotion_drops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  drop_name TEXT NOT NULL,
  description TEXT,
  emotion_type TEXT NOT NULL,
  total_amount INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  participants_count INTEGER NOT NULL DEFAULT 0,
  max_participants INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  drop_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emotion_drop_participants table
CREATE TABLE IF NOT EXISTS public.emotion_drop_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drop_id UUID NOT NULL REFERENCES public.emotion_drops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_received INTEGER NOT NULL,
  participated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(drop_id, user_id)
);

-- Create emotion_market_listings table
CREATE TABLE IF NOT EXISTS public.emotion_market_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emotion_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  price_per_unit DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emotion_subscriptions table
CREATE TABLE IF NOT EXISTS public.emotion_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('premium_wallet', 'emotion_insurance')),
  price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.emotion_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_mining_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_drop_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for emotion_wallets
CREATE POLICY "Users can view their own wallet"
  ON public.emotion_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet"
  ON public.emotion_wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet"
  ON public.emotion_wallets FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for emotion_posts
CREATE POLICY "Anyone can view posts"
  ON public.emotion_posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create posts"
  ON public.emotion_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their posts"
  ON public.emotion_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their posts"
  ON public.emotion_posts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for emotion_transactions
CREATE POLICY "Users can view their transactions"
  ON public.emotion_transactions FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create transactions"
  ON public.emotion_transactions FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- RLS Policies for emotion_mining_activities
CREATE POLICY "Miners can view their activities"
  ON public.emotion_mining_activities FOR SELECT
  USING (auth.uid() = miner_id);

CREATE POLICY "Miners can create activities"
  ON public.emotion_mining_activities FOR INSERT
  WITH CHECK (auth.uid() = miner_id);

-- RLS Policies for emotion_insurance
CREATE POLICY "Users can view their insurance"
  ON public.emotion_insurance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create insurance"
  ON public.emotion_insurance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their insurance"
  ON public.emotion_insurance FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for emotion_drops
CREATE POLICY "Anyone can view active drops"
  ON public.emotion_drops FOR SELECT
  USING (status = 'active' OR auth.uid() = creator_id);

CREATE POLICY "Users can create drops"
  ON public.emotion_drops FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their drops"
  ON public.emotion_drops FOR UPDATE
  USING (auth.uid() = creator_id);

-- RLS Policies for emotion_drop_participants
CREATE POLICY "Participants can view their participation"
  ON public.emotion_drop_participants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can participate in drops"
  ON public.emotion_drop_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for emotion_market_listings
CREATE POLICY "Anyone can view active listings"
  ON public.emotion_market_listings FOR SELECT
  USING (status = 'active' OR auth.uid() = seller_id);

CREATE POLICY "Users can create listings"
  ON public.emotion_market_listings FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their listings"
  ON public.emotion_market_listings FOR UPDATE
  USING (auth.uid() = seller_id);

-- RLS Policies for emotion_subscriptions
CREATE POLICY "Users can view their subscriptions"
  ON public.emotion_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create subscriptions"
  ON public.emotion_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their subscriptions"
  ON public.emotion_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_emotion_wallets_user_id ON public.emotion_wallets(user_id);
CREATE INDEX idx_emotion_posts_user_id ON public.emotion_posts(user_id);
CREATE INDEX idx_emotion_transactions_buyer ON public.emotion_transactions(buyer_id);
CREATE INDEX idx_emotion_transactions_seller ON public.emotion_transactions(seller_id);
CREATE INDEX idx_emotion_mining_miner ON public.emotion_mining_activities(miner_id);
CREATE INDEX idx_emotion_insurance_user ON public.emotion_insurance(user_id);
CREATE INDEX idx_emotion_drops_status ON public.emotion_drops(status);
CREATE INDEX idx_emotion_market_status ON public.emotion_market_listings(status);

-- Create function to update wallet timestamp
CREATE OR REPLACE FUNCTION public.update_emotion_wallet_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for wallet updates
CREATE TRIGGER update_emotion_wallet_time
  BEFORE UPDATE ON public.emotion_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_emotion_wallet_timestamp();