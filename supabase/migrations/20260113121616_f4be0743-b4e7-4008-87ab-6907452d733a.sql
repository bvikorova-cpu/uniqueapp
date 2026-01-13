-- Add verified column to tables that don't have it for admin safety
ALTER TABLE public.dream_campaigns ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;
ALTER TABLE public.dream_campaigns ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id);

ALTER TABLE public.student_campaigns ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;
ALTER TABLE public.student_campaigns ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id);

ALTER TABLE public.pet_rescue_campaigns ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;
ALTER TABLE public.pet_rescue_campaigns ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id);

ALTER TABLE public.talent_campaigns ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;
ALTER TABLE public.talent_campaigns ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id);

-- Set existing test data to NOT verified (they need admin approval)
UPDATE public.dream_campaigns SET verified = false WHERE verified IS NULL;
UPDATE public.student_campaigns SET verified = false WHERE verified IS NULL;
UPDATE public.pet_rescue_campaigns SET verified = false WHERE verified IS NULL;
UPDATE public.talent_campaigns SET verified = false WHERE verified IS NULL;