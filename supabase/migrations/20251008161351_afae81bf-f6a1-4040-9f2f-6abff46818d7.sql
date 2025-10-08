-- Drop the existing view
DROP VIEW IF EXISTS public.megatalent_leaderboard;

-- Recreate the view without SECURITY DEFINER (by default it's SECURITY INVOKER)
CREATE VIEW public.megatalent_leaderboard 
WITH (security_invoker = true)
AS
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

COMMENT ON VIEW public.megatalent_leaderboard IS 'Current month leaderboard by category with bonus votes from TOP Premium subscriptions';