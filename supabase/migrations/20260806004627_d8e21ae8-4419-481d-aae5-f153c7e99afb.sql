-- Performance-only migration: add missing indexes for FKs and hot filter columns.
-- No schema/data/RLS changes.

DO $$
DECLARE
  r RECORD;
  idx_name TEXT;
  cols TEXT;
BEGIN
  -- 1) Index every foreign key that lacks a leading-column index
  FOR r IN
    SELECT c.oid AS conoid,
           t.relname AS tbl,
           c.conkey,
           (SELECT string_agg(quote_ident(a.attname), ', ' ORDER BY k.ord)
              FROM unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord)
              JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum) AS collist,
           (SELECT string_agg(a.attname, '_' ORDER BY k.ord)
              FROM unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord)
              JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum) AS colnames
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.contype = 'f'
      AND n.nspname = 'public'
      AND t.relkind = 'r'
      AND NOT EXISTS (
        SELECT 1 FROM pg_index i
        WHERE i.indrelid = c.conrelid
          AND (i.indkey::int2[])[0:array_length(c.conkey, 1) - 1] = c.conkey
      )
  LOOP
    idx_name := left('idx_' || r.tbl || '_' || r.colnames, 60) || '_' || substr(md5(r.tbl || r.colnames), 1, 2);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (%s)', idx_name, r.tbl, r.collist);
  END LOOP;

  -- 2) Index common filter/order columns when not already the leading column of an index
  FOR r IN
    SELECT t.relname AS tbl, a.attname AS col, a.attnum
    FROM pg_class t
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_attribute a ON a.attrelid = t.oid
    WHERE n.nspname = 'public'
      AND t.relkind = 'r'
      AND a.attnum > 0
      AND NOT a.attisdropped
      AND a.attname IN ('user_id', 'owner_id', 'created_at')
      AND NOT EXISTS (
        SELECT 1 FROM pg_index i
        WHERE i.indrelid = t.oid
          AND i.indkey[0] = a.attnum
      )
  LOOP
    idx_name := left('idx_' || r.tbl || '_' || r.col, 60) || '_' || substr(md5(r.tbl || r.col), 1, 2);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (%I)', idx_name, r.tbl, r.col);
  END LOOP;
END $$;

ANALYZE;
