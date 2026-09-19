CREATE OR REPLACE FUNCTION public.mt_add_platform_share(_amount_eur numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _today date := (now() AT TIME ZONE 'UTC')::date;
BEGIN
  IF _amount_eur IS NULL OR _amount_eur <= 0 THEN
    RETURN;
  END IF;

  -- Active contest period first.
  UPDATE public.mt_contest_settings
     SET accumulated_platform_eur = accumulated_platform_eur + _amount_eur,
         updated_at = now()
   WHERE _today BETWEEN period_start AND period_end;

  -- No active period (gap between seasons): fund the next upcoming period
  -- so late-month signups count toward the next quarter.
  IF NOT FOUND THEN
    UPDATE public.mt_contest_settings
       SET accumulated_platform_eur = accumulated_platform_eur + _amount_eur,
           updated_at = now()
     WHERE id = (
       SELECT id FROM public.mt_contest_settings
        WHERE period_start > _today
        ORDER BY period_start ASC
        LIMIT 1
     );
  END IF;
END;
$function$;