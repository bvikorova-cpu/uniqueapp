CREATE OR REPLACE FUNCTION public.notify_premium_video_unlock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _owner uuid;
  _title text;
BEGIN
  SELECT user_id, COALESCE(NULLIF(title, ''), 'your video')
    INTO _owner, _title
  FROM public.premium_videos
  WHERE id = NEW.video_id;

  IF _owner IS NULL OR _owner = NEW.user_id THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, actor_id, type, title, message, related_id, is_read)
  VALUES (
    _owner,
    NEW.user_id,
    'premium_video_unlock',
    'New video unlock',
    'Someone unlocked "' || _title || '" — you earned ' || round(COALESCE(NEW.credits_spent, 1) * 0.5, 2)::text || ' credits',
    NEW.video_id,
    false
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_premium_video_unlock ON public.premium_video_unlocks;
CREATE TRIGGER trg_notify_premium_video_unlock
AFTER INSERT ON public.premium_video_unlocks
FOR EACH ROW EXECUTE FUNCTION public.notify_premium_video_unlock();