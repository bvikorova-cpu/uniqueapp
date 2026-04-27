
DO $$
DECLARE
  r RECORD;
  idx_name TEXT;
  col_list TEXT;
BEGIN
  FOR r IN
    SELECT
      c.conrelid::regclass::text AS table_name,
      c.conrelid AS table_oid,
      array_agg(a.attname ORDER BY array_position(c.conkey, a.attnum)) AS columns,
      c.conkey
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
    WHERE c.contype = 'f'
      AND c.connamespace = 'public'::regnamespace
      AND NOT EXISTS (
        SELECT 1 FROM pg_index i
        WHERE i.indrelid = c.conrelid
          AND (c.conkey::int[]) <@ (i.indkey::int[])
      )
    GROUP BY c.conrelid, c.conname, c.conkey
  LOOP
    col_list := array_to_string(r.columns, ', ');
    idx_name := left('idx_' || replace(r.table_name, 'public.', '') || '_' || array_to_string(r.columns, '_'), 63);
    
    BEGIN
      EXECUTE format(
        'CREATE INDEX IF NOT EXISTS %I ON %s (%s)',
        idx_name, r.table_name, col_list
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipped %.% (%): %', r.table_name, idx_name, col_list, SQLERRM;
    END;
  END LOOP;
END $$;
