CREATE TABLE IF NOT EXISTS public.skill_task_completions (
  id uuid primary key default gen_random_uuid(),
  offering_id uuid not null references public.skill_offerings(id) on delete cascade,
  buyer_id uuid not null,
  provider_id uuid not null,
  completed_at timestamptz not null default now(),
  reviewed boolean not null default false,
  unique (offering_id, buyer_id)
);

GRANT SELECT, INSERT, UPDATE ON public.skill_task_completions TO authenticated;
GRANT ALL ON public.skill_task_completions TO service_role;

ALTER TABLE public.skill_task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view completions" ON public.skill_task_completions
FOR SELECT TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = provider_id);

CREATE POLICY "Buyer can mark task completed" ON public.skill_task_completions
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = buyer_id AND buyer_id <> provider_id);

CREATE POLICY "Buyer can update own completion" ON public.skill_task_completions
FOR UPDATE TO authenticated
USING (auth.uid() = buyer_id)
WITH CHECK (auth.uid() = buyer_id);

CREATE OR REPLACE FUNCTION public.bump_skill_completed_jobs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.skill_offerings
  SET completed_jobs = COALESCE(completed_jobs, 0) + 1
  WHERE id = NEW.offering_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bump_skill_completed_jobs ON public.skill_task_completions;
CREATE TRIGGER trg_bump_skill_completed_jobs
AFTER INSERT ON public.skill_task_completions
FOR EACH ROW EXECUTE FUNCTION public.bump_skill_completed_jobs();