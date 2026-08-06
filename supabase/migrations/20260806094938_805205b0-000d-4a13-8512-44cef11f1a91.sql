CREATE OR REPLACE FUNCTION public.tg_forum_notify_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_owner uuid;
  v_title text;
  v_name text;
  v_target uuid;
BEGIN
  BEGIN
    SELECT user_id, title INTO v_owner, v_title FROM public.forum_posts WHERE id = NEW.post_id;
    SELECT COALESCE(full_name, username, 'Someone') INTO v_name FROM public.profiles WHERE id = NEW.user_id;

    FOR v_target IN
      SELECT DISTINCT u FROM (
        SELECT v_owner AS u
        UNION
        SELECT c.user_id FROM public.forum_comments c
          WHERE c.post_id = NEW.post_id AND coalesce(c.is_active, true)
      ) s
      WHERE u IS NOT NULL AND u <> NEW.user_id
    LOOP
      INSERT INTO public.notifications (user_id, title, message, type, actor_id, post_id, comment_id, action_url, metadata)
      VALUES (
        v_target,
        'New comment',
        COALESCE(v_name, 'Someone') || CASE WHEN v_target = v_owner
          THEN ' commented on "' || COALESCE(v_title, 'your post') || '"'
          ELSE ' replied in "' || COALESCE(v_title, 'a thread you follow') || '"' END,
        'forum_comment', NEW.user_id, NEW.post_id, NEW.id,
        '/megaforum?post=' || NEW.post_id::text,
        jsonb_build_object('post_id', NEW.post_id)
      );

      INSERT INTO public.forum_notifications (user_id, post_id, type, message)
      VALUES (v_target, NEW.post_id, 'comment',
        COALESCE(v_name, 'Someone') || CASE WHEN v_target = v_owner THEN ' commented on your post' ELSE ' replied in a thread you commented on' END);
    END LOOP;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RETURN NEW;
END;
$function$;