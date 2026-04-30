ALTER TABLE public.medical_campaigns ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.dream_campaigns ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.hero_campaigns ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.pet_rescue_campaigns ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.student_campaigns ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.crisis_campaigns ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.talent_campaigns ADD COLUMN IF NOT EXISTS rejection_reason TEXT;