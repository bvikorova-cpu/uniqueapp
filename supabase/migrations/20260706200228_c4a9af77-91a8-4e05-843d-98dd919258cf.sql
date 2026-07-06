-- Public RPCs for Fundraising hub aggregates. All security definer, read-only, no writes.

-- 1) Per-category active campaign counts + total raised
CREATE OR REPLACE FUNCTION public.get_fundraising_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'medical',  (SELECT count(*) FROM medical_campaigns  WHERE status = 'active'),
    'dream',    (SELECT count(*) FROM dream_campaigns    WHERE status = 'active'),
    'hero',     (SELECT count(*) FROM hero_campaigns     WHERE status = 'active'),
    'crisis',   (SELECT count(*) FROM crisis_campaigns   WHERE status = 'active'),
    'pet',      (SELECT count(*) FROM pet_rescue_campaigns WHERE status = 'active'),
    'student',  (SELECT count(*) FROM student_campaigns  WHERE status = 'active'),
    'talent',   (SELECT count(*) FROM talent_campaigns   WHERE status = 'active'),
    'total_raised', (SELECT coalesce(sum(amount),0) FROM campaign_donations WHERE status IN ('succeeded','completed','paid')),
    'total_donors', (SELECT count(DISTINCT coalesce(donor_id::text, donor_email)) FROM campaign_donations WHERE status IN ('succeeded','completed','paid'))
  ) INTO result;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_fundraising_stats() TO anon, authenticated;

-- 2) Featured campaign: most-funded active campaign across all 7 categories
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
           coalesce(goal_amount,0)::numeric as goal,
           coalesce(current_amount, raised_amount, 0)::numeric as raised,
           cover_image_url as image_url, created_at
    FROM medical_campaigns WHERE status='active'
    UNION ALL
    SELECT id, title, description, 'dream',
           coalesce(goal_amount,0)::numeric,
           coalesce(current_amount, raised_amount, 0)::numeric,
           cover_image_url, created_at
    FROM dream_campaigns WHERE status='active'
    UNION ALL
    SELECT id, title, description, 'hero',
           coalesce(target_amount,0)::numeric,
           coalesce(current_amount,0)::numeric,
           image_url, created_at
    FROM hero_campaigns WHERE status='active' AND verified=true
    UNION ALL
    SELECT id, title, description, 'crisis',
           coalesce(goal_amount,0)::numeric,
           coalesce(current_amount, raised_amount, 0)::numeric,
           cover_image_url, created_at
    FROM crisis_campaigns WHERE status='active'
    UNION ALL
    SELECT id, title, description, 'pet',
           coalesce(goal_amount,0)::numeric,
           coalesce(current_amount, raised_amount, 0)::numeric,
           cover_image_url, created_at
    FROM pet_rescue_campaigns WHERE status='active'
    UNION ALL
    SELECT id, title, description, 'student',
           coalesce(goal_amount,0)::numeric,
           coalesce(current_amount, raised_amount, 0)::numeric,
           cover_image_url, created_at
    FROM student_campaigns WHERE status='active'
    UNION ALL
    SELECT id, title, description, 'talent',
           coalesce(goal_amount,0)::numeric,
           coalesce(current_amount, raised_amount, 0)::numeric,
           cover_image_url, created_at
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

-- 3) Top donors leaderboard (last 30 days)
CREATE OR REPLACE FUNCTION public.get_top_donors(_limit int DEFAULT 10)
RETURNS TABLE(donor_name text, total_amount numeric, donation_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    coalesce(NULLIF(donor_name,''), 'Anonymous') as donor_name,
    sum(amount)::numeric as total_amount,
    count(*)::bigint as donation_count
  FROM campaign_donations
  WHERE status IN ('succeeded','completed','paid')
    AND is_anonymous = false
    AND created_at >= now() - interval '30 days'
  GROUP BY coalesce(NULLIF(donor_name,''), 'Anonymous')
  ORDER BY total_amount DESC
  LIMIT greatest(_limit, 1);
$$;

GRANT EXECUTE ON FUNCTION public.get_top_donors(int) TO anon, authenticated;

-- 4) Recent public donations for live ticker
CREATE OR REPLACE FUNCTION public.get_recent_donations(_limit int DEFAULT 20)
RETURNS TABLE(donor_name text, amount numeric, campaign_type text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE WHEN is_anonymous THEN 'Anonymous' ELSE coalesce(NULLIF(donor_name,''), 'Someone') END,
    amount,
    campaign_type,
    created_at
  FROM campaign_donations
  WHERE status IN ('succeeded','completed','paid')
  ORDER BY created_at DESC
  LIMIT greatest(_limit, 1);
$$;

GRANT EXECUTE ON FUNCTION public.get_recent_donations(int) TO anon, authenticated;

-- Indexes to keep these RPCs fast
CREATE INDEX IF NOT EXISTS idx_campaign_donations_status_created ON public.campaign_donations(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_medical_campaigns_status ON public.medical_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_dream_campaigns_status ON public.dream_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_crisis_campaigns_status ON public.crisis_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_hero_campaigns_status ON public.hero_campaigns(status, verified);
CREATE INDEX IF NOT EXISTS idx_pet_rescue_campaigns_status ON public.pet_rescue_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_student_campaigns_status ON public.student_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_talent_campaigns_status ON public.talent_campaigns(status);