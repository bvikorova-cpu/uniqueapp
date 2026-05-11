
-- Weekly Auto-Tournament: function + pg_cron schedule
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.create_weekly_iq_tournament()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_start timestamptz;
  v_end timestamptz;
  v_week int;
BEGIN
  -- Next Saturday 18:00 UTC
  v_start := date_trunc('week', now()) + interval '5 days 18 hours';
  IF v_start <= now() THEN
    v_start := v_start + interval '7 days';
  END IF;
  v_end := v_start + interval '2 hours';
  v_week := extract(week from v_start);

  -- Idempotent: skip if already created for this start time
  SELECT id INTO v_id FROM public.iq_competitions
  WHERE title = 'Weekly IQ Cup #' || v_week::text
  LIMIT 1;
  IF v_id IS NOT NULL THEN
    RETURN v_id;
  END IF;

  INSERT INTO public.iq_competitions (
    title, description, entry_fee, prize_pool, start_time, end_time,
    max_participants, status, bracket_size, format
  ) VALUES (
    'Weekly IQ Cup #' || v_week::text,
    'Automated weekly IQ tournament. Top 3 win credit prizes.',
    5, 100, v_start, v_end, 16, 'upcoming', 16, 'single_elim'
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Schedule: every Monday at 09:00 UTC
SELECT cron.unschedule('weekly-iq-tournament') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'weekly-iq-tournament'
);

SELECT cron.schedule(
  'weekly-iq-tournament',
  '0 9 * * 1',
  $$ SELECT public.create_weekly_iq_tournament(); $$
);

-- Create the first one immediately
SELECT public.create_weekly_iq_tournament();
