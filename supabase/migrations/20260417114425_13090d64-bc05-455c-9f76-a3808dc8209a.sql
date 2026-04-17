
-- AI Story Generations log (paid feature - uses ai_credits)
CREATE TABLE IF NOT EXISTS public.ai_story_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campaign_type TEXT NOT NULL,
  campaign_id UUID,
  input_summary TEXT NOT NULL,
  generated_story TEXT NOT NULL,
  generated_title TEXT,
  tone TEXT DEFAULT 'emotional',
  credits_used INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_story_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI stories"
  ON public.ai_story_generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI stories"
  ON public.ai_story_generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Match donations (sponsors that double donations up to a cap)
CREATE TABLE IF NOT EXISTS public.donation_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL,
  campaign_type TEXT NOT NULL,
  sponsor_id UUID NOT NULL,
  sponsor_name TEXT NOT NULL,
  sponsor_logo_url TEXT,
  match_ratio NUMERIC NOT NULL DEFAULT 1.0,
  match_cap NUMERIC NOT NULL,
  matched_so_far NUMERIC NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.donation_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active donation matches"
  ON public.donation_matches FOR SELECT
  USING (active = true);

CREATE POLICY "Sponsors can insert their own matches"
  ON public.donation_matches FOR INSERT
  WITH CHECK (auth.uid() = sponsor_id);

CREATE POLICY "Sponsors can update their own matches"
  ON public.donation_matches FOR UPDATE
  USING (auth.uid() = sponsor_id);

-- Campaign Milestones (auto-celebrated achievements: 10%, 25%, 50%, 75%, 100%)
CREATE TABLE IF NOT EXISTS public.campaign_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL,
  campaign_type TEXT NOT NULL,
  milestone_pct INTEGER NOT NULL,
  milestone_amount NUMERIC NOT NULL,
  reached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  celebrated BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(campaign_id, campaign_type, milestone_pct)
);

ALTER TABLE public.campaign_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view milestones"
  ON public.campaign_milestones FOR SELECT
  USING (true);

-- Donor stats aggregate (for leaderboard / badges)
CREATE TABLE IF NOT EXISTS public.donor_stats (
  user_id UUID NOT NULL PRIMARY KEY,
  display_name TEXT,
  total_donated NUMERIC NOT NULL DEFAULT 0,
  total_donations_count INTEGER NOT NULL DEFAULT 0,
  campaigns_supported INTEGER NOT NULL DEFAULT 0,
  current_streak_days INTEGER NOT NULL DEFAULT 0,
  longest_streak_days INTEGER NOT NULL DEFAULT 0,
  badge_tier TEXT NOT NULL DEFAULT 'bronze',
  last_donation_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.donor_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Donor stats are publicly viewable"
  ON public.donor_stats FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own donor stats"
  ON public.donor_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to compute badge tier
CREATE OR REPLACE FUNCTION public.compute_donor_badge_tier(_total NUMERIC)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN _total >= 1000 THEN 'platinum'
    WHEN _total >= 500 THEN 'gold'
    WHEN _total >= 100 THEN 'silver'
    ELSE 'bronze'
  END;
$$;

-- Trigger to update badge tier on stat changes
CREATE OR REPLACE FUNCTION public.refresh_donor_badge_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.badge_tier = public.compute_donor_badge_tier(NEW.total_donated);
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_refresh_donor_badge_tier ON public.donor_stats;
CREATE TRIGGER trg_refresh_donor_badge_tier
  BEFORE INSERT OR UPDATE ON public.donor_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.refresh_donor_badge_tier();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_donation_matches_campaign ON public.donation_matches(campaign_id, campaign_type) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_campaign_milestones_campaign ON public.campaign_milestones(campaign_id, campaign_type);
CREATE INDEX IF NOT EXISTS idx_donor_stats_total ON public.donor_stats(total_donated DESC);
CREATE INDEX IF NOT EXISTS idx_ai_story_user ON public.ai_story_generations(user_id, created_at DESC);
