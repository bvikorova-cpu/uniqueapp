-- =========================================================
-- FIX 1: user_media_gallery — restrict SELECT to owner only
-- =========================================================
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_media_gallery'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_media_gallery', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.user_media_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own media"
  ON public.user_media_gallery FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own media"
  ON public.user_media_gallery FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own media"
  ON public.user_media_gallery FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own media"
  ON public.user_media_gallery FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =========================================================
-- FIX 2: video_views — hide IP/referrer from non-owners
-- =========================================================
CREATE OR REPLACE FUNCTION public.is_video_owner(_video_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.posts
    WHERE id = _video_id AND user_id = _user_id
  );
$$;

DO $$
DECLARE pol record;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='video_views') THEN
    FOR pol IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'video_views'
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.video_views', pol.policyname);
    END LOOP;

    EXECUTE 'ALTER TABLE public.video_views ENABLE ROW LEVEL SECURITY';

    -- Anyone (incl. anonymous) may insert a view event
    EXECUTE $POL$
      CREATE POLICY "Anyone can record a view"
        ON public.video_views FOR INSERT
        TO anon, authenticated
        WITH CHECK (true)
    $POL$;

    -- Only the video owner can read raw rows (with IP / referrer)
    EXECUTE $POL$
      CREATE POLICY "Video owner can view raw analytics"
        ON public.video_views FOR SELECT
        TO authenticated
        USING (public.is_video_owner(video_id, auth.uid()))
    $POL$;
  END IF;
END $$;

-- =========================================================
-- FIX 3: user_online_status — restrict to authenticated only
-- =========================================================
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_online_status'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_online_status', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.user_online_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view online status"
  ON public.user_online_status FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can upsert own status (insert)"
  ON public.user_online_status FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own status"
  ON public.user_online_status FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own status"
  ON public.user_online_status FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
