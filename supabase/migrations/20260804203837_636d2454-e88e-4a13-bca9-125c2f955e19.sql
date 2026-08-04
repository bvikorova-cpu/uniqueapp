ALTER TABLE public.time_capsules ADD COLUMN IF NOT EXISTS duration_months INTEGER;
UPDATE public.time_capsules SET duration_months = COALESCE(duration_years, 1) * 12 WHERE duration_months IS NULL;