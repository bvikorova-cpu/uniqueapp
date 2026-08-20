CREATE OR REPLACE FUNCTION public.sync_post_media_to_gallery()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid;
  v_type text;
BEGIN
  SELECT user_id INTO v_user FROM public.posts WHERE id = NEW.post_id;
  IF v_user IS NULL THEN RETURN NEW; END IF;

  v_type := CASE
    WHEN COALESCE(NEW.file_type,'') ILIKE 'video%' THEN 'video'
    WHEN COALESCE(NEW.file_type,'') ILIKE 'audio%' THEN 'audio'
    ELSE 'image'
  END;

  INSERT INTO public.user_media_gallery (user_id, media_url, media_type, post_id)
  SELECT v_user, NEW.file_url, v_type, NEW.post_id
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_media_gallery g
    WHERE g.user_id = v_user AND g.media_url = NEW.file_url
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_post_media_to_gallery ON public.media;
CREATE TRIGGER trg_sync_post_media_to_gallery
AFTER INSERT ON public.media
FOR EACH ROW EXECUTE FUNCTION public.sync_post_media_to_gallery();

INSERT INTO public.user_media_gallery (user_id, media_url, media_type, post_id, created_at)
SELECT p.user_id, m.file_url,
       CASE WHEN COALESCE(m.file_type,'') ILIKE 'video%' THEN 'video'
            WHEN COALESCE(m.file_type,'') ILIKE 'audio%' THEN 'audio'
            ELSE 'image' END,
       m.post_id, m.created_at
FROM public.media m
JOIN public.posts p ON p.id = m.post_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_media_gallery g
  WHERE g.user_id = p.user_id AND g.media_url = m.file_url
);