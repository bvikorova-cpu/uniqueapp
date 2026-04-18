DROP VIEW IF EXISTS public.safety_roleplay_leaderboard;
CREATE VIEW public.safety_roleplay_leaderboard
WITH (security_invoker = true) AS
SELECT
  s.user_id,
  COALESCE((SELECT anonymous_handle FROM public.safety_buddy_profiles bp WHERE bp.user_id = s.user_id LIMIT 1), 'Anon Hero') AS handle,
  SUM(s.total_score) AS total_score,
  COUNT(*) AS sessions_played,
  MAX(s.created_at) AS last_played
FROM public.safety_roleplay_sessions s
GROUP BY s.user_id
ORDER BY SUM(s.total_score) DESC
LIMIT 100;