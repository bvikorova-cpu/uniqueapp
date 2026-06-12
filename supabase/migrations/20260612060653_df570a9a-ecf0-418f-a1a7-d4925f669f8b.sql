
-- DM Mutes
CREATE TABLE public.dm_mutes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  muted_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, muted_user_id)
);
GRANT SELECT, INSERT, DELETE ON public.dm_mutes TO authenticated;
GRANT ALL ON public.dm_mutes TO service_role;
ALTER TABLE public.dm_mutes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own mutes" ON public.dm_mutes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX dm_mutes_user_idx ON public.dm_mutes(user_id);

-- Coffee no-shows
CREATE TABLE public.coffee_no_shows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  reporter_user_id uuid NOT NULL,
  no_show_user_id uuid NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(match_id, reporter_user_id)
);
GRANT SELECT, INSERT ON public.coffee_no_shows TO authenticated;
GRANT ALL ON public.coffee_no_shows TO service_role;
ALTER TABLE public.coffee_no_shows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reporter can insert no-show" ON public.coffee_no_shows
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = reporter_user_id
    AND EXISTS (
      SELECT 1 FROM public.coffee_matches m
      WHERE m.id = match_id
        AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
        AND (m.user1_id = no_show_user_id OR m.user2_id = no_show_user_id)
        AND no_show_user_id <> auth.uid()
    )
  );
CREATE POLICY "match participants view no-shows" ON public.coffee_no_shows
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.coffee_matches m
      WHERE m.id = match_id
        AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

-- Strike counter
ALTER TABLE public.coffee_profiles
  ADD COLUMN IF NOT EXISTS no_show_strikes int NOT NULL DEFAULT 0;

-- Increment strikes via trigger
CREATE OR REPLACE FUNCTION public.bump_coffee_no_show_strike()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.coffee_profiles
    SET no_show_strikes = no_show_strikes + 1,
        updated_at = now()
    WHERE user_id = NEW.no_show_user_id;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_bump_coffee_strike ON public.coffee_no_shows;
CREATE TRIGGER trg_bump_coffee_strike
  AFTER INSERT ON public.coffee_no_shows
  FOR EACH ROW EXECUTE FUNCTION public.bump_coffee_no_show_strike();
