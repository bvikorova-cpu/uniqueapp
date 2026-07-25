CREATE OR REPLACE FUNCTION public.search_public_profiles(_query text)
RETURNS TABLE(id uuid, username text, avatar_url text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  normalized_query text;
  query_tokens text[];
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  normalized_query := regexp_replace(
    lower(extensions.unaccent(btrim(coalesce(_query, '')))),
    '\s+',
    ' ',
    'g'
  );

  IF length(normalized_query) < 2 THEN
    RETURN;
  END IF;

  SELECT array_agg(token)
  INTO query_tokens
  FROM regexp_split_to_table(normalized_query, '\s+') AS token
  WHERE length(token) >= 2;

  IF query_tokens IS NULL OR array_length(query_tokens, 1) IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH normalized_profiles AS (
    SELECT
      p.id,
      COALESCE(NULLIF(btrim(p.full_name), ''), NULLIF(btrim(p.username), ''), 'User') AS display_name,
      p.avatar_url,
      regexp_replace(
        lower(extensions.unaccent(
          concat_ws(' ', p.full_name, p.username)
        )),
        '\s+',
        ' ',
        'g'
      ) AS searchable_text
    FROM public.profiles p
    WHERE p.id <> auth.uid()
      AND NOT EXISTS (
        SELECT 1
        FROM public.blocked_users b
        WHERE (b.user_id = auth.uid() AND b.blocked_user_id = p.id)
           OR (b.user_id = p.id AND b.blocked_user_id = auth.uid())
      )
  )
  SELECT np.id, np.display_name AS username, np.avatar_url
  FROM normalized_profiles np
  WHERE np.searchable_text LIKE '%' || normalized_query || '%'
     OR NOT EXISTS (
       SELECT 1
       FROM unnest(query_tokens) AS token
       WHERE np.searchable_text NOT LIKE '%' || token || '%'
     )
  ORDER BY
    CASE
      WHEN np.searchable_text LIKE normalized_query || '%' THEN 0
      WHEN NOT EXISTS (
        SELECT 1
        FROM unnest(query_tokens) AS token
        WHERE np.searchable_text NOT LIKE '%' || token || '%'
      ) THEN 1
      ELSE 2
    END,
    np.display_name NULLS LAST
  LIMIT 10;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_public_profiles(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_public_profiles(text) TO service_role;