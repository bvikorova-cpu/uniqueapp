-- Create comedy coins/currency table
CREATE TABLE IF NOT EXISTS public.comedy_currency (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  coins INTEGER NOT NULL DEFAULT 0,
  total_coins_purchased INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT coins_non_negative CHECK (coins >= 0)
);

-- Create comedian profiles
CREATE TABLE IF NOT EXISTS public.comedian_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  stage_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  total_shows INTEGER NOT NULL DEFAULT 0,
  total_earnings INTEGER NOT NULL DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  follower_count INTEGER NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  experience_level TEXT NOT NULL DEFAULT 'beginner',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_experience CHECK (experience_level IN ('beginner', 'intermediate', 'professional', 'legendary'))
);

-- Create comedy shows/performances
CREATE TABLE IF NOT EXISTS public.comedy_shows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comedian_id UUID NOT NULL REFERENCES public.comedian_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  show_type TEXT NOT NULL DEFAULT 'standup',
  ticket_price_coins INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'scheduled',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  viewer_count INTEGER NOT NULL DEFAULT 0,
  total_revenue INTEGER NOT NULL DEFAULT 0,
  stream_url TEXT,
  thumbnail_url TEXT,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_show_type CHECK (show_type IN ('standup', 'roast', 'open_mic', 'battle', 'special')),
  CONSTRAINT valid_status CHECK (status IN ('scheduled', 'live', 'finished', 'cancelled'))
);

-- Create show tickets/purchases
CREATE TABLE IF NOT EXISTS public.comedy_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id UUID NOT NULL REFERENCES public.comedy_shows(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  price_paid INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attended BOOLEAN NOT NULL DEFAULT false,
  rating INTEGER,
  review TEXT,
  CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5),
  UNIQUE(show_id, user_id)
);

-- Create comedy battles/tournaments
CREATE TABLE IF NOT EXISTS public.comedy_battles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  entry_fee_coins INTEGER NOT NULL DEFAULT 100,
  prize_pool_coins INTEGER NOT NULL DEFAULT 0,
  max_participants INTEGER NOT NULL DEFAULT 8,
  status TEXT NOT NULL DEFAULT 'registration',
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE,
  winner_id UUID REFERENCES public.comedian_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_battle_status CHECK (status IN ('registration', 'live', 'voting', 'finished'))
);

-- Create battle participants
CREATE TABLE IF NOT EXISTS public.battle_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  battle_id UUID NOT NULL REFERENCES public.comedy_battles(id) ON DELETE CASCADE,
  comedian_id UUID NOT NULL REFERENCES public.comedian_profiles(id) ON DELETE CASCADE,
  performance_url TEXT,
  vote_count INTEGER NOT NULL DEFAULT 0,
  placement INTEGER,
  prize_won INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(battle_id, comedian_id)
);

-- Create battle votes
CREATE TABLE IF NOT EXISTS public.battle_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  battle_id UUID NOT NULL REFERENCES public.comedy_battles(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.battle_participants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_cost_coins INTEGER NOT NULL DEFAULT 10,
  voted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(battle_id, user_id)
);

-- Create comedy clips (video marketplace)
CREATE TABLE IF NOT EXISTS public.comedy_clips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comedian_id UUID NOT NULL REFERENCES public.comedian_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER NOT NULL,
  price_coins INTEGER NOT NULL DEFAULT 10,
  views_count INTEGER NOT NULL DEFAULT 0,
  purchase_count INTEGER NOT NULL DEFAULT 0,
  total_revenue INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clip purchases
CREATE TABLE IF NOT EXISTS public.clip_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clip_id UUID NOT NULL REFERENCES public.comedy_clips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  price_paid INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clip_id, user_id)
);

-- Create tips/donations
CREATE TABLE IF NOT EXISTS public.comedy_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL,
  to_comedian_id UUID NOT NULL REFERENCES public.comedian_profiles(id) ON DELETE CASCADE,
  show_id UUID REFERENCES public.comedy_shows(id) ON DELETE SET NULL,
  amount_coins INTEGER NOT NULL,
  message TEXT,
  tip_type TEXT NOT NULL DEFAULT 'applause',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_tip_type CHECK (tip_type IN ('applause', 'flowers', 'mic_drop', 'standing_ovation', 'custom')),
  CONSTRAINT positive_amount CHECK (amount_coins > 0)
);

