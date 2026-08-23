CREATE OR REPLACE FUNCTION public.badge_metric_value(_user_id uuid, _metric text)
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    WHEN 'followers' THEN SELECT COUNT(*) INTO v FROM follows WHERE following_id = _user_id;
    WHEN 'profile_visits' THEN SELECT COUNT(*) INTO v FROM profile_views WHERE profile_id = _user_id;
    WHEN 'friends' THEN SELECT COUNT(*) INTO v FROM friendships WHERE (user_id = _user_id OR friend_id = _user_id) AND status = 'accepted';
    WHEN 'videos' THEN SELECT COUNT(*) INTO v FROM posts p JOIN media m ON m.post_id = p.id WHERE p.user_id = _user_id AND m.file_type LIKE 'video%';
    WHEN 'photos' THEN SELECT COUNT(*) INTO v FROM posts p JOIN media m ON m.post_id = p.id WHERE p.user_id = _user_id AND m.file_type LIKE 'image%';
    WHEN 'login_streak' THEN SELECT COALESCE(MAX(GREATEST(current_streak, longest_streak)), 0) INTO v FROM user_streaks WHERE user_id = _user_id;
    WHEN 'xp' THEN SELECT GREATEST(
        COALESCE((SELECT MAX(total_points) FROM user_points WHERE user_id = _user_id), 0),
        COALESCE((SELECT MAX(total_xp) FROM user_xp WHERE user_id = _user_id), 0)) INTO v;
    WHEN 'level' THEN SELECT COALESCE(MAX(level), 0) INTO v FROM user_points WHERE user_id = _user_id;
    WHEN 'achievements' THEN SELECT COUNT(*) INTO v FROM user_achievements WHERE user_id = _user_id;
    WHEN 'challenges' THEN SELECT COUNT(*) INTO v FROM user_challenge_progress WHERE user_id = _user_id AND completed_at IS NOT NULL;
    WHEN 'events' THEN SELECT COUNT(*) INTO v FROM event_attendees WHERE user_id = _user_id;
    WHEN 'groups' THEN SELECT COUNT(*) INTO v FROM group_members WHERE user_id = _user_id;
    WHEN 'trades' THEN SELECT COUNT(*) INTO v FROM pet_trades WHERE (from_user_id = _user_id OR to_user_id = _user_id) AND status = 'accepted';
    ELSE v := 0;
  END CASE;
  RETURN COALESCE(v, 0);
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_and_award_badges_metric(p_user_id uuid, p_metric text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_badge RECORD; v_count int;
BEGIN
  IF p_user_id IS NULL OR p_metric IS NULL THEN RETURN; END IF;
  v_count := public.badge_metric_value(p_user_id, p_metric);
  IF v_count <= 0 THEN RETURN; END IF;

  FOR v_badge IN
    SELECT b.* FROM badges b
    WHERE b.requirement_type = p_metric
      AND COALESCE(b.requirement_value, 0) > 0
      AND v_count >= b.requirement_value
      AND NOT EXISTS (SELECT 1 FROM user_badges ub WHERE ub.user_id = p_user_id AND ub.badge_id = b.id)
  LOOP
    INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id) ON CONFLICT DO NOTHING;
    IF COALESCE(v_badge.points_reward, 0) > 0 THEN
      BEGIN
        PERFORM award_points_and_log(p_user_id, 'badge_earned', v_badge.points_reward);
      EXCEPTION WHEN OTHERS THEN NULL;
      END;
    END IF;
  END LOOP;
EXCEPTION WHEN OTHERS THEN
  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_and_award_badges_metric(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_and_award_badges(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.tg_badges_posts() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.check_and_award_badges_metric(NEW.user_id, 'posts'); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.tg_badges_comments() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.check_and_award_badges_metric(NEW.user_id, 'comments'); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.tg_badges_likes() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_owner uuid;
BEGIN
  SELECT user_id INTO v_owner FROM posts WHERE id = NEW.post_id;
  PERFORM public.check_and_award_badges_metric(v_owner, 'likes_received');
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.tg_badges_stories() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.check_and_award_badges_metric(NEW.user_id, 'stories'); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.tg_badges_follows() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.check_and_award_badges_metric(NEW.following_id, 'followers'); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.tg_badges_friendships() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'accepted' THEN
    PERFORM public.check_and_award_badges_metric(NEW.user_id, 'friends');
    PERFORM public.check_and_award_badges_metric(NEW.friend_id, 'friends');
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.tg_badges_points() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.check_and_award_badges_metric(NEW.user_id, 'level');
  PERFORM public.check_and_award_badges_metric(NEW.user_id, 'xp');
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.tg_badges_streaks() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.check_and_award_badges_metric(NEW.user_id, 'login_streak'); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_badges_posts ON public.posts;
CREATE TRIGGER trg_badges_posts AFTER INSERT ON public.posts FOR EACH ROW EXECUTE FUNCTION public.tg_badges_posts();

DROP TRIGGER IF EXISTS trg_badges_comments ON public.post_comments;
CREATE TRIGGER trg_badges_comments AFTER INSERT ON public.post_comments FOR EACH ROW EXECUTE FUNCTION public.tg_badges_comments();

DROP TRIGGER IF EXISTS trg_badges_likes ON public.post_likes;
CREATE TRIGGER trg_badges_likes AFTER INSERT ON public.post_likes FOR EACH ROW EXECUTE FUNCTION public.tg_badges_likes();

DROP TRIGGER IF EXISTS trg_badges_stories ON public.stories;
CREATE TRIGGER trg_badges_stories AFTER INSERT ON public.stories FOR EACH ROW EXECUTE FUNCTION public.tg_badges_stories();

DROP TRIGGER IF EXISTS trg_badges_follows ON public.follows;
CREATE TRIGGER trg_badges_follows AFTER INSERT ON public.follows FOR EACH ROW EXECUTE FUNCTION public.tg_badges_follows();

DROP TRIGGER IF EXISTS trg_badges_friendships ON public.friendships;
CREATE TRIGGER trg_badges_friendships AFTER INSERT OR UPDATE OF status ON public.friendships FOR EACH ROW EXECUTE FUNCTION public.tg_badges_friendships();

DROP TRIGGER IF EXISTS trg_badges_points ON public.user_points;
CREATE TRIGGER trg_badges_points AFTER INSERT OR UPDATE OF total_points, level ON public.user_points FOR EACH ROW EXECUTE FUNCTION public.tg_badges_points();

DROP TRIGGER IF EXISTS trg_badges_streaks ON public.user_streaks;
CREATE TRIGGER trg_badges_streaks AFTER INSERT OR UPDATE ON public.user_streaks FOR EACH ROW EXECUTE FUNCTION public.tg_badges_streaks();