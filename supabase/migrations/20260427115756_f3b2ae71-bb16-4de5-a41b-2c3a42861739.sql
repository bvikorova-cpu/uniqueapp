CREATE OR REPLACE FUNCTION public._log_activity(
  p_user_id uuid,
  p_activity_type text,
  p_target_id uuid,
  p_target_type text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS NULL THEN RETURN; END IF;
  BEGIN
    INSERT INTO public.activity_feed (user_id, activity_type, target_id, target_type, metadata)
    VALUES (p_user_id, p_activity_type, p_target_id, p_target_type, COALESCE(p_metadata, '{}'::jsonb));
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END;
$$;

CREATE OR REPLACE FUNCTION public.tg_activity_post_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._log_activity(NEW.user_id, 'post_created', NEW.id, 'post', '{}'::jsonb);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_activity_post_created ON public.posts;
CREATE TRIGGER trg_activity_post_created
AFTER INSERT ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.tg_activity_post_created();

CREATE OR REPLACE FUNCTION public.tg_activity_post_liked()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._log_activity(NEW.user_id, 'post_liked', NEW.post_id, 'post', '{}'::jsonb);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_activity_post_liked ON public.post_likes;
CREATE TRIGGER trg_activity_post_liked
AFTER INSERT ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.tg_activity_post_liked();

CREATE OR REPLACE FUNCTION public.tg_activity_post_commented()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._log_activity(NEW.user_id, 'post_commented', NEW.post_id, 'post', '{}'::jsonb);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_activity_post_commented ON public.post_comments;
CREATE TRIGGER trg_activity_post_commented
AFTER INSERT ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.tg_activity_post_commented();

CREATE OR REPLACE FUNCTION public.tg_activity_follow_added()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._log_activity(
    NEW.follower_id,
    'friend_added',
    NEW.following_id,
    'user',
    jsonb_build_object('following_id', NEW.following_id)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_activity_follow_added ON public.user_follows;
CREATE TRIGGER trg_activity_follow_added
AFTER INSERT ON public.user_follows
FOR EACH ROW EXECUTE FUNCTION public.tg_activity_follow_added();