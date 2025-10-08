-- Create table for monthly winners
CREATE TABLE public.megatalent_winners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  submission_id UUID REFERENCES public.talent_submissions(id) ON DELETE CASCADE,
  category talent_category NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2026),
  total_votes INTEGER NOT NULL DEFAULT 0,
  prize_amount NUMERIC NOT NULL DEFAULT 10000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category, month, year)
);

-- Enable RLS
ALTER TABLE public.megatalent_winners ENABLE ROW LEVEL SECURITY;

-- Anyone can view winners
CREATE POLICY "Anyone can view winners"
ON public.megatalent_winners
FOR SELECT
USING (true);

-- Only admins can insert/update/delete winners
CREATE POLICY "Admins can manage winners"
ON public.megatalent_winners
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create a view for current month leaderboard by category
CREATE OR REPLACE VIEW public.megatalent_leaderboard AS
SELECT 
  ts.id as submission_id,
  ts.user_id,
  ts.category,
  ts.title,
  ts.description,
  ts.media_url,
  ts.media_type,
  ts.votes_count,
  ts.created_at,
  p.full_name,
  p.avatar_url,
  ms.tier as subscription_tier,
  ms.bonus_votes,
  CASE 
    WHEN ms.tier = 'top_premium' THEN ts.votes_count + COALESCE(ms.bonus_votes, 0)
    ELSE ts.votes_count
  END as total_votes_with_bonus,
  ROW_NUMBER() OVER (
    PARTITION BY ts.category 
    ORDER BY 
      CASE 
        WHEN ms.tier = 'top_premium' THEN ts.votes_count + COALESCE(ms.bonus_votes, 0)
        ELSE ts.votes_count
      END DESC,
      ts.created_at ASC
  ) as rank_in_category
FROM public.talent_submissions ts
LEFT JOIN public.profiles p ON ts.user_id = p.id
LEFT JOIN public.megatalent_subscriptions ms ON ts.user_id = ms.user_id AND ms.status = 'active'
WHERE ts.is_active = true
  AND EXTRACT(MONTH FROM ts.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND EXTRACT(YEAR FROM ts.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY ts.category, total_votes_with_bonus DESC;

COMMENT ON TABLE public.megatalent_winners IS 'Stores monthly winners for each Megatalent category';
COMMENT ON VIEW public.megatalent_leaderboard IS 'Current month leaderboard by category with bonus votes from TOP Premium subscriptions';