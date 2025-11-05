-- Create sports tipsters table
CREATE TABLE IF NOT EXISTS public.sports_tipsters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  sport_specialization TEXT NOT NULL, -- Football, Basketball, Tennis, etc.
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  badge TEXT DEFAULT 'starter' CHECK (badge IN ('starter', 'pro', 'elite')),
  
  -- Statistics
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0.00,
  roi DECIMAL(10,2) DEFAULT 0.00,
  followers_count INTEGER DEFAULT 0,
  
  -- Pricing
  tip_price DECIMAL(10,2) DEFAULT 5.00 CHECK (tip_price BETWEEN 1.00 AND 50.00),
  subscription_price DECIMAL(10,2) DEFAULT 19.99,
  
  -- Earnings (75% goes to tipster)
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  pending_payout DECIMAL(10,2) DEFAULT 0.00,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Create sports matches table
CREATE TABLE IF NOT EXISTS public.sports_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport TEXT NOT NULL, -- Football, Basketball, Tennis
  league TEXT,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  match_date TIMESTAMPTZ NOT NULL,
  match_time TEXT NOT NULL,
  
  -- Match details
  venue TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished', 'cancelled')),
  
  -- Results (filled after match ends)
  home_score INTEGER,
  away_score INTEGER,
  result TEXT, -- 'home_win', 'away_win', 'draw'
  
  -- Statistics for analysis
  home_form TEXT, -- Last 5 matches: WWDLL
  away_form TEXT,
  head_to_head JSONB, -- Historical data
  injuries JSONB, -- Injury list
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for match queries
CREATE INDEX IF NOT EXISTS idx_sports_matches_date ON public.sports_matches(match_date);
CREATE INDEX IF NOT EXISTS idx_sports_matches_sport ON public.sports_matches(sport);

-- Create sports predictions table
CREATE TABLE IF NOT EXISTS public.sports_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.sports_matches(id) ON DELETE CASCADE,
  tipster_id UUID NOT NULL REFERENCES public.sports_tipsters(id) ON DELETE CASCADE,
  
  -- Prediction details
  prediction_type TEXT NOT NULL, -- 'home_win', 'away_win', 'draw', 'over', 'under', 'btts'
  prediction_value TEXT, -- e.g., 'Over 2.5', 'Home Win'
  odds DECIMAL(10,2) NOT NULL,
  confidence INTEGER CHECK (confidence BETWEEN 1 AND 100),
  
  -- Analysis
  analysis_text TEXT,
  key_factors JSONB, -- Array of key factors
  
  -- Visibility
  is_free BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false, -- Only for AI Premium subscribers
  
  -- Result tracking
  result TEXT CHECK (result IN ('pending', 'won', 'lost', 'void')),
  settled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(match_id, tipster_id)
);

-- Create indexes for predictions
CREATE INDEX IF NOT EXISTS idx_predictions_tipster ON public.sports_predictions(tipster_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match ON public.sports_predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_predictions_result ON public.sports_predictions(result);

-- Create tipster subscriptions table
CREATE TABLE IF NOT EXISTS public.sports_tipster_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipster_id UUID NOT NULL REFERENCES public.sports_tipsters(id) ON DELETE CASCADE,
  
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Payment tracking
  amount_paid DECIMAL(10,2) NOT NULL,
  stripe_subscription_id TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, tipster_id)
);

-- Create AI premium subscriptions table
CREATE TABLE IF NOT EXISTS public.sports_ai_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  plan TEXT NOT NULL CHECK (plan IN ('free', 'ai_premium', 'expert_tipster')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  
  -- Features based on plan
  features JSONB DEFAULT '{"free_tips": 3, "ai_predictions": false, "expert_access": false}'::jsonb,
  
  -- Payment
  amount_paid DECIMAL(10,2),
  stripe_subscription_id TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Create tipster followers table
CREATE TABLE IF NOT EXISTS public.sports_tipster_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipster_id UUID NOT NULL REFERENCES public.sports_tipsters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  notifications_enabled BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(tipster_id, user_id)
);

-- Create purchased tips table (for individual tip purchases)
CREATE TABLE IF NOT EXISTS public.sports_purchased_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prediction_id UUID NOT NULL REFERENCES public.sports_predictions(id) ON DELETE CASCADE,
  
  amount_paid DECIMAL(10,2) NOT NULL,
  stripe_payment_id TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, prediction_id)
);

-- Create platform earnings table
CREATE TABLE IF NOT EXISTS public.sports_platform_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipster_id UUID NOT NULL REFERENCES public.sports_tipsters(id) ON DELETE CASCADE,
  
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('tip_sale', 'subscription')),
  total_amount DECIMAL(10,2) NOT NULL,
  tipster_amount DECIMAL(10,2) NOT NULL, -- 75%
  platform_commission DECIMAL(10,2) NOT NULL, -- 25%
  
  related_id UUID, -- prediction_id or subscription_id
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.sports_tipsters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_tipster_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_ai_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_tipster_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_purchased_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports_platform_earnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sports_tipsters
CREATE POLICY "Tipsters are viewable by everyone"
  ON public.sports_tipsters FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can create their tipster profile"
  ON public.sports_tipsters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Tipsters can update their own profile"
  ON public.sports_tipsters FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for sports_matches
