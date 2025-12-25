-- Performance indexes for existing tables
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id_created_at ON public.posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_pair ON public.follows(follower_id, following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_post ON public.bookmarks(user_id, post_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON public.conversation_participants(user_id);

-- Rate limits index optimization
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON public.rate_limits(action_type, identifier, window_start);

-- Drop existing function first
DROP FUNCTION IF EXISTS public.check_rate_limit(text, text, integer, integer);

-- Create rate limit function
CREATE FUNCTION public.check_rate_limit(
  p_action_type text,
  p_identifier text,
  p_max_requests integer DEFAULT 100,
  p_window_seconds integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start timestamp with time zone;
  v_current_count integer;
BEGIN
  v_window_start := now() - (p_window_seconds || ' seconds')::interval;
  
  SELECT COALESCE(SUM(request_count), 0) INTO v_current_count
  FROM public.rate_limits
  WHERE action_type = p_action_type
    AND identifier = p_identifier
    AND window_start >= v_window_start;
  
  IF v_current_count >= p_max_requests THEN
    RETURN false;
  END IF;
  
  INSERT INTO public.rate_limits (action_type, identifier, request_count, window_start)
  VALUES (p_action_type, p_identifier, 1, now());
  
  RETURN true;
END;
$$;

-- Cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_start < now() - interval '1 hour';
END;
$$;