
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  key TEXT PRIMARY KEY,
  user_id UUID,
  scope TEXT NOT NULL,
  response_body JSONB,
  response_status INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours')
);
CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON public.idempotency_keys(expires_at);
GRANT ALL ON public.idempotency_keys TO service_role;
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service role only" ON public.idempotency_keys;
CREATE POLICY "service role only" ON public.idempotency_keys FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.cleanup_idempotency_keys()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  DELETE FROM public.idempotency_keys WHERE expires_at < now();
$$;

CREATE TABLE IF NOT EXISTS public.async_jobs (
  id BIGSERIAL PRIMARY KEY,
  queue_name TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','done','failed')),
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  last_error TEXT,
  run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_at TIMESTAMPTZ,
  locked_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_async_jobs_pending ON public.async_jobs(queue_name, run_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_async_jobs_status ON public.async_jobs(status, created_at);
GRANT ALL ON public.async_jobs TO service_role;
GRANT SELECT ON public.async_jobs TO authenticated;
ALTER TABLE public.async_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "async_jobs service role" ON public.async_jobs;
CREATE POLICY "async_jobs service role" ON public.async_jobs FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "async_jobs admin read" ON public.async_jobs;
CREATE POLICY "async_jobs admin read" ON public.async_jobs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.enqueue_async_job(_queue TEXT, _payload JSONB, _run_at TIMESTAMPTZ DEFAULT now())
RETURNS BIGINT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id BIGINT;
BEGIN
  INSERT INTO public.async_jobs(queue_name, payload, run_at)
  VALUES (_queue, COALESCE(_payload, '{}'::jsonb), COALESCE(_run_at, now()))
  RETURNING id INTO _id;
  RETURN _id;
END $$;

CREATE OR REPLACE FUNCTION public.dequeue_async_jobs(_queue TEXT, _worker TEXT, _batch INT DEFAULT 10)
RETURNS SETOF public.async_jobs LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  UPDATE public.async_jobs j
  SET status = 'processing', locked_at = now(), locked_by = _worker, attempts = j.attempts + 1, updated_at = now()
  WHERE j.id IN (
    SELECT id FROM public.async_jobs
    WHERE queue_name = _queue AND status = 'pending' AND run_at <= now()
    ORDER BY run_at
    FOR UPDATE SKIP LOCKED
    LIMIT _batch
  )
  RETURNING j.*;
END $$;

CREATE OR REPLACE FUNCTION public.complete_async_job(_id BIGINT, _success BOOLEAN, _error TEXT DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _success THEN
    UPDATE public.async_jobs SET status = 'done', updated_at = now(), last_error = NULL WHERE id = _id;
  ELSE
    UPDATE public.async_jobs
    SET status = CASE WHEN attempts >= max_attempts THEN 'failed' ELSE 'pending' END,
        run_at = CASE WHEN attempts >= max_attempts THEN run_at ELSE now() + (attempts * interval '30 seconds') END,
        locked_at = NULL, locked_by = NULL, last_error = _error, updated_at = now()
    WHERE id = _id;
  END IF;
END $$;

-- POST COUNTERS DENORMALIZATION
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS likes_count INT NOT NULL DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS comments_count INT NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='post_likes') THEN
    UPDATE public.posts p SET likes_count = COALESCE((SELECT COUNT(*) FROM public.post_likes WHERE post_id = p.id), 0);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='post_comments') THEN
    UPDATE public.posts p SET comments_count = COALESCE((SELECT COUNT(*) FROM public.post_comments WHERE post_id = p.id), 0);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.bump_post_likes_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.bump_post_comments_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='post_likes') THEN
    DROP TRIGGER IF EXISTS trg_bump_post_likes ON public.post_likes;
    CREATE TRIGGER trg_bump_post_likes
    AFTER INSERT OR DELETE ON public.post_likes
    FOR EACH ROW EXECUTE FUNCTION public.bump_post_likes_count();
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='post_comments') THEN
    DROP TRIGGER IF EXISTS trg_bump_post_comments ON public.post_comments;
    CREATE TRIGGER trg_bump_post_comments
    AFTER INSERT OR DELETE ON public.post_comments
    FOR EACH ROW EXECUTE FUNCTION public.bump_post_comments_count();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.get_perf_stats()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _out JSONB;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  SELECT jsonb_build_object(
    'jobs_pending', (SELECT COUNT(*) FROM public.async_jobs WHERE status='pending'),
    'jobs_processing', (SELECT COUNT(*) FROM public.async_jobs WHERE status='processing'),
    'jobs_failed', (SELECT COUNT(*) FROM public.async_jobs WHERE status='failed'),
    'jobs_done_24h', (SELECT COUNT(*) FROM public.async_jobs WHERE status='done' AND updated_at > now() - interval '24 hours'),
    'idempotency_active', (SELECT COUNT(*) FROM public.idempotency_keys WHERE expires_at > now()),
    'db_size_mb', (SELECT pg_database_size(current_database())/1024/1024)
  ) INTO _out;
  RETURN _out;
END $$;

GRANT EXECUTE ON FUNCTION public.enqueue_async_job(TEXT, JSONB, TIMESTAMPTZ) TO service_role;
GRANT EXECUTE ON FUNCTION public.dequeue_async_jobs(TEXT, TEXT, INT) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_async_job(BIGINT, BOOLEAN, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_perf_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_idempotency_keys() TO service_role;
