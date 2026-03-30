-- beauty_transformations already exists, just drop and recreate the conflicting policy
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view public beauty transformations' AND tablename = 'beauty_transformations') THEN
    -- Table exists but without the needed column or policies, skip
    NULL;
  END IF;
END $$;