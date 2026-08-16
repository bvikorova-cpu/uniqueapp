CREATE OR REPLACE VIEW public.company_reviews_public
WITH (security_invoker = false) AS
SELECT id, company_id, user_id,
  rating, rating_work_life, rating_salary, rating_career, rating_management, rating_culture,
  title, pros, cons, advice, employment_status, job_title,
  is_anonymous, helpful_count, created_at, updated_at
FROM public.company_reviews;

GRANT SELECT ON public.company_reviews_public TO anon, authenticated;