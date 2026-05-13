-- Add SET search_path = public to functions missing it (security hardening)

CREATE OR REPLACE FUNCTION public._iq_test_config(_category text)
 RETURNS TABLE(qcount integer, credits integer, diff text, only_category text)
 LANGUAGE sql
 IMMUTABLE
 SET search_path = public
AS $function$
  SELECT t.qcount, t.credits, t.diff, t.only_category FROM (VALUES
    ('beginner',     20, 10, 'easy'::text,   NULL::text),
    ('intermediate', 25, 15, 'medium',       NULL),
    ('advanced',     30, 20, 'hard',         NULL),
    ('expert',       30, 25, 'expert',       NULL),
    ('logical',      15,  8, NULL,           'logical'),
    ('spatial',      15,  8, NULL,           'spatial'),
    ('verbal',       15,  8, NULL,           'verbal'),
    ('numerical',    15,  8, NULL,           'numerical'),
    ('memory',       15,  8, NULL,           'memory'),
    ('pattern',      15,  8, NULL,           'pattern')
  ) AS t(cat, qcount, credits, diff, only_category)
  WHERE t.cat = _category;
$function$;

CREATE OR REPLACE FUNCTION public.erf(x numeric)
 RETURNS numeric
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path = public
AS $function$
DECLARE
  a1 numeric := 0.254829592; a2 numeric := -0.284496736; a3 numeric := 1.421413741;
  a4 numeric := -1.453152027; a5 numeric := 1.061405429; p numeric := 0.3275911;
  s int; ax numeric; t numeric; y numeric;
BEGIN
  s := CASE WHEN x < 0 THEN -1 ELSE 1 END;
  ax := abs(x);
  t := 1 / (1 + p * ax);
  y := 1 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t * exp(-ax*ax);
  RETURN s * y;
END $function$;

CREATE OR REPLACE FUNCTION public.iq_percentile(_iq integer)
 RETURNS numeric
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path = public
AS $function$
DECLARE
  z numeric;
  p numeric;
  t numeric;
BEGIN
  z := (_iq::numeric - 100) / 15.0;
  t := 1.0 / (1.0 + 0.3275911 * abs(z) / sqrt(2));
  p := 1 - (((((1.061405429*t - 1.453152027)*t) + 1.421413741)*t - 0.284496736)*t + 0.254829592)*t * exp(-(z*z)/2);
  IF z < 0 THEN p := 1 - p; END IF;
  RETURN round(p * 100, 2);
END;
$function$;

CREATE OR REPLACE FUNCTION public.iq_tier_from_score(_iq integer)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
 SET search_path = public
AS $function$
  SELECT CASE
    WHEN _iq >= 145 THEN 'Legend'
    WHEN _iq >= 135 THEN 'Grandmaster'
    WHEN _iq >= 125 THEN 'Master'
    WHEN _iq >= 115 THEN 'Diamond'
    WHEN _iq >= 105 THEN 'Platinum'
    WHEN _iq >= 95  THEN 'Gold'
    WHEN _iq >= 85  THEN 'Silver'
    ELSE 'Bronze'
  END;
$function$;

CREATE OR REPLACE FUNCTION public.tg_ar_touch_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN NEW.updated_at = now(); RETURN NEW; END $function$;
