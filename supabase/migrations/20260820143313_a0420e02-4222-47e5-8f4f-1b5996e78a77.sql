CREATE OR REPLACE FUNCTION public.badge_metric_value(_user_id uuid, _metric text)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v int := 0;
BEGIN
  CASE _metric
    WHEN 'posts' THEN SELECT COUNT(*) INTO v FROM posts WHERE user_id = _user_id;
    WHEN 'comments' THEN SELECT COUNT(*) INTO v FROM post_comments WHERE user_id = _user_id;
    WHEN 'likes_received' THEN SELECT COUNT(*) INTO v FROM post_likes l JOIN posts p ON l.post_id = p.id WHERE p.user_id = _user_id;
    WHEN 'reactions' THEN SELECT COUNT(*) INTO v FROM post_reactions WHERE user_id = _user_id;
    WHEN 'shares' THEN SELECT COUNT(*) INTO v FROM post_shares WHERE user_id = _user_id;
    WHEN 'stories' THEN SELECT COUNT(*) INTO v FROM stories WHERE user_id = _user_id;
    WHEN 'messages' THEN SELECT COUNT(*) INTO v FROM messages WHERE sender_id = _user_id;
    WHEN 'followers' THEN SELECT COUNT(*) INTO v FROM user_follows WHERE following_id = _user_id;
    WHEN 'profile_visits' THEN SELECT COUNT(*) INTO v FROM profile_views WHERE profile_id = _user_id;
    WHEN 'friends' THEN SELECT COUNT(*) INTO v FROM friendships WHERE (user_id = _user_id OR friend_id = _user_id) AND status = 'accepted';
    WHEN 'videos' THEN SELECT COUNT(*) INTO v FROM posts p JOIN media m ON m.post_id = p.id WHERE p.user_id = _user_id AND m.file_type LIKE 'video%';
    WHEN 'photos' THEN SELECT COUNT(*) INTO v FROM posts p JOIN media m ON m.post_id = p.id WHERE p.user_id = _user_id AND m.file_type LIKE 'image%';
    WHEN 'login_streak' THEN SELECT COALESCE(MAX(GREATEST(current_streak, longest_streak)), 0) INTO v FROM user_streaks WHERE user_id = _user_id;
    WHEN 'xp' THEN SELECT COALESCE(MAX(total_xp), 0) INTO v FROM user_xp WHERE user_id = _user_id;
    WHEN 'level' THEN SELECT COALESCE(MAX(level), 0) INTO v FROM user_points WHERE user_id = _user_id;
    WHEN 'achievements' THEN SELECT COUNT(*) INTO v FROM user_achievements WHERE user_id = _user_id;
    WHEN 'challenges' THEN SELECT COUNT(*) INTO v FROM user_challenge_progress WHERE user_id = _user_id AND completed_at IS NOT NULL;
    ELSE v := 0;
  END CASE;
  RETURN COALESCE(v, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_badge RECORD; v_count int;
BEGIN
  IF p_user_id IS NULL THEN RETURN; END IF;
  FOR v_badge IN
    SELECT b.* FROM badges b
    WHERE NOT EXISTS (SELECT 1 FROM user_badges ub WHERE ub.user_id = p_user_id AND ub.badge_id = b.id)
  LOOP
    v_count := public.badge_metric_value(p_user_id, v_badge.requirement_type);
    IF v_count >= COALESCE(v_badge.requirement_value, 0) AND COALESCE(v_badge.requirement_value, 0) > 0 THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id)
      ON CONFLICT DO NOTHING;
      IF COALESCE(v_badge.points_reward, 0) > 0 THEN
        PERFORM award_points_and_log(p_user_id, 'badge_earned', v_badge.points_reward);
      END IF;
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_badge_progress()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  icon text,
  points_reward integer,
  requirement_type text,
  requirement_value integer,
  current_value integer,
  unlocked boolean,
  earned_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RETURN; END IF;
  RETURN QUERY
  SELECT b.id, b.name, b.description, b.icon, b.points_reward,
         b.requirement_type, b.requirement_value,
         public.badge_metric_value(_uid, b.requirement_type) AS current_value,
         (ub.user_id IS NOT NULL) AS unlocked,
         ub.earned_at
  FROM badges b
  LEFT JOIN user_badges ub ON ub.badge_id = b.id AND ub.user_id = _uid
  ORDER BY (ub.user_id IS NOT NULL) DESC, b.requirement_value ASC NULLS LAST, b.name;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_my_badges()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _uid uuid := auth.uid(); _before int; _after int;
BEGIN
  IF _uid IS NULL THEN RETURN 0; END IF;
  SELECT COUNT(*) INTO _before FROM user_badges WHERE user_id = _uid;
  PERFORM public.check_and_award_badges(_uid);
  SELECT COUNT(*) INTO _after FROM user_badges WHERE user_id = _uid;
  RETURN _after - _before;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_badge_progress() TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_my_badges() TO authenticated;
GRANT EXECUTE ON FUNCTION public.badge_metric_value(uuid, text) TO authenticated;