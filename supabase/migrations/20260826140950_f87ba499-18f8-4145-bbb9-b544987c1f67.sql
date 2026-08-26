CREATE OR REPLACE FUNCTION public.get_my_active_subscriptions()
 RETURNS TABLE(module text, tier text, status text, expires_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  r record;
  uid uuid := auth.uid();
  status_col text;
  tier_col text;
  exp_col text;
  stripe_col text;
  sql text;
  -- tables that are technical or belong to retired / credit-based modules
  denylist text[] := ARRAY[
    'push_subscriptions','shadow_push_subscriptions','forum_subscriptions',
    'dating_subscriptions','anonymous_dating_subscriptions','couples_subscriptions',
    'influencer_subscriptions','marketplace_subscriptions','creator_subscriptions',
    'user_subscriptions'
  ];
BEGIN
  IF uid IS NULL THEN
    RETURN;
  END IF;

  FOR r IN
    SELECT c.relname::text AS table_name,
           array_agg(a.attname::text) AS cols
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relname LIKE '%\_subscriptions'
      AND NOT (c.relname::text = ANY(denylist))
    GROUP BY c.relname
    HAVING bool_or(a.attname = 'user_id')
  LOOP
    status_col := CASE
      WHEN 'status' = ANY(r.cols) THEN 'status'
      WHEN 'subscription_status' = ANY(r.cols) THEN 'subscription_status'
      WHEN 'active' = ANY(r.cols) THEN 'active'
      ELSE NULL END;

    exp_col := CASE
      WHEN 'current_period_end' = ANY(r.cols) THEN 'current_period_end'
      WHEN 'expires_at' = ANY(r.cols) THEN 'expires_at'
      WHEN 'subscription_end' = ANY(r.cols) THEN 'subscription_end'
      ELSE NULL END;

    tier_col := CASE
      WHEN 'tier' = ANY(r.cols) THEN 'tier'
      WHEN 'subscription_type' = ANY(r.cols) THEN 'subscription_type'
      WHEN 'plan_type' = ANY(r.cols) THEN 'plan_type'
      ELSE NULL END;

    stripe_col := CASE
      WHEN 'stripe_subscription_id' = ANY(r.cols) THEN 'stripe_subscription_id'
      ELSE NULL END;

    IF status_col IS NULL THEN
      CONTINUE;
    END IF;

    sql := format(
      'SELECT %L::text, %s::text, %s::text, %s::timestamptz FROM public.%I WHERE user_id = %L',
      replace(r.table_name, '_subscriptions', ''),
      COALESCE(tier_col, 'NULL'),
      status_col,
      COALESCE(exp_col, 'NULL'),
      r.table_name,
      uid
    );

    -- only genuinely active states
    IF status_col = 'active' THEN
      sql := sql || ' AND active = true';
    ELSE
      sql := sql || format(
        ' AND lower(%I::text) IN (''active'',''trialing'',''past_due'')', status_col);
    END IF;

    -- never surface free / placeholder tiers
    IF tier_col IS NOT NULL THEN
      sql := sql || format(
        ' AND (%I IS NULL OR lower(%I::text) NOT IN (''free'',''none'',''trial_expired''))',
        tier_col, tier_col);
    END IF;

    -- must be currently valid: future period end, or a real payment subscription
    IF exp_col IS NOT NULL AND stripe_col IS NOT NULL THEN
      sql := sql || format(' AND (%I > now() OR %I IS NOT NULL)', exp_col, stripe_col);
    ELSIF exp_col IS NOT NULL THEN
      sql := sql || format(' AND %I > now()', exp_col);
    ELSIF stripe_col IS NOT NULL THEN
      sql := sql || format(' AND %I IS NOT NULL', stripe_col);
    ELSE
      -- no expiry and no payment reference => cannot be verified as real
      CONTINUE;
    END IF;

    sql := sql || ' ORDER BY 4 DESC NULLS LAST LIMIT 1';

    BEGIN
      RETURN QUERY EXECUTE sql;
    EXCEPTION WHEN others THEN
      CONTINUE;
    END;
  END LOOP;
END;
$function$;