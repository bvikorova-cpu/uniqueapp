
-- ============================================================
-- 1) RLS enabled but no policy — add explicit admin/service-only
-- ============================================================
DROP POLICY IF EXISTS "Admins read api keys" ON public.brand_sponsor_api_keys;
DROP POLICY IF EXISTS "Service role manages api keys" ON public.brand_sponsor_api_keys;
CREATE POLICY "Admins read api keys"
  ON public.brand_sponsor_api_keys FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Service role manages api keys"
  ON public.brand_sponsor_api_keys FOR ALL
  USING ((auth.jwt() ->> 'role') = 'service_role')
  WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

DROP POLICY IF EXISTS "Service role manages mt rate limits" ON public.mt_rate_limits;
CREATE POLICY "Service role manages mt rate limits"
  ON public.mt_rate_limits FOR ALL
  USING ((auth.jwt() ->> 'role') = 'service_role')
  WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

-- ============================================================
-- 2) Rewrite all "Service role ..." always-true policies
-- ============================================================
DO $$
DECLARE
  r record;
  new_qual text;
  new_check text;
  sql text;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname, cmd, qual, with_check, roles, permissive
    FROM pg_policies
    WHERE schemaname = 'public'
      AND cmd IN ('UPDATE','DELETE','INSERT','ALL')
      AND (qual = 'true' OR with_check = 'true')
      AND policyname ILIKE 'Service role%'
  LOOP
    sql := format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    EXECUTE sql;

    new_qual  := CASE WHEN r.qual = 'true' THEN '(auth.jwt() ->> ''role'') = ''service_role''' ELSE r.qual END;
    new_check := CASE WHEN r.with_check = 'true' THEN '(auth.jwt() ->> ''role'') = ''service_role''' ELSE r.with_check END;

    IF r.cmd = 'INSERT' THEN
      sql := format('CREATE POLICY %I ON %I.%I FOR INSERT WITH CHECK (%s)',
                    r.policyname, r.schemaname, r.tablename, new_check);
    ELSIF r.cmd = 'UPDATE' THEN
      IF new_check IS NULL THEN
        sql := format('CREATE POLICY %I ON %I.%I FOR UPDATE USING (%s)',
                      r.policyname, r.schemaname, r.tablename, new_qual);
      ELSE
        sql := format('CREATE POLICY %I ON %I.%I FOR UPDATE USING (%s) WITH CHECK (%s)',
                      r.policyname, r.schemaname, r.tablename, new_qual, new_check);
      END IF;
    ELSIF r.cmd = 'DELETE' THEN
      sql := format('CREATE POLICY %I ON %I.%I FOR DELETE USING (%s)',
                    r.policyname, r.schemaname, r.tablename, new_qual);
    ELSIF r.cmd = 'ALL' THEN
      IF new_check IS NULL THEN
        sql := format('CREATE POLICY %I ON %I.%I FOR ALL USING (%s)',
                      r.policyname, r.schemaname, r.tablename, new_qual);
      ELSE
        sql := format('CREATE POLICY %I ON %I.%I FOR ALL USING (%s) WITH CHECK (%s)',
                      r.policyname, r.schemaname, r.tablename, new_qual, new_check);
      END IF;
    END IF;

    EXECUTE sql;
  END LOOP;
END $$;
