CREATE OR REPLACE FUNCTION public.get_my_active_subscriptions()
RETURNS TABLE(module text, tier text, status text, expires_at timestamptz)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  uid uuid := auth.uid();
  status_col text;
  tier_col text;
  exp_col text;
  sql text;
BEGIN
  IF uid IS NULL THEN
    RETURN;
  END IF;

  FOR r IN
    SELECT c.table_name,
           array_agg(c.column_name::text) AS cols
    FROM information_schema.columns c
    JOIN information_schema.tables t
      ON t.table_schema = c.table_schema AND t.table_name = c.table_name AND t.table_type = 'BASE TABLE'
    WHERE c.table_schema = 'public'
      AND c.table_name LIKE '%\_subscriptions'
    GROUP BY c.table_name
    HAVING bool_or(c.column_name = 'user_id')
  LOOP
    status_col := CASE
      WHEN 'status' = ANY(r.cols) THEN 'status'
      WHEN 'subscription_status' = ANY(r.cols) THEN 'subscription_status'
      WHEN 'active' = ANY(r.cols) THEN 'active'
      ELSE NULL END;

    exp_col := CASE
      WHEN 'expires_at' = ANY(r.cols) THEN 'expires_at'
      WHEN 'current_period_end' = ANY(r.cols) THEN 'current_period_end'
      WHEN 'subscription_end' = ANY(r.cols) THEN 'subscription_end'
      ELSE NULL END;

    tier_col := CASE
      WHEN 'tier' = ANY(r.cols) THEN 'tier'
      WHEN 'subscription_type' = ANY(r.cols) THEN 'subscription_type'
      WHEN 'plan_type' = ANY(r.cols) THEN 'plan_type'
      ELSE NULL END;

    IF status_col IS NULL AND exp_col IS NULL THEN
      CONTINUE;
    END IF;

    sql := format(
      'SELECT %L::text, %s::text, %s::text, %s::timestamptz FROM public.%I WHERE user_id = %L',
      replace(r.table_name, '_subscriptions', ''),
      COALESCE(tier_col, 'NULL'),
      COALESCE(status_col, '''active'''),
      COALESCE(exp_col, 'NULL'),
      r.table_name,
      uid
    );

    IF status_col = 'active' THEN
      sql := sql || ' AND active = true';
    ELSIF status_col IS NOT NULL THEN
      sql := sql || format(' AND lower(%I::text) IN (''active'',''trialing'',''past_due'')', status_col);
    END IF;

    IF exp_col IS NOT NULL THEN
      sql := sql || format(' AND (%I IS NULL OR %I > now())', exp_col, exp_col);
    END IF;

    sql := sql || ' ORDER BY 4 DESC NULLS LAST LIMIT 1';

    BEGIN
      RETURN QUERY EXECUTE sql;
    EXCEPTION WHEN others THEN
      CONTINUE;
    END;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_active_subscriptions() FROM public;
GRANT EXECUTE ON FUNCTION public.get_my_active_subscriptions() TO authenticated;