CREATE POLICY "Matches are viewable by everyone"
  ON public.sports_matches FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage matches"
  ON public.sports_matches FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for sports_predictions
CREATE POLICY "Free predictions viewable by everyone"
  ON public.sports_predictions FOR SELECT
  USING (
    is_free = true OR
    tipster_id IN (
      SELECT tipster_id FROM public.sports_tipster_subscriptions
      WHERE user_id = auth.uid() AND status = 'active' AND expires_at > now()
    ) OR
    id IN (
      SELECT prediction_id FROM public.sports_purchased_tips
      WHERE user_id = auth.uid()
    ) OR
    tipster_id IN (
      SELECT id FROM public.sports_tipsters WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Tipsters can create predictions"
  ON public.sports_predictions FOR INSERT
  WITH CHECK (
    tipster_id IN (
      SELECT id FROM public.sports_tipsters
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Tipsters can update their predictions"
  ON public.sports_predictions FOR UPDATE
  USING (
    tipster_id IN (
      SELECT id FROM public.sports_tipsters WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.sports_tipster_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
  ON public.sports_tipster_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their AI subscription"
  ON public.sports_ai_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their AI subscription"
  ON public.sports_ai_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for followers
CREATE POLICY "Users can view followers"
  ON public.sports_tipster_followers FOR SELECT
  USING (true);

CREATE POLICY "Users can follow tipsters"
  ON public.sports_tipster_followers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow tipsters"
  ON public.sports_tipster_followers FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for purchased tips
CREATE POLICY "Users can view their purchased tips"
  ON public.sports_purchased_tips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can purchase tips"
  ON public.sports_purchased_tips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for platform earnings
CREATE POLICY "Tipsters can view their earnings"
  ON public.sports_platform_earnings FOR SELECT
  USING (
    tipster_id IN (
      SELECT id FROM public.sports_tipsters WHERE user_id = auth.uid()
    )
  );

-- Function to update tipster statistics
CREATE OR REPLACE FUNCTION public.update_tipster_statistics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.result IS NOT NULL AND OLD.result IS NULL THEN
    UPDATE public.sports_tipsters
    SET 
      total_predictions = total_predictions + 1,
      correct_predictions = correct_predictions + (CASE WHEN NEW.result = 'won' THEN 1 ELSE 0 END),
      win_rate = ROUND(
        (correct_predictions + (CASE WHEN NEW.result = 'won' THEN 1 ELSE 0 END))::NUMERIC / 
        (total_predictions + 1)::NUMERIC * 100, 
        2
      ),
      updated_at = now()
    WHERE id = NEW.tipster_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to update statistics when prediction is settled
CREATE TRIGGER trigger_update_tipster_stats
  AFTER UPDATE ON public.sports_predictions
  FOR EACH ROW
  WHEN (NEW.result IS DISTINCT FROM OLD.result)
  EXECUTE FUNCTION public.update_tipster_statistics();

-- Function to update followers count
CREATE OR REPLACE FUNCTION public.update_tipster_followers_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.sports_tipsters
    SET followers_count = followers_count + 1
    WHERE id = NEW.tipster_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.sports_tipsters
    SET followers_count = GREATEST(followers_count - 1, 0)
    WHERE id = OLD.tipster_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger for followers count
CREATE TRIGGER trigger_update_followers_count
  AFTER INSERT OR DELETE ON public.sports_tipster_followers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tipster_followers_count();

-- Function to record earnings when tip is purchased
CREATE OR REPLACE FUNCTION public.record_tip_purchase_earnings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tipster_amount DECIMAL(10,2);
  v_commission DECIMAL(10,2);
  v_tipster_id UUID;
BEGIN
  -- Get tipster_id from prediction
  SELECT tipster_id INTO v_tipster_id
  FROM public.sports_predictions
  WHERE id = NEW.prediction_id;
  
  -- Calculate amounts (75% to tipster, 25% commission)
  v_tipster_amount := NEW.amount_paid * 0.75;
  v_commission := NEW.amount_paid * 0.25;
  
  -- Record platform earnings
  INSERT INTO public.sports_platform_earnings (
    tipster_id,
    transaction_type,
    total_amount,
    tipster_amount,
    platform_commission,
    related_id
  ) VALUES (
    v_tipster_id,
    'tip_sale',
    NEW.amount_paid,
    v_tipster_amount,
    v_commission,
    NEW.prediction_id
  );
  
  -- Update tipster earnings
  UPDATE public.sports_tipsters
  SET 
    total_earnings = total_earnings + v_tipster_amount,
    pending_payout = pending_payout + v_tipster_amount,
    updated_at = now()
  WHERE id = v_tipster_id;
  
  RETURN NEW;
END;
$$;

-- Trigger for tip purchase earnings
CREATE TRIGGER trigger_record_tip_earnings
  AFTER INSERT ON public.sports_purchased_tips
  FOR EACH ROW
  EXECUTE FUNCTION public.record_tip_purchase_earnings();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_sports_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add update triggers for timestamp columns
CREATE TRIGGER trigger_sports_tipsters_updated_at
  BEFORE UPDATE ON public.sports_tipsters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sports_updated_at();

CREATE TRIGGER trigger_sports_matches_updated_at
  BEFORE UPDATE ON public.sports_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sports_updated_at();

CREATE TRIGGER trigger_sports_predictions_updated_at
  BEFORE UPDATE ON public.sports_predictions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sports_updated_at();