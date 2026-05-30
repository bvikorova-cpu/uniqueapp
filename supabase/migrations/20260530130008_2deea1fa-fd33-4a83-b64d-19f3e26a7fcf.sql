ALTER TABLE public.job_listings
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(requirements, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'D')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_job_listings_search_vector
  ON public.job_listings USING GIN (search_vector);

CREATE OR REPLACE FUNCTION public.find_similar_jobs(_job_id uuid, _limit int DEFAULT 8)
RETURNS TABLE (
  id uuid,
  slug text,
  title text,
  company_name text,
  location text,
  category text,
  salary_min numeric,
  salary_max numeric,
  salary_currency text,
  is_remote boolean,
  country text,
  score real
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_query tsquery;
  v_category text;
  v_country text;
BEGIN
  SELECT
    plainto_tsquery('simple', coalesce(j.title, '')),
    j.category::text,
    j.country
  INTO v_query, v_category, v_country
  FROM public.job_listings j
  WHERE j.id = _job_id;

  IF v_query IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH ranked AS (
    SELECT
      j.id, j.slug, j.title, j.company_name, j.location, j.category::text AS category,
      j.salary_min, j.salary_max, j.salary_currency, j.is_remote, j.country,
      (ts_rank(j.search_vector, v_query)
        + CASE WHEN j.category::text = v_category THEN 0.5 ELSE 0 END
        + CASE WHEN j.country = v_country THEN 0.1 ELSE 0 END
      )::real AS score
    FROM public.job_listings j
    WHERE j.id <> _job_id
      AND j.is_active = true
      AND coalesce(j.paid_status, 'active') = 'active'
      AND (j.expires_at IS NULL OR j.expires_at > now())
      AND (j.search_vector @@ v_query OR j.category::text = v_category)
    ORDER BY score DESC, j.created_at DESC
    LIMIT _limit
  ),
  fallback AS (
    SELECT
      j.id, j.slug, j.title, j.company_name, j.location, j.category::text AS category,
      j.salary_min, j.salary_max, j.salary_currency, j.is_remote, j.country,
      0::real AS score
    FROM public.job_listings j
    WHERE j.id <> _job_id
      AND j.is_active = true
      AND coalesce(j.paid_status, 'active') = 'active'
      AND (j.expires_at IS NULL OR j.expires_at > now())
      AND NOT EXISTS (SELECT 1 FROM ranked)
    ORDER BY j.created_at DESC
    LIMIT _limit
  )
  SELECT * FROM ranked
  UNION ALL
  SELECT * FROM fallback;
END;
$$;

GRANT EXECUTE ON FUNCTION public.find_similar_jobs(uuid, int) TO anon, authenticated, service_role;