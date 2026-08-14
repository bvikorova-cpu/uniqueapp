CREATE POLICY "Comedians can view tickets for their shows"
ON public.comedy_tickets FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.comedy_shows s
  JOIN public.comedian_profiles p ON p.id = s.comedian_id
  WHERE s.id = comedy_tickets.show_id AND p.user_id = auth.uid()
));