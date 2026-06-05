CREATE OR REPLACE FUNCTION public.mt_feed_hot(_category text, _limit int DEFAULT 10)
RETURNS SETOF public.talent_submissions
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT *
  FROM public.talent_submissions
  WHERE is_active = true
    AND category::text = _category
  ORDER BY (COALESCE(votes_count, 0)::float
            / power(EXTRACT(EPOCH FROM (now() - created_at)) / 3600.0 + 2.0, 1.5)) DESC,
           created_at DESC
  LIMIT GREATEST(1, LEAST(_limit, 50));
$$;

REVOKE ALL ON FUNCTION public.mt_feed_hot(text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mt_feed_hot(text, int) TO anon, authenticated;