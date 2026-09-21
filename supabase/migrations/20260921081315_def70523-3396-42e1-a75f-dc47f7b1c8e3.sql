CREATE OR REPLACE FUNCTION public.admin_launch_boosts_overview()
RETURNS TABLE (
  kind text,
  entity_id uuid,
  title text,
  owner_id uuid,
  owner_name text,
  featured_at timestamptz,
  featured_until timestamptz,
  is_active_boost boolean,
  credits_spent int
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'NOT_AUTHORIZED';
  END IF;

  RETURN QUERY
  WITH rows AS (
    SELECT 'bazaar'::text AS kind, i.id, i.title, i.user_id AS owner_id, i.featured_at, i.featured_until
      FROM public.bazaar_items i WHERE i.featured_at IS NOT NULL OR i.featured_until IS NOT NULL
    UNION ALL
    SELECT 'auction'::text, i.id, i.title, i.user_id, i.featured_at, i.featured_until
      FROM public.auction_items i WHERE i.featured_at IS NOT NULL OR i.featured_until IS NOT NULL
    UNION ALL
    SELECT 'coupon'::text, c.id, c.title, c.user_id, c.featured_at, c.featured_until
      FROM public.coupon_listings c WHERE c.featured_at IS NOT NULL OR c.featured_until IS NOT NULL
    UNION ALL
    SELECT 'course'::text, c.id, c.title, c.creator_id, c.featured_at, c.featured_until
      FROM public.courses c WHERE c.featured_at IS NOT NULL OR c.featured_until IS NOT NULL
    UNION ALL
    SELECT 'skills'::text, o.id, o.title, o.user_id, o.featured_at, o.featured_until
      FROM public.skill_offerings o WHERE o.featured_at IS NOT NULL OR o.featured_until IS NOT NULL
  )
  SELECT r.kind,
         r.id,
         r.title,
         r.owner_id,
         p.full_name,
         r.featured_at,
         r.featured_until,
         (r.featured_until IS NOT NULL AND r.featured_until > now()),
         COALESCE((
           SELECT (-SUM(l.delta))::int
             FROM public.ai_credits_ledger l
            WHERE l.reason LIKE '%launch_promo'
              AND l.user_id = r.owner_id
              AND (l.metadata->>'entity_id' = r.id::text OR l.metadata->>'offering_id' = r.id::text)
         ), 0)
    FROM rows r
    LEFT JOIN public.profiles p ON p.id = r.owner_id
   ORDER BY r.featured_at DESC NULLS LAST;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_launch_boosts_overview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_launch_boosts_overview() TO authenticated;