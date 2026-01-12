-- Drop and recreate the megatalent_leaderboard view with proper 50% algorithmic boost
DROP VIEW IF EXISTS megatalent_leaderboard;

CREATE VIEW megatalent_leaderboard AS
SELECT 
    ts.id AS submission_id,
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
    ms.tier AS subscription_tier,
    ms.bonus_votes,
    -- Total votes including bonus for TOP Premium
    CASE 
        WHEN ms.tier = 'top_premium' THEN ts.votes_count + COALESCE(ms.bonus_votes, 0)
        ELSE ts.votes_count
    END AS total_votes_with_bonus,
    -- Ranking score with 50% algorithmic boost for TOP Premium
    -- This is used for ranking/ordering purposes
    CASE 
        WHEN ms.tier = 'top_premium' THEN 
            ((ts.votes_count + COALESCE(ms.bonus_votes, 0)) * 1.5)::integer
        ELSE ts.votes_count
    END AS ranking_score,
    -- Rank in category based on boosted score
    ROW_NUMBER() OVER (
        PARTITION BY ts.category 
        ORDER BY 
            CASE 
                WHEN ms.tier = 'top_premium' THEN 
                    ((ts.votes_count + COALESCE(ms.bonus_votes, 0)) * 1.5)::integer
                ELSE ts.votes_count
            END DESC,
            ts.created_at
    ) AS rank_in_category
FROM talent_submissions ts
LEFT JOIN profiles p ON ts.user_id = p.id
LEFT JOIN megatalent_subscriptions ms ON ts.user_id = ms.user_id AND ms.status = 'active'
WHERE 
    ts.is_active = true 
    AND EXTRACT(month FROM ts.created_at) = EXTRACT(month FROM CURRENT_DATE)
    AND EXTRACT(year FROM ts.created_at) = EXTRACT(year FROM CURRENT_DATE)
ORDER BY ts.category, ranking_score DESC;

-- Grant access to the view
GRANT SELECT ON megatalent_leaderboard TO anon, authenticated;

-- Add comment explaining the view logic
COMMENT ON VIEW megatalent_leaderboard IS 'MegaTalent leaderboard with tier benefits:
- TOP Premium (€15/month): +100,000 bonus votes + 50% algorithmic boost in rankings
- Premium (€10/month): Standard voting
The ranking_score field applies the 50% boost for TOP Premium users.
total_votes_with_bonus shows the display vote count with bonus.';