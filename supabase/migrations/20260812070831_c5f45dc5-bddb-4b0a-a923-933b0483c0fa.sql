CREATE TABLE IF NOT EXISTS public.shadow_arena_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
GRANT SELECT ON public.shadow_arena_access TO authenticated;
GRANT ALL ON public.shadow_arena_access TO service_role;
ALTER TABLE public.shadow_arena_access ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own shadow arena access" ON public.shadow_arena_access;
CREATE POLICY "own shadow arena access" ON public.shadow_arena_access FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_shadow_arena_access_user ON public.shadow_arena_access(user_id, expires_at DESC);