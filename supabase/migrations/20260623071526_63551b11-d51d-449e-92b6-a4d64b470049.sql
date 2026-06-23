CREATE OR REPLACE FUNCTION public.get_public_video_posts(_limit int DEFAULT 50)
RETURNS TABLE (id uuid, user_id uuid, content text, created_at timestamptz, file_url text, file_type text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.user_id, p.content, p.created_at, m.file_url, m.file_type
  FROM public.posts p
  JOIN public.media m ON m.post_id = p.id
  WHERE m.file_type ILIKE 'video/%'
  ORDER BY p.created_at DESC
  LIMIT _limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_video_posts(int) TO anon, authenticated;