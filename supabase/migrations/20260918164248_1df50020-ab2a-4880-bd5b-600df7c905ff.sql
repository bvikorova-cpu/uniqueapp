CREATE OR REPLACE FUNCTION public.fanout_post_to_followers()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF coalesce(NEW.privacy,'public') <> 'public' THEN RETURN NEW; END IF;
  -- No follower cap: Unique delivers posts to every follower, unlimited.
  INSERT INTO public.user_feed_cache (user_id, post_id, author_id, inserted_at)
  SELECT f.follower_id, NEW.id, NEW.user_id, NEW.created_at
  FROM public.follows f
  WHERE f.following_id = NEW.user_id
  ON CONFLICT DO NOTHING;
  INSERT INTO public.user_feed_cache (user_id, post_id, author_id, inserted_at)
  VALUES (NEW.user_id, NEW.id, NEW.user_id, NEW.created_at)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$function$;