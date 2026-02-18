
-- Fix the overly permissive service role policy
DROP POLICY "Service role full access to fitness plans" ON public.fitness_plans;
