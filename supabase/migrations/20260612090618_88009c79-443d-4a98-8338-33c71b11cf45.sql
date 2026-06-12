
-- A. GLOBAL RATE LIMIT
CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  user_id uuid NOT NULL,
  bucket text NOT NULL,
  window_start timestamptz NOT NULL,
  count int NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, bucket, window_start)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rate_limit_buckets TO authenticated;
GRANT ALL ON public.rate_limit_buckets TO service_role;
ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own buckets" ON public.rate_limit_buckets;
CREATE POLICY "own buckets" ON public.rate_limit_buckets FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_rlb_cleanup ON public.rate_limit_buckets (window_start);

CREATE OR REPLACE FUNCTION public.check_rate_limit(_bucket text, _max int, _window_seconds int)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _win timestamptz := date_trunc('second', now()) - (extract(epoch from now())::bigint % _window_seconds) * interval '1 second';
  _cnt int;
BEGIN
  IF _uid IS NULL THEN RETURN false; END IF;
  INSERT INTO public.rate_limit_buckets (user_id, bucket, window_start, count)
  VALUES (_uid, _bucket, _win, 1)
  ON CONFLICT (user_id, bucket, window_start)
  DO UPDATE SET count = rate_limit_buckets.count + 1
  RETURNING count INTO _cnt;
  RETURN _cnt <= _max;
END;
$$;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, int, int) TO authenticated;

CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_buckets()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  DELETE FROM public.rate_limit_buckets WHERE window_start < now() - interval '24 hours';
$$;

-- D. FULL-TEXT SEARCH
CREATE INDEX IF NOT EXISTS idx_posts_fts ON public.posts USING gin (to_tsvector('simple', coalesce(content,'')));
CREATE INDEX IF NOT EXISTS idx_profiles_fts ON public.profiles USING gin (to_tsvector('simple', coalesce(full_name,'') || ' ' || coalesce(username,'') || ' ' || coalesce(bio,'')));
CREATE INDEX IF NOT EXISTS idx_jobs_fts ON public.job_listings USING gin (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,'')));
CREATE INDEX IF NOT EXISTS idx_communities_fts ON public.communities USING gin (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(description,'')));

CREATE OR REPLACE FUNCTION public.search_posts(_q text, _limit int DEFAULT 20)
RETURNS TABLE(id uuid, user_id uuid, content text, created_at timestamptz, rank real)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.user_id, p.content, p.created_at,
         ts_rank(to_tsvector('simple', coalesce(p.content,'')), plainto_tsquery('simple', _q)) AS rank
  FROM public.posts p
  WHERE to_tsvector('simple', coalesce(p.content,'')) @@ plainto_tsquery('simple', _q)
    AND coalesce(p.privacy,'public') = 'public'
  ORDER BY rank DESC, p.created_at DESC
  LIMIT least(_limit, 100);
$$;
GRANT EXECUTE ON FUNCTION public.search_posts(text, int) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.search_profiles_fts(_q text, _limit int DEFAULT 20)
RETURNS TABLE(id uuid, full_name text, username text, avatar_url text, bio text, rank real)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT pr.id, pr.full_name, pr.username, pr.avatar_url, pr.bio,
         ts_rank(to_tsvector('simple', coalesce(pr.full_name,'') || ' ' || coalesce(pr.username,'') || ' ' || coalesce(pr.bio,'')),
                 plainto_tsquery('simple', _q)) AS rank
  FROM public.profiles pr
  WHERE to_tsvector('simple', coalesce(pr.full_name,'') || ' ' || coalesce(pr.username,'') || ' ' || coalesce(pr.bio,''))
        @@ plainto_tsquery('simple', _q)
  ORDER BY rank DESC
  LIMIT least(_limit, 100);
$$;
GRANT EXECUTE ON FUNCTION public.search_profiles_fts(text, int) TO anon, authenticated;

-- E. FEED CACHE
CREATE TABLE IF NOT EXISTS public.user_feed_cache (
  user_id uuid NOT NULL,
  post_id uuid NOT NULL,
  author_id uuid NOT NULL,
  score real NOT NULL DEFAULT 0,
  inserted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);
GRANT SELECT ON public.user_feed_cache TO authenticated;
GRANT ALL ON public.user_feed_cache TO service_role;
ALTER TABLE public.user_feed_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own feed cache" ON public.user_feed_cache;
CREATE POLICY "own feed cache" ON public.user_feed_cache FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_ufc_user_time ON public.user_feed_cache (user_id, inserted_at DESC);
CREATE INDEX IF NOT EXISTS idx_ufc_post ON public.user_feed_cache (post_id);

CREATE OR REPLACE FUNCTION public.fanout_post_to_followers()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _follower_count int;
BEGIN
  IF coalesce(NEW.privacy,'public') <> 'public' THEN RETURN NEW; END IF;
  SELECT count(*) INTO _follower_count FROM public.follows WHERE following_id = NEW.user_id;
  IF _follower_count > 5000 THEN RETURN NEW; END IF;
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
$$;
DROP TRIGGER IF EXISTS trg_fanout_post ON public.posts;
CREATE TRIGGER trg_fanout_post AFTER INSERT ON public.posts FOR EACH ROW EXECUTE FUNCTION public.fanout_post_to_followers();

CREATE OR REPLACE FUNCTION public.trim_user_feed_cache()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  DELETE FROM public.user_feed_cache WHERE inserted_at < now() - interval '30 days';
$$;

-- F. SPAM SIGNALS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS spam_score int NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.compute_spam_score(_user_id uuid)
RETURNS int LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _score int := 0; _age_hours numeric; _follow_count int; _has_avatar boolean; _has_bio boolean;
BEGIN
  SELECT extract(epoch from (now() - created_at))/3600, coalesce(avatar_url,'') <> '', coalesce(bio,'') <> ''
  INTO _age_hours, _has_avatar, _has_bio FROM public.profiles WHERE id = _user_id;
  IF _age_hours IS NULL THEN RETURN 0; END IF;
  SELECT count(*) INTO _follow_count FROM public.follows WHERE follower_id = _user_id AND created_at > now() - interval '1 hour';
  IF _age_hours < 24 THEN _score := _score + 30; END IF;
  IF NOT _has_avatar THEN _score := _score + 20; END IF;
  IF NOT _has_bio THEN _score := _score + 15; END IF;
  IF _follow_count > 20 THEN _score := _score + 40; END IF;
  IF _follow_count > 50 THEN _score := _score + 30; END IF;
  RETURN least(_score, 100);
END;
$$;
GRANT EXECUTE ON FUNCTION public.compute_spam_score(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.block_spam_follows()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _s int;
BEGIN
  _s := public.compute_spam_score(NEW.follower_id);
  IF _s >= 80 THEN RAISE EXCEPTION 'spam_blocked: account flagged (score=%)', _s USING ERRCODE = 'check_violation'; END IF;
  UPDATE public.profiles SET spam_score = _s WHERE id = NEW.follower_id;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_block_spam_follows ON public.follows;
CREATE TRIGGER trg_block_spam_follows BEFORE INSERT ON public.follows FOR EACH ROW EXECUTE FUNCTION public.block_spam_follows();

-- G. HOT-PATH INDEXES
CREATE INDEX IF NOT EXISTS idx_posts_created_desc ON public.posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_created ON public.posts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dating_swipes_user_time ON public.dating_swipes (swiper_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications (user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_msgs_conv_time ON public.conversation_messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows (following_id);
