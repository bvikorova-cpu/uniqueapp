
-- Add missing donor count columns so unified dashboard query works across all campaign tables
ALTER TABLE public.medical_campaigns ADD COLUMN IF NOT EXISTS supporters_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.dream_campaigns ADD COLUMN IF NOT EXISTS monthly_donors_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.dream_campaigns ADD COLUMN IF NOT EXISTS one_time_donors_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.hero_campaigns ADD COLUMN IF NOT EXISTS monthly_donors_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.hero_campaigns ADD COLUMN IF NOT EXISTS one_time_donors_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.pet_rescue_campaigns ADD COLUMN IF NOT EXISTS monthly_donors_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.pet_rescue_campaigns ADD COLUMN IF NOT EXISTS one_time_donors_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.student_campaigns ADD COLUMN IF NOT EXISTS monthly_donors_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.student_campaigns ADD COLUMN IF NOT EXISTS one_time_donors_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.crisis_campaigns ADD COLUMN IF NOT EXISTS monthly_donors_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.crisis_campaigns ADD COLUMN IF NOT EXISTS one_time_donors_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.talent_campaigns ADD COLUMN IF NOT EXISTS monthly_donors_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.talent_campaigns ADD COLUMN IF NOT EXISTS one_time_donors_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.talent_campaigns ADD COLUMN IF NOT EXISTS supporters_count integer NOT NULL DEFAULT 0;

-- Add purchased_at on sports_purchased_tips (defaults to created_at for existing rows)
ALTER TABLE public.sports_purchased_tips ADD COLUMN IF NOT EXISTS purchased_at timestamptz NOT NULL DEFAULT now();
UPDATE public.sports_purchased_tips SET purchased_at = created_at WHERE purchased_at IS DISTINCT FROM created_at AND created_at IS NOT NULL;
