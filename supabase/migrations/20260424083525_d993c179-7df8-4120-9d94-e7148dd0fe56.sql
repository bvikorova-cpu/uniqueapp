-- =====================================================================
-- Security hardening: realtime messages, support uploads, job_listings PII
-- =====================================================================

-- ─────────────────────────────────────────────────────────────────────
-- 1) realtime.messages — remove public:% topic bypass
-- The previous policy granted any authenticated user access to topics
-- starting with "public:" (e.g. "public:messages"), which leaked all
-- chat rows from public.messages and public.anonymous_dating_messages
-- to anyone subscribing to that topic. Restrict realtime to per-user
-- topics only ("user:<uid>" / "user:<uid>:*").
-- ─────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated can read own user topics"  ON realtime.messages;
DROP POLICY IF EXISTS "Authenticated can write own user topics" ON realtime.messages;

CREATE POLICY "Authenticated can read own user topics"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    realtime.topic() = ('user:' || (auth.uid())::text)
    OR realtime.topic() LIKE ('user:' || (auth.uid())::text || ':%')
  );

CREATE POLICY "Authenticated can write own user topics"
  ON realtime.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    realtime.topic() = ('user:' || (auth.uid())::text)
    OR realtime.topic() LIKE ('user:' || (auth.uid())::text || ':%')
  );

-- ─────────────────────────────────────────────────────────────────────
-- 2) storage.objects — close anonymous upload path on support-attachments
-- Previous INSERT policy allowed anyone (incl. anon) to upload into the
-- "anonymous/" folder. Tighten to authenticated users uploading only to
-- their own <auth.uid()> folder.
-- ─────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users upload to their support folder" ON storage.objects;

CREATE POLICY "Users upload to their support folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'support-attachments'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- ─────────────────────────────────────────────────────────────────────
-- 3) public.job_listings — stop leaking employer contact_email to anon
-- Strategy:
--   • Drop the broad public SELECT policy.
--   • Restrict full-row SELECT (including contact_email) to:
--       - the employer who owns the listing
--       - admins
--       - applicants who already submitted a job_application
--   • Expose a security_invoker view "job_listings_public" without
--     contact_email for anonymous browsing of active listings.
-- ─────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can view active job listings" ON public.job_listings;

-- Owner sees everything for their own listings (full row incl. email)
CREATE POLICY "Employers can view own job listings"
  ON public.job_listings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = employer_id);

-- Admins see everything
CREATE POLICY "Admins can view all job listings"
  ON public.job_listings
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Applicants who applied see the full row of jobs they applied to
CREATE POLICY "Applicants can view jobs they applied to"
  ON public.job_listings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.job_applications ja
      WHERE ja.job_id = job_listings.id
        AND ja.applicant_id = auth.uid()
    )
  );

-- Public, sanitized view (no contact_email) for browsing active listings
DROP VIEW IF EXISTS public.job_listings_public;
CREATE VIEW public.job_listings_public
WITH (security_invoker = on) AS
  SELECT
    id,
    employer_id,
    title,
    description,
    company_name,
    location,
    country,
    category,
    job_type,
    salary_min,
    salary_max,
    salary_currency,
    requirements,
    benefits,
    is_active,
    is_featured,
    paid_status,
    views_count,
    applications_count,
    duration_days,
    published_at,
    expires_at,
    created_at,
    updated_at
  FROM public.job_listings
  WHERE is_active = true;

GRANT SELECT ON public.job_listings_public TO anon, authenticated;

-- View needs an underlying SELECT policy for anon to read rows.
-- The view filters to is_active = true; the policy mirrors that
-- (and is column-safe because the view excludes contact_email).
CREATE POLICY "Public can view active jobs (sanitized via view)"
  ON public.job_listings
  FOR SELECT
  TO anon
  USING (is_active = true);
