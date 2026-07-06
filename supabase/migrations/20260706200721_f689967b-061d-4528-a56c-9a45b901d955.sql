CREATE OR REPLACE FUNCTION public.get_featured_campaign()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH unified AS (
    SELECT id, title, description, 'medical'::text as category,
           coalesce(target_amount,0)::numeric as goal,
           coalesce(current_amount,0)::numeric as raised,
           image_url, created_at
    FROM medical_campaigns WHERE status='active'
    UNION ALL
    SELECT id, title, description, 'dream',
           coalesce(target_amount,0)::numeric,
           coalesce(current_amount,0)::numeric,
           image_url, created_at
    FROM dream_campaigns WHERE status='active'
    UNION ALL
    SELECT id, title, description, 'hero',
           coalesce(target_amount,0)::numeric,
           coalesce(current_amount,0)::numeric,
           image_url, created_at
    FROM hero_campaigns WHERE status='active' AND verified=true
    UNION ALL
    SELECT id, title, description, 'crisis',
           coalesce(target_amount,0)::numeric,
           coalesce(current_amount,0)::numeric,
           NULL::text, created_at
    FROM crisis_campaigns WHERE status='active'
    UNION ALL
    SELECT id, title, description, 'pet',
           coalesce(target_amount,0)::numeric,
           coalesce(current_amount,0)::numeric,
           NULL::text, created_at
    FROM pet_rescue_campaigns WHERE status='active'
    UNION ALL
    SELECT id, title, description, 'student',
           coalesce(target_amount,0)::numeric,
           coalesce(current_amount,0)::numeric,
           image_url, created_at
    FROM student_campaigns WHERE status='active'
    UNION ALL
    SELECT id, title, description, 'talent',
           coalesce(target_amount,0)::numeric,
           coalesce(current_amount,0)::numeric,
           NULL::text, created_at
    FROM talent_campaigns WHERE status='active'
  )
  SELECT to_jsonb(t) INTO result FROM (
    SELECT * FROM unified
    ORDER BY raised DESC, created_at DESC
    LIMIT 1
  ) t;
  RETURN coalesce(result, '{}'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_featured_campaign() TO anon, authenticated;