-- Create comedian earnings/withdrawals
CREATE TABLE IF NOT EXISTS public.comedian_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comedian_id UUID NOT NULL REFERENCES public.comedian_profiles(id) ON DELETE CASCADE,
  amount_coins INTEGER NOT NULL,
  source_type TEXT NOT NULL,
  source_id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_source CHECK (source_type IN ('show', 'tip', 'battle', 'clip', 'subscription', 'bonus'))
);

-- Create comedian followers
CREATE TABLE IF NOT EXISTS public.comedian_followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comedian_id UUID NOT NULL REFERENCES public.comedian_profiles(id) ON DELETE CASCADE,
  follower_user_id UUID NOT NULL,
  followed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comedian_id, follower_user_id)
);

-- Create comedy subscriptions (monthly access)
CREATE TABLE IF NOT EXISTS public.comedy_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  tier TEXT NOT NULL DEFAULT 'vip',
  status TEXT NOT NULL DEFAULT 'active',
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_tier CHECK (tier IN ('vip', 'premium', 'platinum')),
  CONSTRAINT valid_sub_status CHECK (status IN ('active', 'cancelled', 'expired'))
);

-- Enable RLS
ALTER TABLE public.comedy_currency ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comedian_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comedy_shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comedy_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comedy_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comedy_clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clip_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comedy_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comedian_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comedian_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comedy_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comedy_currency
DROP POLICY IF EXISTS "Users can view own currency" ON public.comedy_currency;
DROP POLICY IF EXISTS "Users can update own currency" ON public.comedy_currency;
DROP POLICY IF EXISTS "Users can insert own currency" ON public.comedy_currency;

CREATE POLICY "Users can view own currency" ON public.comedy_currency FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own currency" ON public.comedy_currency FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own currency" ON public.comedy_currency FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for comedian_profiles
DROP POLICY IF EXISTS "Anyone can view comedian profiles" ON public.comedian_profiles;
DROP POLICY IF EXISTS "Comedians can manage own profile" ON public.comedian_profiles;

CREATE POLICY "Anyone can view comedian profiles" ON public.comedian_profiles FOR SELECT USING (true);
CREATE POLICY "Comedians can manage own profile" ON public.comedian_profiles FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for comedy_shows
DROP POLICY IF EXISTS "Anyone can view shows" ON public.comedy_shows;
DROP POLICY IF EXISTS "Comedians can manage own shows" ON public.comedy_shows;

CREATE POLICY "Anyone can view shows" ON public.comedy_shows FOR SELECT USING (true);
CREATE POLICY "Comedians can manage own shows" ON public.comedy_shows FOR ALL USING (
  EXISTS (SELECT 1 FROM public.comedian_profiles WHERE id = comedy_shows.comedian_id AND user_id = auth.uid())
);

-- RLS Policies for comedy_tickets
DROP POLICY IF EXISTS "Users can view own tickets" ON public.comedy_tickets;
DROP POLICY IF EXISTS "Users can purchase tickets" ON public.comedy_tickets;

CREATE POLICY "Users can view own tickets" ON public.comedy_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can purchase tickets" ON public.comedy_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tickets" ON public.comedy_tickets FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for comedy_battles
DROP POLICY IF EXISTS "Anyone can view battles" ON public.comedy_battles;

CREATE POLICY "Anyone can view battles" ON public.comedy_battles FOR SELECT USING (true);

-- RLS Policies for battle_participants
DROP POLICY IF EXISTS "Anyone can view participants" ON public.battle_participants;
DROP POLICY IF EXISTS "Comedians can join battles" ON public.battle_participants;

CREATE POLICY "Anyone can view participants" ON public.battle_participants FOR SELECT USING (true);
CREATE POLICY "Comedians can join battles" ON public.battle_participants FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.comedian_profiles WHERE id = comedian_id AND user_id = auth.uid())
);

