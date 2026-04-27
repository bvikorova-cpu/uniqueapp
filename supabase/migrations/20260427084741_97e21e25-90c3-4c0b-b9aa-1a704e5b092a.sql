
-- GDPR Right to Erasure: dynamic purge function.
-- Deletes all rows belonging to a user across every public table that has a
-- user_id column (or profiles.id). Runs as SECURITY DEFINER so it bypasses RLS.
-- Caller must already be authorized (edge function uses service role + JWT check).

CREATE OR REPLACE FUNCTION public.gdpr_purge_user_data(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  rec record;
  total_deleted bigint := 0;
  per_table jsonb := '{}'::jsonb;
  rows_affected bigint;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'user_id required';
  END IF;

  -- 1. Delete from every public table that has a user_id column
  FOR rec IN
    SELECT c.table_name
    FROM information_schema.columns c
    JOIN information_schema.tables t
      ON t.table_schema = c.table_schema AND t.table_name = c.table_name
    WHERE c.table_schema = 'public'
      AND c.column_name = 'user_id'
      AND t.table_type = 'BASE TABLE'
  LOOP
    BEGIN
      EXECUTE format('DELETE FROM public.%I WHERE user_id = $1', rec.table_name)
        USING _user_id;
      GET DIAGNOSTICS rows_affected = ROW_COUNT;
      IF rows_affected > 0 THEN
        per_table := per_table || jsonb_build_object(rec.table_name, rows_affected);
        total_deleted := total_deleted + rows_affected;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      per_table := per_table || jsonb_build_object(
        rec.table_name, jsonb_build_object('error', SQLERRM)
      );
    END;
  END LOOP;

  -- 2. Profiles table uses `id` matching auth.users.id
  BEGIN
    EXECUTE 'DELETE FROM public.profiles WHERE id = $1' USING _user_id;
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    IF rows_affected > 0 THEN
      per_table := per_table || jsonb_build_object('profiles(id)', rows_affected);
      total_deleted := total_deleted + rows_affected;
    END IF;
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;

  -- 3. user_roles cleanup (defensive — name is fixed)
  BEGIN
    EXECUTE 'DELETE FROM public.user_roles WHERE user_id = $1' USING _user_id;
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    IF rows_affected > 0 THEN
      per_table := per_table || jsonb_build_object('user_roles', rows_affected);
    END IF;
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;

  RETURN jsonb_build_object(
    'user_id', _user_id,
    'total_rows_deleted', total_deleted,
    'per_table', per_table,
    'completed_at', now()
  );
END;
$$;

-- Lock down: only service_role may execute
REVOKE ALL ON FUNCTION public.gdpr_purge_user_data(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.gdpr_purge_user_data(uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.gdpr_purge_user_data(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.gdpr_purge_user_data(uuid) TO service_role;

COMMENT ON FUNCTION public.gdpr_purge_user_data(uuid) IS
  'GDPR Right to Erasure: deletes all rows owned by a user across all public tables with a user_id column. Service role only.';
