CREATE OR REPLACE FUNCTION public.get_post_memories_v2(_limit integer DEFAULT 20)
RETURNS TABLE (
  id uuid,
  content text,
  created_at timestamptz,
  likes_count integer,
  comments_count integer,
  feeling text,
  location text,
  media_urls text[],
  media_types text[],
  memory_kind text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH mine AS (
    SELECT p.id, p.content, p.created_at, p.likes_count, p.comments_count, p.feeling, p.location,
           COALESCE((SELECT array_agg(m.file_url ORDER BY m.created_at) FROM public.media m WHERE m.post_id = p.id), '{}'::text[]) AS media_urls,
           COALESCE((SELECT array_agg(m.file_type ORDER BY m.created_at) FROM public.media m WHERE m.post_id = p.id), '{}'::text[]) AS media_types,
           CASE
             WHEN extract(month from p.created_at) = extract(month from now())
              AND extract(day from p.created_at) = extract(day from now()) THEN 'on_this_day'
             ELSE 'throwback'
           END AS memory_kind
    FROM public.posts p
    WHERE auth.uid() IS NOT NULL
      AND p.user_id = auth.uid()
      AND p.created_at < date_trunc('day', now())
  )
  SELECT * FROM mine
  ORDER BY (memory_kind = 'on_this_day') DESC, created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(_limit, 20), 100));
$$;

GRANT EXECUTE ON FUNCTION public.get_post_memories_v2(integer) TO authenticated;