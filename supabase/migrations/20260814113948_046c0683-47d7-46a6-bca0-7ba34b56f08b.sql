-- 1) Remove accidental duplicate creator subscription tiers (same creator + name + price)
DELETE FROM public.creator_subscription_tiers t
USING public.creator_subscription_tiers k
WHERE t.creator_id = k.creator_id
  AND lower(t.name) = lower(k.name)
  AND t.price = k.price
  AND t.created_at > k.created_at;

-- 2) Migrate remaining creator_subscription_tiers into the live fan club table
--    (influencer_fan_clubs is what profiles, checkout and live gating actually read)
WITH src AS (
  SELECT cst.id,
         cp.user_id,
         cst.name,
         cst.description,
         cst.price,
         cst.is_active,
         row_number() OVER (PARTITION BY cp.user_id ORDER BY cst.price) AS rn
  FROM public.creator_subscription_tiers cst
  JOIN public.creator_profiles cp ON cp.id = cst.creator_id
)
INSERT INTO public.influencer_fan_clubs (creator_id, tier, name, description, price_cents, perks, is_active)
SELECT s.user_id,
       CASE WHEN s.rn = 1 THEN 'bronze' WHEN s.rn = 2 THEN 'silver' ELSE 'gold' END,
       s.name,
       COALESCE(s.description, ''),
       GREATEST(1, ROUND(s.price * 100))::int,
       '[]'::jsonb,
       COALESCE(s.is_active, true)
FROM src s
WHERE NOT EXISTS (
  SELECT 1 FROM public.influencer_fan_clubs f
  WHERE f.creator_id = s.user_id AND lower(f.name) = lower(s.name)
);