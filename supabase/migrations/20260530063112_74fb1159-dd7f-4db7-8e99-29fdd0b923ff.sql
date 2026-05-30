-- Unified Wall feed RPC: 1 query namiesto 3+ round-tripov.
-- Returns posts and reposts merged, sorted by created_at DESC, with profiles + media + original_post joined.
-- Respects can_view_post() privacy/blocks/mutes filtering.

CREATE OR REPLACE FUNCTION public.get_wall_feed(
  _cursor timestamptz DEFAULT NULL,
  _limit int DEFAULT 20
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH
  -- Posts page (keyset)
  posts_page AS (
    SELECT p.*
    FROM public.posts p
    WHERE (_cursor IS NULL OR p.created_at < _cursor)
      AND public.can_view_post(p.id, p.user_id, p.privacy)
    ORDER BY p.created_at DESC
    LIMIT _limit
  ),
  -- Reposts page (keyset)
  reposts_page AS (
    SELECT r.*
    FROM public.reposts r
    WHERE (_cursor IS NULL OR r.created_at < _cursor)
    ORDER BY r.created_at DESC
    LIMIT _limit
  ),
  -- Collect all user_ids and original_post_ids referenced
  ref_users AS (
    SELECT user_id AS id FROM posts_page
    UNION
    SELECT user_id FROM reposts_page
    UNION
    SELECT op.user_id FROM public.posts op
      WHERE op.id IN (SELECT original_post_id FROM reposts_page)
  ),
  ref_profiles AS (
    SELECT pr.id, pr.full_name, pr.avatar_url, pr.username
    FROM public.profiles pr
    WHERE pr.id IN (SELECT id FROM ref_users)
  ),
  ref_media AS (
    SELECT m.id, m.post_id, m.file_url, m.file_type
    FROM public.media m
    WHERE m.post_id IN (SELECT id FROM posts_page)
       OR m.post_id IN (SELECT original_post_id FROM reposts_page)
  ),
  ref_original_posts AS (
    SELECT op.*
    FROM public.posts op
    WHERE op.id IN (SELECT original_post_id FROM reposts_page)
  )
  SELECT jsonb_build_object(
    'posts', COALESCE((
      SELECT jsonb_agg(
        to_jsonb(p) ||
        jsonb_build_object(
          'profiles', (SELECT to_jsonb(rp) FROM ref_profiles rp WHERE rp.id = p.user_id),
          'media', COALESCE((SELECT jsonb_agg(to_jsonb(m)) FROM ref_media m WHERE m.post_id = p.id), '[]'::jsonb)
        )
        ORDER BY p.created_at DESC
      )
      FROM posts_page p
    ), '[]'::jsonb),
    'reposts', COALESCE((
      SELECT jsonb_agg(
        to_jsonb(r) ||
        jsonb_build_object(
          'profiles', (SELECT to_jsonb(rp) FROM ref_profiles rp WHERE rp.id = r.user_id),
          'original_post', (
            SELECT to_jsonb(op) ||
              jsonb_build_object(
                'profiles', (SELECT to_jsonb(rp) FROM ref_profiles rp WHERE rp.id = op.user_id),
                'media', COALESCE((SELECT jsonb_agg(to_jsonb(m)) FROM ref_media m WHERE m.post_id = op.id), '[]'::jsonb)
              )
            FROM ref_original_posts op
            WHERE op.id = r.original_post_id
          )
        )
        ORDER BY r.created_at DESC
      )
      FROM reposts_page r
    ), '[]'::jsonb)
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_wall_feed(timestamptz, int) TO authenticated, anon;