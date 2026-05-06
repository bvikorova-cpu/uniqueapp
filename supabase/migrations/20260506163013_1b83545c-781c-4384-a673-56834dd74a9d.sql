
-- Make the view honor caller's RLS
ALTER VIEW public.public_clones SET (security_invoker = true);

-- Restore public read access for active clones (needed by view + marketplace)
CREATE POLICY "Public can view active clones"
ON public.personality_clones
FOR SELECT
USING (is_active = true);

-- Column-level lockdown: anon/authenticated cannot read user_id or raw personality_data
REVOKE SELECT ON public.personality_clones FROM anon, authenticated;
GRANT SELECT (id, clone_name, subscription_tier, total_conversations, training_status, is_active, created_at, updated_at)
  ON public.personality_clones TO anon, authenticated;

-- Owners need full access to their own rows; granted via service_role + the owner SELECT policy
-- Owners can still read user_id of their own clones because authenticated role still owns the row,
-- but column grant blocks user_id everywhere — so we expose it via a security-definer function instead.
CREATE OR REPLACE FUNCTION public.get_my_clones()
RETURNS SETOF public.personality_clones
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.personality_clones WHERE user_id = auth.uid()
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_clones() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_my_clones() TO authenticated;
