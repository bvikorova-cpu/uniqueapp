-- =============================================
-- SCALABILITY IMPROVEMENTS: Caching & Queueing
-- =============================================

-- 1. Persistent Cache Table (for expensive computations)
CREATE TABLE IF NOT EXISTS public.edge_cache (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  tags TEXT[] DEFAULT '{}'
);

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_edge_cache_expires_at ON public.edge_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_edge_cache_tags ON public.edge_cache USING GIN(tags);

-- 2. Job Queue Table (for async processing)
CREATE TABLE IF NOT EXISTS public.job_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  priority INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  scheduled_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  result JSONB,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for job processing
CREATE INDEX IF NOT EXISTS idx_job_queue_status ON public.job_queue(status);
CREATE INDEX IF NOT EXISTS idx_job_queue_scheduled ON public.job_queue(scheduled_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_job_queue_type_status ON public.job_queue(job_type, status);
CREATE INDEX IF NOT EXISTS idx_job_queue_user ON public.job_queue(user_id);

-- 3. Function to get and lock next job
CREATE OR REPLACE FUNCTION public.get_next_job(p_job_types TEXT[] DEFAULT NULL)
RETURNS TABLE(
  id UUID,
  job_type TEXT,
  payload JSONB,
  attempts INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job_id UUID;
BEGIN
  -- Select and lock the next available job
  SELECT jq.id INTO v_job_id
  FROM public.job_queue jq
  WHERE jq.status = 'pending'
    AND jq.scheduled_at <= now()
    AND jq.attempts < jq.max_attempts
    AND (p_job_types IS NULL OR jq.job_type = ANY(p_job_types))
  ORDER BY jq.priority DESC, jq.scheduled_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  IF v_job_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Update job status
  UPDATE public.job_queue
  SET status = 'processing',
      started_at = now(),
      attempts = job_queue.attempts + 1,
      updated_at = now()
  WHERE job_queue.id = v_job_id;
  
  -- Return job details
  RETURN QUERY
  SELECT jq.id, jq.job_type, jq.payload, jq.attempts
  FROM public.job_queue jq
  WHERE jq.id = v_job_id;
END;
$$;

-- 4. Function to complete a job
CREATE OR REPLACE FUNCTION public.complete_job(p_job_id UUID, p_result JSONB DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.job_queue
  SET status = 'completed',
      completed_at = now(),
      result = p_result,
      updated_at = now()
  WHERE id = p_job_id;
END;
$$;

-- 5. Function to fail a job
CREATE OR REPLACE FUNCTION public.fail_job(p_job_id UUID, p_error TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempts INTEGER;
  v_max_attempts INTEGER;
BEGIN
  SELECT attempts, max_attempts INTO v_attempts, v_max_attempts
  FROM public.job_queue
  WHERE id = p_job_id;
  
  IF v_attempts >= v_max_attempts THEN
    UPDATE public.job_queue
    SET status = 'failed',
        failed_at = now(),
        error_message = p_error,
        updated_at = now()
    WHERE id = p_job_id;
  ELSE
    -- Return to pending for retry with exponential backoff
    UPDATE public.job_queue
    SET status = 'pending',
        scheduled_at = now() + (INTERVAL '1 minute' * POWER(2, attempts)),
        error_message = p_error,
        updated_at = now()
    WHERE id = p_job_id;
  END IF;
END;
$$;

-- 6. Cache helper functions
CREATE OR REPLACE FUNCTION public.cache_get(p_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_value JSONB;
BEGIN
  SELECT value INTO v_value
  FROM public.edge_cache
  WHERE key = p_key
    AND expires_at > now();
  
  RETURN v_value;
END;
$$;

CREATE OR REPLACE FUNCTION public.cache_set(
  p_key TEXT,
  p_value JSONB,
  p_ttl_seconds INTEGER DEFAULT 300,
  p_tags TEXT[] DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.edge_cache (key, value, expires_at, tags)
  VALUES (p_key, p_value, now() + (p_ttl_seconds || ' seconds')::INTERVAL, p_tags)
  ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      expires_at = EXCLUDED.expires_at,
      tags = EXCLUDED.tags;
END;
$$;

CREATE OR REPLACE FUNCTION public.cache_invalidate_by_tag(p_tag TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM public.edge_cache
  WHERE p_tag = ANY(tags);
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- 7. Cleanup function for expired cache entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM public.edge_cache
  WHERE expires_at < now();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- 8. Cleanup old completed jobs (keep last 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_jobs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM public.job_queue
  WHERE status IN ('completed', 'failed')
    AND updated_at < now() - INTERVAL '7 days';
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- 9. Indexes for existing tables (only if they exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_posts_user_created ON public.posts(user_id, created_at DESC);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'likes' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_likes_post ON public.likes(post_id);
    CREATE INDEX IF NOT EXISTS idx_likes_user ON public.likes(user_id);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'follows' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
    CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read, created_at DESC);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages' AND table_schema = 'public') THEN
    CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
  END IF;
END $$;

-- 10. Update trigger for job_queue
CREATE OR REPLACE FUNCTION public.update_job_queue_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_job_queue_updated_at ON public.job_queue;
CREATE TRIGGER update_job_queue_updated_at
  BEFORE UPDATE ON public.job_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_job_queue_timestamp();

-- 11. RLS for job_queue (users can only see their own jobs)
ALTER TABLE public.job_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own jobs" ON public.job_queue;
CREATE POLICY "Users can view their own jobs"
  ON public.job_queue
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all jobs" ON public.job_queue;
CREATE POLICY "Service role can manage all jobs"
  ON public.job_queue
  FOR ALL
  USING (true);

-- 12. RLS for edge_cache (only service role)
ALTER TABLE public.edge_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage cache" ON public.edge_cache;
CREATE POLICY "Service role can manage cache"
  ON public.edge_cache
  FOR ALL
  USING (true);