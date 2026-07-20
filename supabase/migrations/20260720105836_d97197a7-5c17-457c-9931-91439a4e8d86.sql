
CREATE OR REPLACE FUNCTION public.get_wall_feed(_cursor timestamp with time zone DEFAULT NULL::timestamp with time zone, _limit integer DEFAULT 20)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH
  viewer AS (SELECT auth.uid() AS uid),

  public_posts AS (
    SELECT p.id, p.user_id, p.content, p.created_at, p.likes_count,
           p.comments_count, p.shares_count, p.reposts_count,
           p.feeling, p.location, p.privacy, p.background_style,
           p.community_id, p.is_sensitive
    FROM public.posts p
    WHERE (_cursor IS NULL OR p.created_at < _cursor)
      AND (p.privacy = 'public' OR p.privacy IS NULL)
    ORDER BY p.created_at DESC
    LIMIT _limit
  ),

  own_posts AS (
    SELECT p.id, p.user_id, p.content, p.created_at, p.likes_count,
           p.comments_count, p.shares_count, p.reposts_count,
           p.feeling, p.location, p.privacy, p.background_style,
           p.community_id, p.is_sensitive
    FROM public.posts p, viewer v
    WHERE v.uid IS NOT NULL
      AND p.user_id = v.uid
      AND (_cursor IS NULL OR p.created_at < _cursor)
      AND p.privacy IS NOT NULL
      AND p.privacy <> 'public'
    ORDER BY p.created_at DESC
    LIMIT _limit
  ),

  friends_posts AS (
    SELECT p.id, p.user_id, p.content, p.created_at, p.likes_count,
           p.comments_count, p.shares_count, p.reposts_count,
           p.feeling, p.location, p.privacy, p.background_style,
           p.community_id, p.is_sensitive
    FROM public.posts p, viewer v
    WHERE v.uid IS NOT NULL
      AND p.privacy = 'friends'
      AND (_cursor IS NULL OR p.created_at < _cursor)
      AND public.are_friends(v.uid, p.user_id)
    ORDER BY p.created_at DESC
    LIMIT _limit
  ),

  followers_posts AS (
    SELECT p.id, p.user_id, p.content, p.created_at, p.likes_count,
           p.comments_count, p.shares_count, p.reposts_count,
           p.feeling, p.location, p.privacy, p.background_style,
           p.community_id, p.is_sensitive
    FROM public.posts p, viewer v
    WHERE v.uid IS NOT NULL
      AND p.privacy = 'followers'
      AND (_cursor IS NULL OR p.created_at < _cursor)
      AND public.is_following(v.uid, p.user_id)
    ORDER BY p.created_at DESC
    LIMIT _limit
  ),

  merged AS (
    SELECT * FROM public_posts
    UNION ALL SELECT * FROM own_posts
    UNION ALL SELECT * FROM friends_posts
    UNION ALL SELECT * FROM followers_posts
  ),

  posts_page AS (
    SELECT DISTINCT ON (m.id) m.*
    FROM merged m, viewer v
    WHERE v.uid IS NULL
       OR (NOT public.is_blocked_between(v.uid, m.user_id)
           AND NOT public.is_muted_by(v.uid, m.user_id))
    ORDER BY m.id, m.created_at DESC
  ),
  posts_with_tier AS (
    SELECT pp.*,
           CASE lower(coalesce(pr.verification_tier::text, ''))
             WHEN 'pro'      THEN 3
             WHEN 'plus'     THEN 2
             WHEN 'verified' THEN 1
             ELSE 0
           END AS tier_rank
    FROM posts_page pp
    LEFT JOIN public.profiles pr ON pr.id = pp.user_id
  ),
  posts_final AS (
    SELECT id, user_id, content, created_at, likes_count, comments_count,
           shares_count, reposts_count, feeling, location, privacy,
           background_style, community_id, is_sensitive, tier_rank
    FROM posts_with_tier
    ORDER BY tier_rank DESC, created_at DESC
    LIMIT _limit
  ),

  reposts_page AS (
    SELECT r.id, r.user_id, r.original_post_id, r.comment, r.created_at,
           CASE lower(coalesce(pr.verification_tier::text, ''))
             WHEN 'pro'      THEN 3
             WHEN 'plus'     THEN 2
             WHEN 'verified' THEN 1
             ELSE 0
           END AS tier_rank
    FROM public.reposts r
    LEFT JOIN public.profiles pr ON pr.id = r.user_id
    WHERE (_cursor IS NULL OR r.created_at < _cursor)
    ORDER BY r.created_at DESC
    LIMIT _limit
  ),

  ref_users AS (
    SELECT user_id AS id FROM posts_final
    UNION
    SELECT user_id FROM reposts_page
    UNION
    SELECT op.user_id
      FROM public.posts op
      WHERE op.id IN (SELECT original_post_id FROM reposts_page)
  ),
  ref_profiles AS (
    SELECT pr.id, pr.full_name, pr.avatar_url, pr.username, pr.verification_tier
    FROM public.profiles pr
    WHERE pr.id IN (SELECT id FROM ref_users)
  ),
  ref_media AS (
    SELECT m.id, m.post_id, m.file_url, m.file_type
    FROM public.media m
    WHERE m.post_id IN (SELECT id FROM posts_final)
       OR m.post_id IN (SELECT original_post_id FROM reposts_page)
  ),
  ref_original_posts AS (
    SELECT op.id, op.user_id, op.content, op.created_at, op.likes_count,
           op.comments_count, op.shares_count, op.reposts_count,
           op.feeling, op.location, op.privacy, op.background_style
    FROM public.posts op
    WHERE op.id IN (SELECT original_post_id FROM reposts_page)
  )
  SELECT jsonb_build_object(
    'posts', COALESCE((
      SELECT jsonb_agg(
        (to_jsonb(p) - 'tier_rank') ||
        jsonb_build_object(
          'profiles', (SELECT to_jsonb(rp) FROM ref_profiles rp WHERE rp.id = p.user_id),
          'media',    COALESCE((SELECT jsonb_agg(to_jsonb(m)) FROM ref_media m WHERE m.post_id = p.id), '[]'::jsonb)
        )
        ORDER BY p.tier_rank DESC, p.created_at DESC
      )
      FROM posts_final p
    ), '[]'::jsonb),
    'reposts', COALESCE((
      SELECT jsonb_agg(
        (to_jsonb(r) - 'tier_rank') ||
        jsonb_build_object(
          'profiles', (SELECT to_jsonb(rp) FROM ref_profiles rp WHERE rp.id = r.user_id),
          'original_post', (
            SELECT to_jsonb(op) ||
              jsonb_build_object(
                'profiles', (SELECT to_jsonb(rp) FROM ref_profiles rp WHERE rp.id = op.user_id),
                'media',    COALESCE((SELECT jsonb_agg(to_jsonb(m)) FROM ref_media m WHERE m.post_id = op.id), '[]'::jsonb)
              )
            FROM ref_original_posts op
            WHERE op.id = r.original_post_id
          )
        )
        ORDER BY r.tier_rank DESC, r.created_at DESC
      )
      FROM reposts_page r
    ), '[]'::jsonb)
  );
$function$;
