
-- Tighten RLS: users only see currently-available quest paths and their nodes; admins keep full access.

DROP POLICY IF EXISTS "Anyone view paths" ON public.quest_paths;
DROP POLICY IF EXISTS "Anyone view nodes" ON public.quest_nodes;

CREATE POLICY "Users view available paths"
ON public.quest_paths
FOR SELECT
USING (
  is_active = true
  AND (starts_at IS NULL OR starts_at <= now())
  AND (ends_at IS NULL OR ends_at >= now())
);

CREATE POLICY "Admins view all paths"
ON public.quest_paths
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users view nodes of available paths"
ON public.quest_nodes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quest_paths p
    WHERE p.id = quest_nodes.path_id
      AND p.is_active = true
      AND (p.starts_at IS NULL OR p.starts_at <= now())
      AND (p.ends_at IS NULL OR p.ends_at >= now())
  )
);

CREATE POLICY "Admins view all nodes"
ON public.quest_nodes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Ensure user progress also has DELETE policy for own rows (cleanup/reset)
DROP POLICY IF EXISTS "Users delete own path progress" ON public.user_quest_path_progress;
CREATE POLICY "Users delete own path progress"
ON public.user_quest_path_progress
FOR DELETE
USING (auth.uid() = user_id);
