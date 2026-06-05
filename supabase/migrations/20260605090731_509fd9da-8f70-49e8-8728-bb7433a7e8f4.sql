CREATE TABLE IF NOT EXISTS public.mt_rate_limits (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, action, window_start)
);
GRANT ALL ON public.mt_rate_limits TO service_role;
ALTER TABLE public.mt_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_mt_rate_limits_cleanup ON public.mt_rate_limits (window_start);

-- Atomic check-and-increment. Returns true if allowed, false if over limit.
CREATE OR REPLACE FUNCTION public.mt_rate_limit_check(
  _user_id uuid,
  _action text,
  _window_seconds int,
  _max_count int
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _bucket timestamptz := to_timestamp(floor(extract(epoch from now()) / _window_seconds) * _window_seconds);
  _current int;
BEGIN
  INSERT INTO public.mt_rate_limits (user_id, action, window_start, count)
  VALUES (_user_id, _action, _bucket, 1)
  ON CONFLICT (user_id, action, window_start)
  DO UPDATE SET count = public.mt_rate_limits.count + 1
  RETURNING count INTO _current;
  RETURN _current <= _max_count;
END;
$$;
REVOKE ALL ON FUNCTION public.mt_rate_limit_check(uuid, text, int, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mt_rate_limit_check(uuid, text, int, int) TO service_role;