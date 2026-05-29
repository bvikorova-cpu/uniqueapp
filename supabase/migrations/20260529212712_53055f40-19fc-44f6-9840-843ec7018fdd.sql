DROP FUNCTION IF EXISTS public.are_friends(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_following(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_blocked_between(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_muted_by(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.can_view_post(uuid, uuid, text) CASCADE;

CREATE FUNCTION public.are_friends(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
      AND ((user_id = _a AND friend_id = _b) OR (user_id = _b AND friend_id = _a)));
$$;

CREATE FUNCTION public.is_following(_follower uuid, _target uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_follows WHERE follower_id = _follower AND following_id = _target);
$$;

CREATE FUNCTION public.is_blocked_between(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.blocked_users
    WHERE (user_id = _a AND blocked_user_id = _b) OR (user_id = _b AND blocked_user_id = _a));
$$;

CREATE FUNCTION public.is_muted_by(_viewer uuid, _author uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_mutes
    WHERE user_id = _viewer AND muted_user_id = _author
      AND (expires_at IS NULL OR expires_at > now()));
$$;

CREATE FUNCTION public.can_view_post(_viewer uuid, _author uuid, _privacy text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN _author = _viewer THEN true
    WHEN _viewer IS NULL THEN COALESCE(_privacy, 'public') = 'public'
    WHEN public.is_blocked_between(_viewer, _author) THEN false
    WHEN public.is_muted_by(_viewer, _author) THEN false
    WHEN COALESCE(_privacy, 'public') = 'public' THEN true
    WHEN _privacy = 'friends' THEN public.are_friends(_viewer, _author)
    WHEN _privacy = 'followers' THEN public.is_following(_viewer, _author)
    WHEN _privacy = 'private' THEN false
    ELSE false END
$$;

DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;
DROP POLICY IF EXISTS "Posts visible by privacy rules" ON public.posts;
CREATE POLICY "Posts visible by privacy rules"
ON public.posts FOR SELECT
USING (public.can_view_post(auth.uid(), user_id, privacy));

DROP POLICY IF EXISTS "Reposts are viewable by everyone" ON public.reposts;
DROP POLICY IF EXISTS "Reposts visible if original is visible" ON public.reposts;
CREATE POLICY "Reposts visible if original is visible"
ON public.reposts FOR SELECT
USING (EXISTS (SELECT 1 FROM public.posts p
  WHERE p.id = reposts.original_post_id
    AND public.can_view_post(auth.uid(), p.user_id, p.privacy)));

-- Reset counts to reality
UPDATE public.posts p SET
  likes_count    = COALESCE((SELECT count(*) FROM public.post_likes     WHERE post_id = p.id), 0)
                 + COALESCE((SELECT count(*) FROM public.post_reactions WHERE post_id = p.id), 0),
  comments_count = COALESCE((SELECT count(*) FROM public.post_comments  WHERE post_id = p.id), 0),
  reposts_count  = COALESCE((SELECT count(*) FROM public.reposts        WHERE original_post_id = p.id), 0);

CREATE OR REPLACE FUNCTION public.tg_posts_likes_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.tg_posts_comments_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.tg_posts_reposts_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET reposts_count = reposts_count + 1 WHERE id = NEW.original_post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET reposts_count = GREATEST(reposts_count - 1, 0) WHERE id = OLD.original_post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_post_likes_count     ON public.post_likes;
DROP TRIGGER IF EXISTS trg_post_reactions_count ON public.post_reactions;
DROP TRIGGER IF EXISTS trg_post_comments_count  ON public.post_comments;
DROP TRIGGER IF EXISTS trg_reposts_count        ON public.reposts;

CREATE TRIGGER trg_post_likes_count     AFTER INSERT OR DELETE ON public.post_likes     FOR EACH ROW EXECUTE FUNCTION public.tg_posts_likes_count();
CREATE TRIGGER trg_post_reactions_count AFTER INSERT OR DELETE ON public.post_reactions FOR EACH ROW EXECUTE FUNCTION public.tg_posts_likes_count();
CREATE TRIGGER trg_post_comments_count  AFTER INSERT OR DELETE ON public.post_comments  FOR EACH ROW EXECUTE FUNCTION public.tg_posts_comments_count();
CREATE TRIGGER trg_reposts_count        AFTER INSERT OR DELETE ON public.reposts        FOR EACH ROW EXECUTE FUNCTION public.tg_posts_reposts_count();

CREATE INDEX IF NOT EXISTS idx_posts_created_at_desc       ON public.posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_created_desc     ON public.posts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_privacy_created_desc  ON public.posts (privacy, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friendships_pair_status     ON public.friendships (user_id, friend_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_pair_status_rev ON public.friendships (friend_id, user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_follows_pair           ON public.user_follows (follower_id, following_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_pair          ON public.blocked_users (user_id, blocked_user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_pair_rev      ON public.blocked_users (blocked_user_id, user_id);
CREATE INDEX IF NOT EXISTS idx_user_mutes_pair             ON public.user_mutes (user_id, muted_user_id);