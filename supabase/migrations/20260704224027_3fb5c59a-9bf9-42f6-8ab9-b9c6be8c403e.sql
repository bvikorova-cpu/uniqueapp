
-- Notify video owner on new like
CREATE OR REPLACE FUNCTION public.notify_video_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_actor_name text;
BEGIN
  SELECT user_id INTO v_owner FROM public.videos WHERE id = NEW.video_id;
  IF v_owner IS NULL OR v_owner = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(full_name, 'Someone') INTO v_actor_name
    FROM public.public_profiles WHERE id = NEW.user_id;

  INSERT INTO public.notifications (user_id, actor_id, type, title, message, related_id, action_url, metadata)
  VALUES (
    v_owner,
    NEW.user_id,
    'video_like',
    'New like on your video',
    COALESCE(v_actor_name, 'Someone') || ' liked your video',
    NEW.video_id,
    '/wall/videos',
    jsonb_build_object('video_id', NEW.video_id)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_video_like ON public.video_likes;
CREATE TRIGGER trg_notify_video_like
AFTER INSERT ON public.video_likes
FOR EACH ROW EXECUTE FUNCTION public.notify_video_like();

-- Notify post owner on new like
CREATE OR REPLACE FUNCTION public.notify_post_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_actor_name text;
BEGIN
  SELECT user_id INTO v_owner FROM public.posts WHERE id = NEW.post_id;
  IF v_owner IS NULL OR v_owner = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(full_name, 'Someone') INTO v_actor_name
    FROM public.public_profiles WHERE id = NEW.user_id;

  INSERT INTO public.notifications (user_id, actor_id, type, title, message, related_id, post_id, action_url, metadata)
  VALUES (
    v_owner,
    NEW.user_id,
    'post_like',
    'New like on your post',
    COALESCE(v_actor_name, 'Someone') || ' liked your post',
    NEW.post_id,
    NEW.post_id,
    '/wall',
    jsonb_build_object('post_id', NEW.post_id)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_post_like ON public.post_likes;
CREATE TRIGGER trg_notify_post_like
AFTER INSERT ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.notify_post_like();

-- Backfill: create missing like notifications for existing video_likes
INSERT INTO public.notifications (user_id, actor_id, type, title, message, related_id, action_url, metadata, created_at)
SELECT
  v.user_id,
  vl.user_id,
  'video_like',
  'New like on your video',
  COALESCE(pp.full_name, 'Someone') || ' liked your video',
  vl.video_id,
  '/wall/videos',
  jsonb_build_object('video_id', vl.video_id),
  vl.created_at
FROM public.video_likes vl
JOIN public.videos v ON v.id = vl.video_id
LEFT JOIN public.public_profiles pp ON pp.id = vl.user_id
WHERE v.user_id <> vl.user_id
  AND NOT EXISTS (
    SELECT 1 FROM public.notifications n
    WHERE n.user_id = v.user_id
      AND n.actor_id = vl.user_id
      AND n.type = 'video_like'
      AND n.related_id = vl.video_id
  );

-- Backfill: post likes
INSERT INTO public.notifications (user_id, actor_id, type, title, message, related_id, post_id, action_url, metadata, created_at)
SELECT
  p.user_id,
  pl.user_id,
  'post_like',
  'New like on your post',
  COALESCE(pp.full_name, 'Someone') || ' liked your post',
  pl.post_id,
  pl.post_id,
  '/wall',
  jsonb_build_object('post_id', pl.post_id),
  pl.created_at
FROM public.post_likes pl
JOIN public.posts p ON p.id = pl.post_id
LEFT JOIN public.public_profiles pp ON pp.id = pl.user_id
WHERE p.user_id <> pl.user_id
  AND NOT EXISTS (
    SELECT 1 FROM public.notifications n
    WHERE n.user_id = p.user_id
      AND n.actor_id = pl.user_id
      AND n.type = 'post_like'
      AND n.related_id = pl.post_id
  );
