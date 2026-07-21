
CREATE OR REPLACE FUNCTION public.get_influencer_audience_insights(_influencer_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _owner uuid;
  _total int;
  _age jsonb;
  _locations jsonb;
  _interests jsonb;
  _weekday jsonb;
  _hours jsonb;
  _engagement jsonb;
BEGIN
  SELECT user_id INTO _owner FROM public.influencer_profiles WHERE id = _influencer_id;
  IF _owner IS NULL THEN
    RETURN jsonb_build_object('error','profile_not_found');
  END IF;
  IF auth.uid() IS NULL OR auth.uid() <> _owner THEN
    RETURN jsonb_build_object('error','forbidden');
  END IF;

  SELECT count(*) INTO _total FROM public.influencer_followers WHERE influencer_id = _influencer_id;

  -- Age buckets from profiles.birth_date
  WITH f AS (
    SELECT p.birth_date
    FROM public.influencer_followers fo
    JOIN public.profiles p ON p.id = fo.follower_id
    WHERE fo.influencer_id = _influencer_id AND p.birth_date IS NOT NULL
  ), b AS (
    SELECT CASE
      WHEN age(birth_date) < interval '18 years' THEN '<18'
      WHEN age(birth_date) < interval '25 years' THEN '18-24'
      WHEN age(birth_date) < interval '35 years' THEN '25-34'
      WHEN age(birth_date) < interval '45 years' THEN '35-44'
      WHEN age(birth_date) < interval '55 years' THEN '45-54'
      ELSE '55+' END AS bucket
    FROM f
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object('name', bucket, 'value', c) ORDER BY bucket), '[]'::jsonb)
  INTO _age
  FROM (SELECT bucket, count(*) c FROM b GROUP BY bucket) x;

  -- Top locations
  SELECT COALESCE(jsonb_agg(jsonb_build_object('country', loc, 'followers', c) ORDER BY c DESC), '[]'::jsonb)
  INTO _locations
  FROM (
    SELECT NULLIF(trim(p.location), '') AS loc, count(*) c
    FROM public.influencer_followers fo
    JOIN public.profiles p ON p.id = fo.follower_id
    WHERE fo.influencer_id = _influencer_id AND p.location IS NOT NULL AND trim(p.location) <> ''
    GROUP BY NULLIF(trim(p.location), '')
    ORDER BY c DESC
    LIMIT 8
  ) t;

  -- Top interests / categories from profiles.interests array
  SELECT COALESCE(jsonb_agg(jsonb_build_object('name', interest, 'value', c) ORDER BY c DESC), '[]'::jsonb)
  INTO _interests
  FROM (
    SELECT unnest(p.interests) AS interest, count(*) c
    FROM public.influencer_followers fo
    JOIN public.profiles p ON p.id = fo.follower_id
    WHERE fo.influencer_id = _influencer_id AND p.interests IS NOT NULL
    GROUP BY unnest(p.interests)
    ORDER BY c DESC
    LIMIT 10
  ) t;

  -- Follow signups by weekday
  SELECT COALESCE(jsonb_agg(jsonb_build_object('day', d, 'followers', c) ORDER BY idx), '[]'::jsonb)
  INTO _weekday
  FROM (
    SELECT
      extract(isodow from created_at)::int AS idx,
      to_char(created_at, 'Dy') AS d,
      count(*) c
    FROM public.influencer_followers
    WHERE influencer_id = _influencer_id
    GROUP BY 1,2
  ) t;

  -- Active hours from likes on this influencer's posts
  SELECT COALESCE(jsonb_agg(jsonb_build_object('hour', h || ':00', 'activity', c) ORDER BY h), '[]'::jsonb)
  INTO _hours
  FROM (
    SELECT gs AS h, COALESCE(x.c, 0) AS c
    FROM generate_series(0,23) gs
    LEFT JOIN (
      SELECT extract(hour from l.created_at)::int AS h, count(*) c
      FROM public.influencer_post_likes l
      JOIN public.influencer_posts po ON po.id = l.post_id
      WHERE po.influencer_id = _influencer_id
      GROUP BY 1
    ) x ON x.h = gs
  ) t;

  -- Engagement summary
  SELECT jsonb_build_object(
    'total_posts', COALESCE(count(*),0),
    'total_likes', COALESCE(sum(likes_count),0),
    'total_views', COALESCE(sum(views_count),0),
    'avg_likes_per_post', COALESCE(round(avg(likes_count)::numeric, 1), 0),
    'engagement_rate', CASE WHEN COALESCE(sum(views_count),0) > 0
      THEN round((sum(likes_count)::numeric / sum(views_count)::numeric) * 100, 2)
      ELSE 0 END
  ) INTO _engagement
  FROM public.influencer_posts
  WHERE influencer_id = _influencer_id;

  RETURN jsonb_build_object(
    'total_followers', _total,
    'age_distribution', _age,
    'top_locations', _locations,
    'top_interests', _interests,
    'weekday_growth', _weekday,
    'active_hours', _hours,
    'engagement', _engagement,
    'generated_at', now()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_influencer_audience_insights(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_influencer_audience_insights(uuid) TO authenticated;
