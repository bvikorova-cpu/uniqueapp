CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_actor_id uuid, p_type text, p_post_id uuid DEFAULT NULL::uuid, p_comment_id uuid DEFAULT NULL::uuid, p_repost_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_actor_name TEXT;
  v_title TEXT;
  v_message TEXT;
BEGIN
  IF p_user_id = p_actor_id THEN
    RETURN;
  END IF;

  SELECT COALESCE(full_name, 'Someone') INTO v_actor_name
  FROM public.profiles WHERE id = p_actor_id;
  v_actor_name := COALESCE(v_actor_name, 'Someone');

  CASE p_type
    WHEN 'reaction' THEN
      v_title := 'New reaction';
      v_message := v_actor_name || ' reacted to your post';
    WHEN 'comment' THEN
      v_title := 'New comment';
      v_message := v_actor_name || ' commented on your post';
    WHEN 'follow' THEN
      v_title := 'New follower';
      v_message := v_actor_name || ' started following you';
    WHEN 'repost' THEN
      v_title := 'New repost';
      v_message := v_actor_name || ' reposted your post';
    WHEN 'mention' THEN
      v_title := 'You were mentioned';
      v_message := v_actor_name || ' mentioned you';
    ELSE
      v_title := 'New notification';
      v_message := v_actor_name || ' interacted with your content';
  END CASE;

  INSERT INTO public.notifications (
    user_id, actor_id, type, post_id, comment_id, repost_id, title, message
  ) VALUES (
    p_user_id, p_actor_id, p_type, p_post_id, p_comment_id, p_repost_id, v_title, v_message
  );
END;
$function$;