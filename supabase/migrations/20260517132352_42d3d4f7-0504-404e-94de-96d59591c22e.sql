-- Section 5: Pet Rescue — adoption status, vet partners, progress gallery

ALTER TABLE public.pet_rescue_campaigns
  ADD COLUMN IF NOT EXISTS adoption_status text NOT NULL DEFAULT 'in_treatment',
  ADD COLUMN IF NOT EXISTS adopter_name text,
  ADD COLUMN IF NOT EXISTS adopted_at timestamptz,
  ADD COLUMN IF NOT EXISTS intake_date date,
  ADD COLUMN IF NOT EXISTS vet_clinic_name text,
  ADD COLUMN IF NOT EXISTS vet_contact text,
  ADD COLUMN IF NOT EXISTS vet_license_number text,
  ADD COLUMN IF NOT EXISTS vet_verified boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.pet_progress_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.pet_rescue_campaigns(id) ON DELETE CASCADE,
  author_user_id uuid NOT NULL,
  title text NOT NULL CHECK (length(title) BETWEEN 2 AND 200),
  body text,
  image_url text,
  day_since_rescue integer,
  milestone_type text NOT NULL DEFAULT 'progress',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pet_progress_campaign ON public.pet_progress_updates(campaign_id, created_at ASC);
ALTER TABLE public.pet_progress_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view pet progress" ON public.pet_progress_updates;
CREATE POLICY "Anyone can view pet progress" ON public.pet_progress_updates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owner can insert pet progress" ON public.pet_progress_updates;
CREATE POLICY "Owner can insert pet progress" ON public.pet_progress_updates FOR INSERT
  WITH CHECK (auth.uid() = author_user_id AND EXISTS (
    SELECT 1 FROM public.pet_rescue_campaigns c WHERE c.id = campaign_id AND c.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Owner can update pet progress" ON public.pet_progress_updates;
CREATE POLICY "Owner can update pet progress" ON public.pet_progress_updates FOR UPDATE
  USING (auth.uid() = author_user_id);

DROP POLICY IF EXISTS "Owner can delete pet progress" ON public.pet_progress_updates;
CREATE POLICY "Owner can delete pet progress" ON public.pet_progress_updates FOR DELETE
  USING (auth.uid() = author_user_id);
