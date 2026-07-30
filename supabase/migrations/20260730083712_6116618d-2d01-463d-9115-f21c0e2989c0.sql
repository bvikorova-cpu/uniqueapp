ALTER TABLE public.personality_clones ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

DROP VIEW IF EXISTS public.public_clones;

CREATE VIEW public.public_clones AS
SELECT
  id,
  clone_name,
  subscription_tier,
  total_conversations,
  training_status,
  is_active,
  is_public,
  created_at,
  COALESCE((personality_data->>'personality')::text, '') AS personality_summary,
  COALESCE((personality_data->>'tone')::text, 'friendly') AS tone
FROM public.personality_clones
WHERE is_active = true AND is_public = true AND training_status IN ('active','training');

GRANT SELECT ON public.public_clones TO anon, authenticated;

COMMENT ON COLUMN public.personality_clones.is_public IS 'Whether the clone is visible on the public Marketplace';