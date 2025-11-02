-- Create virtual influencers table
CREATE TABLE public.virtual_influencers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  personality TEXT,
  niche TEXT,
  avatar_url TEXT,
  followers INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create influencer content table
CREATE TABLE public.influencer_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID NOT NULL REFERENCES public.virtual_influencers(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('image', 'video', 'story', 'reel')),
  content_url TEXT NOT NULL,
  caption TEXT,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  earnings DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create influencer earnings table
CREATE TABLE public.influencer_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID NOT NULL REFERENCES public.virtual_influencers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('content_views', 'sponsorship', 'subscription', 'merchandise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create influencer subscriptions table
CREATE TABLE public.influencer_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID NOT NULL REFERENCES public.virtual_influencers(id) ON DELETE CASCADE,
  subscriber_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('basic', 'premium', 'vip')),
  monthly_price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(influencer_id, subscriber_user_id)
);

-- Enable RLS
ALTER TABLE public.virtual_influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for virtual_influencers
CREATE POLICY "Users can view all influencers"
  ON public.virtual_influencers FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own influencers"
  ON public.virtual_influencers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own influencers"
  ON public.virtual_influencers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own influencers"
  ON public.virtual_influencers FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for influencer_content
CREATE POLICY "Users can view all content"
  ON public.influencer_content FOR SELECT
  USING (true);

CREATE POLICY "Users can create content for their influencers"
  ON public.influencer_content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.virtual_influencers
      WHERE id = influencer_content.influencer_id
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for influencer_earnings
CREATE POLICY "Users can view their own earnings"
  ON public.influencer_earnings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert earnings"
  ON public.influencer_earnings FOR INSERT
  WITH CHECK (true);

-- RLS Policies for influencer_subscriptions
CREATE POLICY "Users can view subscriptions for their influencers"
  ON public.influencer_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.virtual_influencers
      WHERE id = influencer_subscriptions.influencer_id
      AND user_id = auth.uid()
    )
    OR auth.uid() = subscriber_user_id
  );

CREATE POLICY "Users can subscribe to influencers"
  ON public.influencer_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = subscriber_user_id);

-- Create indexes
CREATE INDEX idx_virtual_influencers_user_id ON public.virtual_influencers(user_id);
CREATE INDEX idx_influencer_content_influencer_id ON public.influencer_content(influencer_id);
CREATE INDEX idx_influencer_earnings_user_id ON public.influencer_earnings(user_id);
CREATE INDEX idx_influencer_earnings_influencer_id ON public.influencer_earnings(influencer_id);
CREATE INDEX idx_influencer_subscriptions_influencer_id ON public.influencer_subscriptions(influencer_id);

-- Create trigger for updated_at
CREATE TRIGGER update_virtual_influencers_updated_at
  BEFORE UPDATE ON public.virtual_influencers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();