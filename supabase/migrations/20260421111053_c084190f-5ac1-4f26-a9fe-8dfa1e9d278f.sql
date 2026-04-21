-- ============================================================
-- WAVE A: Critical security fixes (5 of 8)
-- ============================================================

-- 1) PRIVILEGE ESCALATION: user_roles INSERT policy
--    Drop ALL INSERT policies on user_roles. Roles can only be assigned
--    via SECURITY DEFINER function or service role.
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='user_roles' AND cmd='INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', pol.policyname);
  END LOOP;
END $$;

-- Helper function admins can call to assign roles safely
CREATE OR REPLACE FUNCTION public.assign_user_role(
  _target_user_id uuid,
  _role public.app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only existing admins may grant roles
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins can assign roles';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- ============================================================
-- 2) destination_photos: replace insecure current_setting with auth.uid()
-- ============================================================
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='destination_photos'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.destination_photos', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users can view photos of their destinations"
ON public.destination_photos FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.destinations d
  WHERE d.id = destination_photos.destination_id AND d.user_id = auth.uid()
));

CREATE POLICY "Users can create photos for their destinations"
ON public.destination_photos FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.destinations d
  WHERE d.id = destination_photos.destination_id AND d.user_id = auth.uid()
));

CREATE POLICY "Users can update photos of their destinations"
ON public.destination_photos FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.destinations d
  WHERE d.id = destination_photos.destination_id AND d.user_id = auth.uid()
));

CREATE POLICY "Users can delete photos of their destinations"
ON public.destination_photos FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.destinations d
  WHERE d.id = destination_photos.destination_id AND d.user_id = auth.uid()
));

-- ============================================================
-- 3) dating_profiles: require authentication for SELECT
-- ============================================================
DROP POLICY IF EXISTS "Allow viewing active dating profiles" ON public.dating_profiles;

CREATE POLICY "Authenticated users can view active dating profiles"
ON public.dating_profiles FOR SELECT
TO authenticated
USING (is_active = true);

-- ============================================================
-- 4) confessions: anonymize user_id and require auth for SELECT
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view confessions" ON public.confessions;

CREATE POLICY "Authenticated users can view confessions"
ON public.confessions FOR SELECT
TO authenticated
USING (true);

-- Public-safe view that nullifies user_id for anonymous confessions
CREATE OR REPLACE VIEW public.confessions_public AS
SELECT
  id,
  CASE WHEN is_anonymous IS TRUE THEN NULL ELSE user_id END AS user_id,
  confession_text,
  sin_category,
  severity_score,
  is_anonymous,
  absolution_votes,
  condemnation_votes,
  absolution_tokens_used,
  status,
  created_at,
  updated_at
FROM public.confessions;

GRANT SELECT ON public.confessions_public TO authenticated, anon;

-- ============================================================
-- 5) Realtime leak: remove sensitive tables from realtime publication
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname='supabase_realtime'
      AND schemaname='public'
      AND tablename='admin_audit_log'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.admin_audit_log';
  END IF;
END $$;
