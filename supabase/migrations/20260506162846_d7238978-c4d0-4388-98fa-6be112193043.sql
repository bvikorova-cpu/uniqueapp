
-- Drop the over-permissive public SELECT policy
DROP POLICY IF EXISTS "Users can view all active clones" ON public.personality_clones;

-- Owners can view their own clones (full data)
CREATE POLICY "Owners can view own clones"
ON public.personality_clones
FOR SELECT
USING (auth.uid() = user_id);

-- Sanitized public view for the marketplace (no user_id, no personality_data internals)
CREATE OR REPLACE VIEW public.public_clones AS
SELECT
  id,
  clone_name,
  subscription_tier,
  total_conversations,
  training_status,
  is_active,
  created_at,
  COALESCE((personality_data->>'personality')::text, '') AS personality_summary,
  COALESCE((personality_data->>'tone')::text, 'friendly') AS tone
FROM public.personality_clones
WHERE is_active = true AND training_status IN ('active','training');

GRANT SELECT ON public.public_clones TO anon, authenticated;
