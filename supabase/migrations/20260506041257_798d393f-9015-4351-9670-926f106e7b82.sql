CREATE POLICY "Users can delete their own fitness plans"
ON public.fitness_plans
FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));