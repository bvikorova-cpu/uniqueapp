CREATE OR REPLACE VIEW public.job_listings_public AS
SELECT id,
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
    views_count,
    applications_count,
    created_at,
    updated_at,
    duration_days,
    is_featured,
    paid_status,
    published_at,
    expires_at,
    is_remote,
    slug
   FROM job_listings
  WHERE is_active = true 
    AND COALESCE(paid_status, 'active') IN ('active', 'paid')
    AND (expires_at IS NULL OR expires_at > now());