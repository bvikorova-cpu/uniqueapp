DO $$
DECLARE c text;
BEGIN
  FOR c IN SELECT conname FROM pg_constraint WHERE conrelid = 'public.fitness_plans'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) ILIKE '%plan_type%'
  LOOP
    EXECUTE format('ALTER TABLE public.fitness_plans DROP CONSTRAINT %I', c);
  END LOOP;
END $$;

ALTER TABLE public.fitness_plans
  ADD CONSTRAINT fitness_plans_plan_type_check
  CHECK (plan_type IN ('weekly', 'monthly', 'day60', 'day90'));