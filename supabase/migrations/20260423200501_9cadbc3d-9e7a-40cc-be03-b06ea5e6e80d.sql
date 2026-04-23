
-- ============================================================
-- WAVE 2: PII protection + permissive RLS hardening
-- ============================================================

-- ---------- 1. BUSINESSES: hide contact PII from public ----------
-- Replace permissive SELECT with restricted column access.
-- Public sees only non-sensitive fields; contact info requires auth or ownership.

DROP POLICY IF EXISTS "Anyone can view active businesses" ON public.businesses;

-- Owner full access
CREATE POLICY "Owners can view full business details"
ON public.businesses FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

-- Authenticated users can see active businesses (including contact info)
CREATE POLICY "Authenticated users can view active businesses"
ON public.businesses FOR SELECT
TO authenticated
USING (is_active = true);

-- Public (anon) gets NO direct access — they must use the safe view below
-- (no policy = no access for anon role)

-- Safe public view: only non-sensitive columns
CREATE OR REPLACE VIEW public.businesses_public AS
SELECT
  id, owner_id, name, description, category,
  logo_url, cover_image_url, opening_hours, is_open_now,
  unique_url_slug, total_rating, review_count, is_active,
  created_at, updated_at,
  -- approximate location only (rounded to ~1km)
  ROUND(latitude::numeric, 2)::float8  AS latitude_approx,
  ROUND(longitude::numeric, 2)::float8 AS longitude_approx
FROM public.businesses
WHERE is_active = true;

GRANT SELECT ON public.businesses_public TO anon, authenticated;

-- ---------- 2. SPORTS_TIPSTERS: hide financial data ----------
DROP POLICY IF EXISTS "Tipsters are viewable by everyone" ON public.sports_tipsters;

CREATE POLICY "Owners can view full tipster profile"
ON public.sports_tipsters FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view tipster profiles"
ON public.sports_tipsters FOR SELECT
TO authenticated
USING (true);

-- Public-safe view (no earnings / payout)
CREATE OR REPLACE VIEW public.sports_tipsters_public AS
SELECT
  id, user_id, display_name, bio, avatar_url,
  sport_specialization, status, badge,
  total_predictions, correct_predictions, win_rate, roi,
  followers_count, tip_price, subscription_price,
  created_at, updated_at
FROM public.sports_tipsters
WHERE status = 'active' OR status IS NULL;

GRANT SELECT ON public.sports_tipsters_public TO anon, authenticated;

-- ---------- 3. PERMISSIVE RLS HARDENING ----------

-- 3a. comedy_open_mic — anyone authenticated could update ANY row
DROP POLICY IF EXISTS "Authenticated users can update votes" ON public.comedy_open_mic;
-- Replace with: only the owner can update their own row
CREATE POLICY "Owners can update their open mic submissions"
ON public.comedy_open_mic FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3b. dream_battle_interpretations — same issue
DROP POLICY IF EXISTS "Authenticated users can update interpretation votes"
  ON public.dream_battle_interpretations;
CREATE POLICY "Owners can update their interpretations"
ON public.dream_battle_interpretations FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3c. photo_gallery — anyone could update any photo's like count
DROP POLICY IF EXISTS "Authenticated users can update gallery likes"
  ON public.photo_gallery;
CREATE POLICY "Owners can update their gallery photos"
ON public.photo_gallery FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ---------- 4. SCOPE SERVICE-ROLE-ONLY POLICIES TO service_role ----------
-- These currently allow ANY role with WITH CHECK (true). Restrict to service_role.

DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT tablename, policyname, cmd
    FROM pg_policies
    WHERE schemaname='public'
      AND policyname ILIKE 'Service role%'
      AND (qual = 'true' OR with_check = 'true')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', rec.policyname, rec.tablename);
    IF rec.cmd = 'INSERT' THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO service_role WITH CHECK (true)', rec.policyname, rec.tablename);
    ELSIF rec.cmd = 'UPDATE' THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO service_role USING (true) WITH CHECK (true)', rec.policyname, rec.tablename);
    ELSIF rec.cmd = 'DELETE' THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO service_role USING (true)', rec.policyname, rec.tablename);
    ELSIF rec.cmd = 'ALL' THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', rec.policyname, rec.tablename);
    END IF;
  END LOOP;

  -- Also handle "System can ..." policies
  FOR rec IN
    SELECT tablename, policyname, cmd
    FROM pg_policies
    WHERE schemaname='public'
      AND policyname ILIKE 'System can%'
      AND (qual = 'true' OR with_check = 'true')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', rec.policyname, rec.tablename);
    IF rec.cmd = 'INSERT' THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO service_role WITH CHECK (true)', rec.policyname, rec.tablename);
    ELSIF rec.cmd = 'UPDATE' THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO service_role USING (true) WITH CHECK (true)', rec.policyname, rec.tablename);
    END IF;
  END LOOP;
END $$;

-- ---------- 5. ANONYMOUS INSERT TRACKING (post_views, profile_views) ----------
-- These allow anyone to insert. Add basic abuse protection via constraint:
-- limit one view per (post_id/profile_id, viewer_ip_hash) — but since we don't
-- have IP hashing yet, leave open inserts but ensure no other ops are permitted.
-- Already restricted to INSERT only. Acceptable for now (analytics use case).

-- Also tighten "Anyone can insert views" to require WITH CHECK that doesn't
-- allow user_id spoofing for analytics integrity.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='post_views' AND policyname='Anyone can insert views') THEN
    DROP POLICY "Anyone can insert views" ON public.post_views;
    CREATE POLICY "Anyone can insert views"
    ON public.post_views FOR INSERT
    TO anon, authenticated
    WITH CHECK (
      -- if user_id is set, it must match the caller; anon must leave it null
      (user_id IS NULL AND auth.uid() IS NULL)
      OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
      OR (user_id IS NULL)
    );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profile_views' AND policyname='Anyone can insert a profile view') THEN
    DROP POLICY "Anyone can insert a profile view" ON public.profile_views;
    CREATE POLICY "Anyone can insert a profile view"
    ON public.profile_views FOR INSERT
    TO anon, authenticated
    WITH CHECK (
      (viewer_id IS NULL AND auth.uid() IS NULL)
      OR (auth.uid() IS NOT NULL AND viewer_id = auth.uid())
      OR (viewer_id IS NULL)
    );
  END IF;
END $$;
