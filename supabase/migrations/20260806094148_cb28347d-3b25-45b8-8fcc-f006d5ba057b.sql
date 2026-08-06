CREATE OR REPLACE FUNCTION public.tg_forum_notify_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_title text;
  v_name text;
BEGIN
  BEGIN
    SELECT user_id, title INTO v_owner, v_title FROM public.forum_posts WHERE id = NEW.post_id;
    IF v_owner IS NULL OR v_owner = NEW.user_id THEN RETURN NEW; END IF;

    SELECT COALESCE(full_name, username, 'Someone') INTO v_name FROM public.profiles WHERE id = NEW.user_id;

    INSERT INTO public.notifications (user_id, title, message, type, actor_id, post_id, comment_id, action_url, metadata)
    VALUES (v_owner, 'New comment', COALESCE(v_name,'Someone') || ' commented on "' || COALESCE(v_title,'your post') || '"',
            'forum_comment', NEW.user_id, NEW.post_id, NEW.id,
            '/megaforum?post=' || NEW.post_id::text,
            jsonb_build_object('post_id', NEW.post_id));

    INSERT INTO public.forum_notifications (user_id, post_id, type, message)
    VALUES (v_owner, NEW.post_id, 'comment', COALESCE(v_name,'Someone') || ' commented on your post');
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.tg_forum_notify_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_title text;
  v_name text;
BEGIN
  BEGIN
    SELECT user_id, title INTO v_owner, v_title FROM public.forum_posts WHERE id = NEW.post_id;
    IF v_owner IS NULL OR v_owner = NEW.user_id THEN RETURN NEW; END IF;

    SELECT COALESCE(full_name, username, 'Someone') INTO v_name FROM public.profiles WHERE id = NEW.user_id;

    INSERT INTO public.notifications (user_id, title, message, type, actor_id, post_id, action_url, metadata)
    VALUES (v_owner, 'New like', COALESCE(v_name,'Someone') || ' liked "' || COALESCE(v_title,'your post') || '"',
            'forum_like', NEW.user_id, NEW.post_id,
            '/megaforum?post=' || NEW.post_id::text,
            jsonb_build_object('post_id', NEW.post_id));

    INSERT INTO public.forum_notifications (user_id, post_id, type, message)
    VALUES (v_owner, NEW.post_id, 'like', COALESCE(v_name,'Someone') || ' liked your post');
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.tg_forum_notify_comment() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_forum_notify_like() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_forum_notify_comment ON public.forum_comments;
CREATE TRIGGER trg_forum_notify_comment
AFTER INSERT ON public.forum_comments
FOR EACH ROW EXECUTE FUNCTION public.tg_forum_notify_comment();

DROP TRIGGER IF EXISTS trg_forum_notify_like ON public.forum_post_likes;
CREATE TRIGGER trg_forum_notify_like
AFTER INSERT ON public.forum_post_likes
FOR EACH ROW EXECUTE FUNCTION public.tg_forum_notify_like();