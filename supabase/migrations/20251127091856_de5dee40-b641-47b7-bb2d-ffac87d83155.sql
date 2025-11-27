-- Fix award_points_and_log function to use correct column name
CREATE OR REPLACE FUNCTION public.award_points_and_log(p_user_id uuid, p_activity_type text, p_points integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO activity_logs (user_id, activity_type, points_earned)
  VALUES (p_user_id, p_activity_type, p_points);
  
  INSERT INTO user_points (user_id, total_points, level, current_level_points)
  VALUES (p_user_id, p_points, 1, p_points)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = user_points.total_points + p_points,
    current_level_points = user_points.current_level_points + p_points,
    level = CASE 
      WHEN (user_points.current_level_points + p_points) >= (user_points.level * 100) 
      THEN user_points.level + 1 
      ELSE user_points.level 
    END,
    updated_at = NOW();
END;
$$;