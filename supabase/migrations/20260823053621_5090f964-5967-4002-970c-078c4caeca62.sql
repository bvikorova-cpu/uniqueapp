-- remove duplicated backfill rows (calendar days 2026-07:3 = 40 and 2026-08:22 = 135 were already granted)
DELETE FROM public.activity_logs
WHERE user_id = '3c23b29d-c9e2-4495-8772-143464d08486'
  AND activity_type = 'xp_sync'
  AND created_at = '2026-08-22 22:59:58.858409+00'
  AND points_earned IN (40, 135);

UPDATE public.user_points
SET total_points = total_points - 175,
    current_level_points = GREATEST(0, current_level_points - 175),
    updated_at = now()
WHERE user_id = '3c23b29d-c9e2-4495-8772-143464d08486';

-- align the unified XP record with the corrected Rewards total
INSERT INTO public.user_xp (user_id, total_xp, updated_at)
SELECT user_id, total_points, now() FROM public.user_points
WHERE user_id = '3c23b29d-c9e2-4495-8772-143464d08486'
ON CONFLICT (user_id) DO UPDATE SET total_xp = EXCLUDED.total_xp, updated_at = now();