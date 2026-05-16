
ALTER TABLE public.mentor_premium_subs
  ADD COLUMN IF NOT EXISTS area text NOT NULL DEFAULT 'career';

-- Drop old single-row-per-user uniqueness if present
DO $$
DECLARE c text;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.mentor_premium_subs'::regclass
      AND contype = 'u'
  LOOP
    EXECUTE format('ALTER TABLE public.mentor_premium_subs DROP CONSTRAINT %I', c);
  END LOOP;
END$$;

ALTER TABLE public.mentor_premium_subs
  ADD CONSTRAINT mentor_premium_subs_user_area_key UNIQUE (user_id, area);
