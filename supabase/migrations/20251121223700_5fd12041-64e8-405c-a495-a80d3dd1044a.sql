-- Shadow Arena Platform Database Schema

-- Subscriptions table
CREATE TABLE shadow_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stories table (Echoes of Fear)
CREATE TABLE shadow_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  ai_images JSONB DEFAULT '[]',
  ai_sound_url TEXT,
  votes_count INTEGER DEFAULT 0,
  is_top_week BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Battles table
CREATE TABLE shadow_battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_prompt TEXT NOT NULL,
  challenge_theme TEXT NOT NULL,
  challenge_keywords TEXT[],
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  total_prize_pool DECIMAL(10,2) DEFAULT 0,
  winner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Battle participants
CREATE TABLE shadow_battle_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES shadow_battles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  story_title TEXT NOT NULL,
  story_content TEXT NOT NULL,
  entry_fee_paid BOOLEAN DEFAULT FALSE,
  stripe_payment_id TEXT,
  total_gifts_received DECIMAL(10,2) DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gifts/Votes table
CREATE TABLE shadow_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES shadow_battles(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES shadow_battle_participants(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  gift_type TEXT NOT NULL,
  gift_amount DECIMAL(10,2) NOT NULL,
  stripe_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credits/Quanta wallet
CREATE TABLE shadow_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  balance DECIMAL(10,2) DEFAULT 0,
  total_earned DECIMAL(10,2) DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credits transactions
CREATE TABLE shadow_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  transaction_type TEXT NOT NULL,
  description TEXT,
  battle_id UUID REFERENCES shadow_battles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE shadow_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadow_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadow_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadow_battle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadow_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadow_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadow_credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Subscriptions: users can view their own
CREATE POLICY "Users can view own subscriptions"
  ON shadow_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON shadow_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Stories: subscribers can view all, users can insert/update own
CREATE POLICY "Subscribers can view all stories"
  ON shadow_stories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shadow_subscriptions 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Users can insert own stories"
  ON shadow_stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories"
  ON shadow_stories FOR UPDATE
  USING (auth.uid() = user_id);

-- Battles: subscribers can view all
CREATE POLICY "Subscribers can view battles"
  ON shadow_battles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shadow_subscriptions 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- Battle participants: can view all, insert own
CREATE POLICY "Subscribers can view participants"
  ON shadow_battle_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shadow_subscriptions 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Users can insert own participation"
  ON shadow_battle_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Gifts: can view all, insert own
CREATE POLICY "Subscribers can view gifts"
  ON shadow_gifts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shadow_subscriptions 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Users can send gifts"
  ON shadow_gifts FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Credits: users can view/update own
CREATE POLICY "Users can view own credits"
  ON shadow_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits"
  ON shadow_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions"
  ON shadow_credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Functions and triggers
CREATE OR REPLACE FUNCTION update_shadow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shadow_subscriptions_updated_at
  BEFORE UPDATE ON shadow_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_shadow_updated_at();

CREATE TRIGGER update_shadow_stories_updated_at
  BEFORE UPDATE ON shadow_stories
  FOR EACH ROW
  EXECUTE FUNCTION update_shadow_updated_at();

CREATE TRIGGER update_shadow_credits_updated_at
  BEFORE UPDATE ON shadow_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_shadow_updated_at();