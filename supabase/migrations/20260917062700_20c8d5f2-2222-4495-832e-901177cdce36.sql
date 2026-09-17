CREATE OR REPLACE FUNCTION public.notify_reaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author_id uuid;
  v_actor_name text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT user_id INTO v_post_author_id
    FROM public.posts
    WHERE id = NEW.post_id;

    IF v_post_author_id IS NULL OR v_post_author_id = NEW.user_id THEN
      RETURN NEW;
    END IF;

    SELECT COALESCE(NULLIF(BTRIM(full_name), ''), NULLIF(BTRIM(username), ''), 'Someone')
    INTO v_actor_name
    FROM public.profiles
    WHERE id = NEW.user_id;

    v_actor_name := COALESCE(v_actor_name, 'Someone');

    INSERT INTO public.notifications (
      user_id,
      actor_id,
      type,
      post_id,
      title,
      message,
      metadata
    ) VALUES (
      v_post_author_id,
      NEW.user_id,
      'reaction',
      NEW.post_id,
      'New reaction',
      v_actor_name || ' reacted to your post',
      jsonb_build_object('reaction_type', NEW.reaction_type)
    );
  END IF;

  RETURN NEW;
END;
$$;