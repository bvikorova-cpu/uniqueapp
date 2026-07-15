
-- Replace public SELECT with owner/admin only
DROP POLICY IF EXISTS "Reviews viewable by all" ON public.company_reviews;
DROP POLICY IF EXISTS "Salaries viewable by all" ON public.salary_reports;
DROP POLICY IF EXISTS "Interview Qs viewable by all" ON public.interview_questions;

CREATE POLICY "Owner or admin can view review" ON public.company_reviews
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owner or admin can view salary" ON public.salary_reports
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owner or admin can view interview Q" ON public.interview_questions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Sanitized public views (SECURITY DEFINER via default; explicit security_invoker=false)
CREATE OR REPLACE VIEW public.company_reviews_public
WITH (security_invoker = false) AS
SELECT id, company_id,
  CASE WHEN is_anonymous THEN NULL ELSE user_id END AS user_id,
  rating, rating_work_life, rating_salary, rating_career, rating_management, rating_culture,
  title, pros, cons, advice, employment_status, job_title,
  is_anonymous, helpful_count, created_at, updated_at
FROM public.company_reviews;

CREATE OR REPLACE VIEW public.salary_reports_public
WITH (security_invoker = false) AS
SELECT id, company_id, company_name, job_title, location, country,
  years_experience, base_salary, bonus, equity, currency, employment_type,
  CASE WHEN is_anonymous THEN NULL ELSE user_id END AS user_id,
  is_anonymous, created_at
FROM public.salary_reports;

CREATE OR REPLACE VIEW public.interview_questions_public
WITH (security_invoker = false) AS
SELECT id, company_id, company_name, job_title, category, difficulty,
  question, answer_tips, was_asked, upvotes,
  CASE WHEN is_anonymous THEN NULL ELSE user_id END AS user_id,
  is_anonymous, created_at
FROM public.interview_questions;

GRANT SELECT ON public.company_reviews_public TO anon, authenticated;
GRANT SELECT ON public.salary_reports_public TO anon, authenticated;
GRANT SELECT ON public.interview_questions_public TO anon, authenticated;
