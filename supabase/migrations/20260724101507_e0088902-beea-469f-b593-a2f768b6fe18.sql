ALTER TABLE public.mt_contest_settings
  ADD COLUMN IF NOT EXISTS revenue_share_pct numeric NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS min_prize_pool_eur numeric NOT NULL DEFAULT 5000,
  ADD COLUMN IF NOT EXISTS accumulated_platform_eur numeric NOT NULL DEFAULT 0;

-- Helper: add platform share to the currently active period (idempotency handled by caller via unique invoice).
CREATE OR REPLACE FUNCTION public.mt_add_platform_share(_amount_eur numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _today date := (now() AT TIME ZONE 'UTC')::date;
BEGIN
  IF _amount_eur IS NULL OR _amount_eur <= 0 THEN
    RETURN;
  END IF;

  UPDATE public.mt_contest_settings
     SET accumulated_platform_eur = accumulated_platform_eur + _amount_eur,
         updated_at = now()
   WHERE _today BETWEEN period_start AND period_end;
END;
$$;

REVOKE ALL ON FUNCTION public.mt_add_platform_share(numeric) FROM public;
GRANT EXECUTE ON FUNCTION public.mt_add_platform_share(numeric) TO service_role;