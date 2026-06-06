
CREATE OR REPLACE FUNCTION public.check_anon_dating_rate_limit(
  p_user_id uuid,
  p_action text,
  p_max_per_minute integer DEFAULT 20
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start timestamptz := date_trunc('minute', now());
  v_count integer;
BEGIN
  INSERT INTO public.mt_rate_limits (user_id, action, window_start, count)
  VALUES (p_user_id, p_action, v_window_start, 1)
  ON CONFLICT (user_id, action, window_start)
  DO UPDATE SET count = public.mt_rate_limits.count + 1
  RETURNING count INTO v_count;

  RETURN v_count <= p_max_per_minute;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_anon_dating_rate_limit(uuid, text, integer) TO authenticated, service_role;

-- Ensure unique index for ON CONFLICT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' AND indexname='mt_rate_limits_user_action_window_uidx'
  ) THEN
    CREATE UNIQUE INDEX mt_rate_limits_user_action_window_uidx
      ON public.mt_rate_limits (user_id, action, window_start);
  END IF;
END $$;
