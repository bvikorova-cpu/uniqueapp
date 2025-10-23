-- Create collectible categories table
CREATE TABLE public.collectible_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collectible rarities table
CREATE TABLE public.collectible_rarities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  level INTEGER NOT NULL,
  color TEXT NOT NULL,
  drop_rate DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collectibles table (template/master items)
CREATE TABLE public.collectibles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category_id UUID REFERENCES public.collectible_categories(id),
  rarity_id UUID REFERENCES public.collectible_rarities(id),
  properties JSONB DEFAULT '{}',
  is_seasonal BOOLEAN DEFAULT false,
  season_start DATE,
  season_end DATE,
  is_active BOOLEAN DEFAULT true,
  generation_cost INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user collectibles table (owned instances)
CREATE TABLE public.user_collectibles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  collectible_id UUID REFERENCES public.collectibles(id),
  unique_properties JSONB DEFAULT '{}',
  acquired_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  acquired_method TEXT NOT NULL, -- 'generated', 'mystery_box', 'trade', 'auction'
  is_for_sale BOOLEAN DEFAULT false,
  is_for_trade BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collectible trades table
CREATE TABLE public.collectible_trades_new (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  sender_collectible_ids UUID[] NOT NULL,
  receiver_collectible_ids UUID[] NOT NULL,
  sender_credits INTEGER DEFAULT 0,
  receiver_credits INTEGER DEFAULT 0,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create auctions table
CREATE TABLE public.collectible_auctions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL,
  user_collectible_id UUID REFERENCES public.user_collectibles(id),
  starting_price INTEGER NOT NULL,
  current_price INTEGER NOT NULL,
  buyout_price INTEGER,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'sold', 'expired', 'cancelled'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create auction bids table
CREATE TABLE public.collectible_bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID REFERENCES public.collectible_auctions(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collector pass subscriptions table
CREATE TABLE public.collector_pass_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tier TEXT NOT NULL, -- 'basic', 'premium'
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_daily_reward_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collectible_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collectible_rarities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collectibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_collectibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collectible_trades_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collectible_auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collectible_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collector_pass_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read)
CREATE POLICY "Categories are viewable by everyone"
  ON public.collectible_categories FOR SELECT
  USING (true);

-- RLS Policies for rarities (public read)
CREATE POLICY "Rarities are viewable by everyone"
  ON public.collectible_rarities FOR SELECT
  USING (true);

-- RLS Policies for collectibles (public read active items)
CREATE POLICY "Active collectibles are viewable by everyone"
  ON public.collectibles FOR SELECT
  USING (is_active = true);

-- RLS Policies for user collectibles
CREATE POLICY "Users can view their own collectibles"
  ON public.user_collectibles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view collectibles for sale/trade"
  ON public.user_collectibles FOR SELECT
  USING (is_for_sale = true OR is_for_trade = true);

CREATE POLICY "Users can insert their own collectibles"
  ON public.user_collectibles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collectibles"
  ON public.user_collectibles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for trades
CREATE POLICY "Users can view trades they are part of"
  ON public.collectible_trades_new FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create trades"
  ON public.collectible_trades_new FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update trades they are part of"
  ON public.collectible_trades_new FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- RLS Policies for auctions
CREATE POLICY "Active auctions are viewable by everyone"
  ON public.collectible_auctions FOR SELECT
  USING (status = 'active' OR auth.uid() = seller_id);

CREATE POLICY "Users can create auctions for their items"
  ON public.collectible_auctions FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their auctions"
  ON public.collectible_auctions FOR UPDATE
  USING (auth.uid() = seller_id);

-- RLS Policies for bids
CREATE POLICY "Auction bids are viewable by everyone"
  ON public.collectible_bids FOR SELECT
  USING (true);

CREATE POLICY "Users can place bids"
  ON public.collectible_bids FOR INSERT
  WITH CHECK (auth.uid() = bidder_id);

-- RLS Policies for collector pass
CREATE POLICY "Users can view their own collector pass"
  ON public.collector_pass_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collector pass"
  ON public.collector_pass_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collector pass"
  ON public.collector_pass_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_collectibles_user_id ON public.user_collectibles(user_id);
CREATE INDEX idx_user_collectibles_collectible_id ON public.user_collectibles(collectible_id);
CREATE INDEX idx_collectible_trades_new_sender ON public.collectible_trades_new(sender_id);
CREATE INDEX idx_collectible_trades_new_receiver ON public.collectible_trades_new(receiver_id);
CREATE INDEX idx_collectible_auctions_status ON public.collectible_auctions(status);
CREATE INDEX idx_collectible_auctions_expires ON public.collectible_auctions(expires_at);
CREATE INDEX idx_collectible_bids_auction ON public.collectible_bids(auction_id);

-- Insert default rarities
INSERT INTO public.collectible_rarities (name, level, color, drop_rate) VALUES
  ('Common', 1, '#9CA3AF', 50.00),
  ('Uncommon', 2, '#10B981', 30.00),
  ('Rare', 3, '#3B82F6', 15.00),
  ('Epic', 4, '#A855F7', 4.00),
  ('Legendary', 5, '#F59E0B', 1.00);

-- Insert default categories
INSERT INTO public.collectible_categories (name, description, icon) VALUES
  ('Art', 'Umelecké diela a maľby', '🎨'),
  ('Characters', 'Postavy a avatary', '👤'),
  ('Animals', 'Zvieratá a tvory', '🦁'),
  ('Locations', 'Miesta a scenérie', '🏔️'),
  ('Objects', 'Predmety a artefakty', '💎');

-- Create trigger for updated_at
CREATE TRIGGER update_collectibles_updated_at
  BEFORE UPDATE ON public.collectibles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collectible_trades_new_updated_at
  BEFORE UPDATE ON public.collectible_trades_new
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collectible_auctions_updated_at
  BEFORE UPDATE ON public.collectible_auctions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();