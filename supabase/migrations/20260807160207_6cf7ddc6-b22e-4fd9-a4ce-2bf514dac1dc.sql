UPDATE public.affiliate_tier_config SET reward_eur = 5;

CREATE OR REPLACE FUNCTION public.get_affiliate_reward_eur(_user_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 5::numeric;
$$;