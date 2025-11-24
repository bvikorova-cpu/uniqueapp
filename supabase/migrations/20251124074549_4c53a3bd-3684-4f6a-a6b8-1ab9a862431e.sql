-- Fix security warnings by setting search_path

-- Function to award points and log activity
CREATE OR REPLACE FUNCTION award_points_and_log(
  p_user_id UUID,
  p_activity_type TEXT,
  p_points INTEGER
) RETURNS VOID AS $$
BEGIN
  INSERT INTO activity_logs (user_id, activity_type, points_earned)
  VALUES (p_user_id, p_activity_type, p_points);
  
  INSERT INTO user_points (user_id, total_points, level, current_xp)
  VALUES (p_user_id, p_points, 1, p_points)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = user_points.total_points + p_points,
    current_xp = user_points.current_xp + p_points,
    level = CASE 
      WHEN (user_points.current_xp + p_points) >= (user_points.level * 100) 
      THEN user_points.level + 1 
      ELSE user_points.level 
    END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID) RETURNS VOID AS $$
DECLARE
  v_badge RECORD;
  v_count INTEGER;
  v_has_badge BOOLEAN;
BEGIN
  FOR v_badge IN SELECT * FROM badges LOOP
    SELECT EXISTS(
      SELECT 1 FROM user_badges 
      WHERE user_id = p_user_id AND badge_id = v_badge.id
    ) INTO v_has_badge;
    
    IF v_has_badge THEN
      CONTINUE;
    END IF;
    
    CASE v_badge.requirement_type
      WHEN 'posts' THEN
        SELECT COUNT(*) INTO v_count FROM posts WHERE user_id = p_user_id;
      WHEN 'comments' THEN
        SELECT COUNT(*) INTO v_count FROM post_comments WHERE user_id = p_user_id;
      WHEN 'likes_received' THEN
        SELECT COUNT(*) INTO v_count FROM post_likes l
        JOIN posts p ON l.post_id = p.id
        WHERE p.user_id = p_user_id;
      WHEN 'friends' THEN
        SELECT COUNT(*) INTO v_count FROM friendships 
        WHERE (user_id = p_user_id OR friend_id = p_user_id) AND status = 'accepted';
      WHEN 'videos' THEN
        SELECT COUNT(*) INTO v_count FROM posts p
        JOIN media m ON m.post_id = p.id
        WHERE p.user_id = p_user_id AND m.file_type LIKE 'video%';
      WHEN 'login_streak' THEN
        SELECT COALESCE(login_streak, 0) INTO v_count FROM user_points WHERE user_id = p_user_id;
      ELSE
        v_count := 0;
    END CASE;
    
    IF v_count >= v_badge.requirement_value THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (p_user_id, v_badge.id);
      
      IF v_badge.points_reward IS NOT NULL AND v_badge.points_reward > 0 THEN
        PERFORM award_points_and_log(p_user_id, 'badge_earned', v_badge.points_reward);
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger function for new posts
CREATE OR REPLACE FUNCTION trigger_post_created() RETURNS TRIGGER AS $$
BEGIN
  PERFORM award_points_and_log(NEW.user_id, 'post_created', 10);
  PERFORM check_and_award_badges(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger function for new comments
CREATE OR REPLACE FUNCTION trigger_comment_added() RETURNS TRIGGER AS $$
BEGIN
  PERFORM award_points_and_log(NEW.user_id, 'comment_added', 5);
  PERFORM check_and_award_badges(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger function for new likes
CREATE OR REPLACE FUNCTION trigger_like_added() RETURNS TRIGGER AS $$
BEGIN
  PERFORM award_points_and_log(NEW.user_id, 'post_liked', 2);
  PERFORM check_and_award_badges(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger function for new friendships
CREATE OR REPLACE FUNCTION trigger_friendship_accepted() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    PERFORM award_points_and_log(NEW.user_id, 'friend_added', 20);
    PERFORM award_points_and_log(NEW.friend_id, 'friend_added', 20);
    PERFORM check_and_award_badges(NEW.user_id);
    PERFORM check_and_award_badges(NEW.friend_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;