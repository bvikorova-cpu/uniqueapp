CREATE OR REPLACE FUNCTION public.notify_followers_stream_live()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_owner uuid;
BEGIN
  IF COALESCE(NEW.is_live, false) IS NOT TRUE THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND COALESCE(OLD.is_live, false) IS TRUE THEN
    RETURN NEW;
  END IF;

  SELECT display_name, user_id INTO v_name, v_owner
  FROM public.influencer_profiles WHERE id = NEW.influencer_id;

  INSERT INTO public.notifications (user_id, title, message, type, related_id, actor_id, action_url)
  SELECT f.follower_id,
         COALESCE(v_name, 'Creator') || ' is live now',
         NEW.title,
         'stream_live',
         NEW.id,
         v_owner,
         '/live/' || NEW.id::text
  FROM public.influencer_followers f
  WHERE f.influencer_id = NEW.influencer_id
    AND f.follower_id <> COALESCE(v_owner, '00000000-0000-0000-0000-000000000000'::uuid);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_followers_stream_live ON public.live_streams;
CREATE TRIGGER trg_notify_followers_stream_live
AFTER INSERT OR UPDATE OF is_live ON public.live_streams
FOR EACH ROW EXECUTE FUNCTION public.notify_followers_stream_live();