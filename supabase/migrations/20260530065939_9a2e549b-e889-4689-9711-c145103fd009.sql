
-- ============================================================
-- 1. ATTACH COUNTER TRIGGERS (functions already exist)
-- ============================================================
DROP TRIGGER IF EXISTS trg_post_likes_count ON public.post_likes;
CREATE TRIGGER trg_post_likes_count
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.tg_posts_likes_count();

DROP TRIGGER IF EXISTS trg_post_comments_count ON public.post_comments;
CREATE TRIGGER trg_post_comments_count
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.tg_posts_comments_count();

DROP TRIGGER IF EXISTS trg_post_reposts_count ON public.reposts;
CREATE TRIGGER trg_post_reposts_count
AFTER INSERT OR DELETE ON public.reposts
FOR EACH ROW EXECUTE FUNCTION public.tg_posts_reposts_count();

-- ============================================================
-- 2. ATTACH NOTIFICATION TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS trg_notify_post_like ON public.post_likes;
CREATE TRIGGER trg_notify_post_like
AFTER INSERT ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.notify_post_like();

DROP TRIGGER IF EXISTS trg_notify_comment ON public.post_comments;
CREATE TRIGGER trg_notify_comment
AFTER INSERT ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.notify_comment();

DROP TRIGGER IF EXISTS trg_notify_repost ON public.reposts;
CREATE TRIGGER trg_notify_repost
AFTER INSERT ON public.reposts
FOR EACH ROW EXECUTE FUNCTION public.notify_repost();

DROP TRIGGER IF EXISTS trg_notify_reaction ON public.post_reactions;
CREATE TRIGGER trg_notify_reaction
AFTER INSERT ON public.post_reactions
FOR EACH ROW EXECUTE FUNCTION public.notify_reaction();

-- ============================================================
-- 3. RATE LIMITING TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.enforce_post_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;
  IF NOT public.check_rate_limit(NEW.user_id::text, 'wall_post', 20, 3600) THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 20 posts per hour' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.enforce_comment_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;
  IF NOT public.check_rate_limit(NEW.user_id::text, 'wall_comment', 60, 3600) THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 60 comments per hour' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.enforce_like_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;
  IF NOT public.check_rate_limit(NEW.user_id::text, 'wall_like', 120, 3600) THEN
    RAISE EXCEPTION 'Rate limit exceeded: too many likes' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.enforce_repost_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;
  IF NOT public.check_rate_limit(NEW.user_id::text, 'wall_repost', 30, 3600) THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 30 reposts per hour' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_rate_limit_posts ON public.posts;
CREATE TRIGGER trg_rate_limit_posts
BEFORE INSERT ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.enforce_post_rate_limit();

DROP TRIGGER IF EXISTS trg_rate_limit_comments ON public.post_comments;
CREATE TRIGGER trg_rate_limit_comments
BEFORE INSERT ON public.post_comments
FOR EACH ROW EXECUTE FUNCTION public.enforce_comment_rate_limit();

DROP TRIGGER IF EXISTS trg_rate_limit_likes ON public.post_likes;
CREATE TRIGGER trg_rate_limit_likes
BEFORE INSERT ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.enforce_like_rate_limit();

DROP TRIGGER IF EXISTS trg_rate_limit_reposts ON public.reposts;
CREATE TRIGGER trg_rate_limit_reposts
BEFORE INSERT ON public.reposts
FOR EACH ROW EXECUTE FUNCTION public.enforce_repost_rate_limit();

-- ============================================================
-- 4. AUTO CONTENT MODERATION (banned terms -> mark sensitive)
-- ============================================================
CREATE OR REPLACE FUNCTION public.auto_moderate_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_text text;
  v_banned text[] := ARRAY[
    'nigger','faggot','retard','kike','spic','chink',
    'rape','kill yourself','kys',
    'child porn','cp ','underage nude',
    'free crypto','buy followers','adult webcam','onlyfans link','telegram +'
  ];
  v_term text;
BEGIN
  v_text := lower(COALESCE(NEW.content, ''));
  IF v_text = '' THEN RETURN NEW; END IF;

  FOREACH v_term IN ARRAY v_banned LOOP
    IF position(v_term IN v_text) > 0 THEN
      NEW.is_sensitive := true;
      NEW.sensitive_reason := COALESCE(NEW.sensitive_reason, 'auto: policy violation');
      EXIT;
    END IF;
  END LOOP;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_auto_moderate_post ON public.posts;
CREATE TRIGGER trg_auto_moderate_post
BEFORE INSERT OR UPDATE OF content ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.auto_moderate_post();

-- ============================================================
-- 5. WALL-MEDIA STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wall-media',
  'wall-media',
  true,
  52428800, -- 50 MB
  ARRAY[
    'image/jpeg','image/png','image/webp','image/gif','image/avif',
    'video/mp4','video/quicktime','video/webm'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "wall_media_public_read" ON storage.objects;
CREATE POLICY "wall_media_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'wall-media');

DROP POLICY IF EXISTS "wall_media_user_insert" ON storage.objects;
CREATE POLICY "wall_media_user_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'wall-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "wall_media_user_update" ON storage.objects;
CREATE POLICY "wall_media_user_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'wall-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "wall_media_user_delete" ON storage.objects;
CREATE POLICY "wall_media_user_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'wall-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
