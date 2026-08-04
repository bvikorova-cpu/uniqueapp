DO $$
DECLARE f record;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('is_community_moderator','is_group_staff','is_guild_member','is_guild_officer','is_job_employer','is_video_owner')
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', f.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', f.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f.sig);
  END LOOP;
END $$;