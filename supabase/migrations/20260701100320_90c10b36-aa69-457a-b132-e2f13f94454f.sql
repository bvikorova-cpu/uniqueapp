
-- Enable pg_cron for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Bulk monthly top-up: proactively grant +10 credits to ALL users on 1st of each month.
-- Idempotent: only grants if user's month_key differs from current Europe/Bratislava month.
CREATE OR REPLACE FUNCTION public.grant_monthly_free_credits_all()
RETURNS TABLE(users_granted integer, users_seeded integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_settings public.free_tier_settings;
  v_current_month text;
  v_granted integer := 0;
  v_seeded integer := 0;
BEGIN
  SELECT * INTO v_settings FROM public.free_tier_settings WHERE id = 1 LIMIT 1;
  IF NOT COALESCE(v_settings.enabled, true) OR COALESCE(v_settings.monthly_amount, 0) <= 0 THEN
    RETURN QUERY SELECT 0, 0;
    RETURN;
  END IF;

  v_current_month := to_char(
    (now() AT TIME ZONE COALESCE(v_settings.timezone, 'Europe/Bratislava')),
    'YYYY-MM'
  );

  -- Seed rows for users who never had free_tier_credits
  WITH inserted AS (
    INSERT INTO public.free_tier_credits (user_id, month_key, balance)
    SELECT u.id, v_current_month, v_settings.monthly_amount
      FROM auth.users u
      LEFT JOIN public.free_tier_credits f ON f.user_id = u.id
     WHERE f.user_id IS NULL
    ON CONFLICT (user_id) DO NOTHING
    RETURNING user_id, balance
  )
  SELECT count(*) INTO v_seeded FROM inserted;

  -- Ledger entries for seeded users
  INSERT INTO public.free_tier_credit_ledger (user_id, delta, reason, balance_after)
  SELECT f.user_id, v_settings.monthly_amount, 'Monthly top-up (cron seed)', f.balance
    FROM public.free_tier_credits f
   WHERE f.month_key = v_current_month
     AND f.balance = v_settings.monthly_amount
     AND NOT EXISTS (
       SELECT 1 FROM public.free_tier_credit_ledger l
        WHERE l.user_id = f.user_id
          AND l.reason = 'Monthly top-up (cron seed)'
          AND l.created_at > (now() - interval '5 minutes')
     );

  -- Top-up existing users whose month_key is stale
  WITH updated AS (
    UPDATE public.free_tier_credits
       SET balance = COALESCE(balance, 0) + v_settings.monthly_amount,
           month_key = v_current_month,
           updated_at = now()
     WHERE month_key IS DISTINCT FROM v_current_month
    RETURNING user_id, balance
  )
  SELECT count(*) INTO v_granted FROM updated;

  -- Ledger entries for topped-up users
  INSERT INTO public.free_tier_credit_ledger (user_id, delta, reason, balance_after)
  SELECT f.user_id, v_settings.monthly_amount, 'Monthly top-up (cron)', f.balance
    FROM public.free_tier_credits f
   WHERE f.month_key = v_current_month
     AND f.updated_at > (now() - interval '5 minutes')
     AND NOT EXISTS (
       SELECT 1 FROM public.free_tier_credit_ledger l
        WHERE l.user_id = f.user_id
          AND l.reason = 'Monthly top-up (cron)'
          AND l.created_at > (now() - interval '5 minutes')
     );

  RETURN QUERY SELECT v_granted, v_seeded;
END;
$$;

-- Schedule: 02:05 Europe/Bratislava on 1st of each month.
-- pg_cron runs in UTC, so 00:05 UTC on 1st ≈ 02:05 CEST / 01:05 CET.
-- We run at 00:05 UTC to be safely into the new month in Bratislava TZ.
DO $$
BEGIN
  PERFORM cron.unschedule('grant-monthly-free-credits');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'grant-monthly-free-credits',
  '5 0 1 * *',
  $$ SELECT public.grant_monthly_free_credits_all(); $$
);
