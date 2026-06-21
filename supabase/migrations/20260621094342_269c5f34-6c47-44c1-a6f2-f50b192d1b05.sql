CREATE OR REPLACE FUNCTION public.handle_new_follow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  follower_name text;
BEGIN
  SELECT COALESCE(full_name, 'Someone') INTO follower_name FROM public.profiles WHERE id = NEW.follower_id;
  INSERT INTO public.notifications (user_id, type, actor_id, title, message)
  VALUES (
    NEW.following_id,
    'follow',
    NEW.follower_id,
    'New follower',
    COALESCE(follower_name, 'Someone') || ' started following you'
  );
  RETURN NEW;
END;
$function$;