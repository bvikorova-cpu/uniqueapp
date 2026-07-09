-- Fix: check_rate_limit relied on auth.uid() but is called from service-role edge functions.
-- Add optional _user_id param and fall back to auth.uid() so both callers work.
DROP FUNCTION IF EXISTS public.check_rate_limit(text, integer, integer);

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _bucket text,
  _max integer,
  _window_seconds integer,
  _user_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid := COALESCE(_user_id, auth.uid());
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
$function$;

GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer, uuid) TO authenticated, service_role;

-- Remove old no-arg claim_daily_reward_atomic (superseded by the _user_id variant).
DROP FUNCTION IF EXISTS public.claim_daily_reward_atomic();