-- RLS Policies for battle_votes
DROP POLICY IF EXISTS "Users can view votes" ON public.battle_votes;
DROP POLICY IF EXISTS "Users can vote" ON public.battle_votes;

CREATE POLICY "Users can view votes" ON public.battle_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote" ON public.battle_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for comedy_clips
DROP POLICY IF EXISTS "Anyone can view clips" ON public.comedy_clips;
DROP POLICY IF EXISTS "Comedians can manage clips" ON public.comedy_clips;

CREATE POLICY "Anyone can view clips" ON public.comedy_clips FOR SELECT USING (true);
CREATE POLICY "Comedians can manage clips" ON public.comedy_clips FOR ALL USING (
  EXISTS (SELECT 1 FROM public.comedian_profiles WHERE id = comedian_id AND user_id = auth.uid())
);

-- RLS Policies for clip_purchases
DROP POLICY IF EXISTS "Users can view own purchases" ON public.clip_purchases;
DROP POLICY IF EXISTS "Users can purchase clips" ON public.clip_purchases;

CREATE POLICY "Users can view own purchases" ON public.clip_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can purchase clips" ON public.clip_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for comedy_tips
DROP POLICY IF EXISTS "Anyone can view tips" ON public.comedy_tips;
DROP POLICY IF EXISTS "Users can send tips" ON public.comedy_tips;

CREATE POLICY "Anyone can view tips" ON public.comedy_tips FOR SELECT USING (true);
CREATE POLICY "Users can send tips" ON public.comedy_tips FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- RLS Policies for comedian_earnings
DROP POLICY IF EXISTS "Comedians can view own earnings" ON public.comedian_earnings;

CREATE POLICY "Comedians can view own earnings" ON public.comedian_earnings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.comedian_profiles WHERE id = comedian_id AND user_id = auth.uid())
);

-- RLS Policies for comedian_followers
DROP POLICY IF EXISTS "Anyone can view followers" ON public.comedian_followers;
DROP POLICY IF EXISTS "Users can follow" ON public.comedian_followers;

CREATE POLICY "Anyone can view followers" ON public.comedian_followers FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.comedian_followers FOR ALL USING (auth.uid() = follower_user_id);

-- RLS Policies for comedy_subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON public.comedy_subscriptions;
DROP POLICY IF EXISTS "Users can manage subscription" ON public.comedy_subscriptions;

CREATE POLICY "Users can view own subscription" ON public.comedy_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage subscription" ON public.comedy_subscriptions FOR ALL USING (auth.uid() = user_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_comedy_currency_updated_at ON public.comedy_currency;
DROP TRIGGER IF EXISTS update_comedian_profiles_updated_at ON public.comedian_profiles;
DROP TRIGGER IF EXISTS update_comedy_clips_updated_at ON public.comedy_clips;

CREATE TRIGGER update_comedy_currency_updated_at BEFORE UPDATE ON public.comedy_currency
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comedian_profiles_updated_at BEFORE UPDATE ON public.comedian_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comedy_clips_updated_at BEFORE UPDATE ON public.comedy_clips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comedy_currency_user_id ON public.comedy_currency(user_id);
CREATE INDEX IF NOT EXISTS idx_comedian_profiles_user_id ON public.comedian_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_comedy_shows_comedian_id ON public.comedy_shows(comedian_id);
CREATE INDEX IF NOT EXISTS idx_comedy_shows_status ON public.comedy_shows(status);
CREATE INDEX IF NOT EXISTS idx_comedy_tickets_user_id ON public.comedy_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_comedy_tickets_show_id ON public.comedy_tickets(show_id);
CREATE INDEX IF NOT EXISTS idx_battle_participants_battle_id ON public.battle_participants(battle_id);
CREATE INDEX IF NOT EXISTS idx_comedy_clips_comedian_id ON public.comedy_clips(comedian_id);
CREATE INDEX IF NOT EXISTS idx_comedy_tips_comedian_id ON public.comedy_tips(to_comedian_id);
CREATE INDEX IF NOT EXISTS idx_comedian_earnings_comedian_id ON public.comedian_earnings(comedian_id);