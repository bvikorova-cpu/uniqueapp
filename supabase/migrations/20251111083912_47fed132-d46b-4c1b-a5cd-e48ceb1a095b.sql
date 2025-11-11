-- Create brand sponsors table
CREATE TABLE IF NOT EXISTS public.brand_sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  website TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'pending',
  subscription_start TIMESTAMP WITH TIME ZONE,
  subscription_end TIMESTAMP WITH TIME ZONE,
  total_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create brand votes table
CREATE TABLE IF NOT EXISTS public.brand_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES public.brand_sponsors(id) ON DELETE CASCADE,
  vote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create unique index for one vote per user per brand per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_brand_votes_user_brand_date
ON public.brand_votes(user_id, brand_id, vote_date);

-- Create user daily votes tracking table
CREATE TABLE IF NOT EXISTS public.user_daily_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  votes_used INTEGER DEFAULT 0,
  votes_purchased INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.brand_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brand_sponsors
CREATE POLICY "Anyone can view active sponsors"
  ON public.brand_sponsors
  FOR SELECT
  USING (subscription_status = 'active');

CREATE POLICY "Users can create their own sponsor entry"
  ON public.brand_sponsors
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sponsor"
  ON public.brand_sponsors
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for brand_votes
CREATE POLICY "Anyone can view votes"
  ON public.brand_votes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can vote for brands"
  ON public.brand_votes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_daily_votes
CREATE POLICY "Users can view their own votes"
  ON public.user_daily_votes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vote tracking"
  ON public.user_daily_votes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vote tracking"
  ON public.user_daily_votes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update brand votes count
CREATE OR REPLACE FUNCTION update_brand_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.brand_sponsors
  SET total_votes = total_votes + 1
  WHERE id = NEW.brand_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for vote count
CREATE TRIGGER on_brand_vote_insert
  AFTER INSERT ON public.brand_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_brand_vote_count();

-- Create trigger for updated_at
CREATE TRIGGER update_brand_sponsors_updated_at
  BEFORE UPDATE ON public.brand_sponsors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();