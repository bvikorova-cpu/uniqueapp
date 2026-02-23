
-- Drop existing function with old parameter names
DROP FUNCTION IF EXISTS public.check_rate_limit(text, text, integer, integer);

-- Recreate with correct parameter names
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_action_type text,
  p_max_requests integer,
  p_window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start timestamptz;
  v_count integer;
BEGIN
  v_window_start := now() - (p_window_seconds || ' seconds')::interval;
  
  SELECT count(*) INTO v_count
  FROM rate_limit_entries
  WHERE identifier = p_identifier
    AND action_type = p_action_type
    AND created_at >= v_window_start;
  
  IF v_count >= p_max_requests THEN
    RETURN false;
  END IF;
  
  INSERT INTO rate_limit_entries (identifier, action_type)
  VALUES (p_identifier, p_action_type);
  
  IF random() < 0.01 THEN
    DELETE FROM rate_limit_entries
    WHERE created_at < now() - interval '2 hours';
  END IF;
  
  RETURN true;
END;
$$;
