DROP POLICY IF EXISTS "Subscribed users can create submissions" ON public.talent_submissions;
CREATE POLICY "Subscribed users can create submissions"
ON public.talent_submissions FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (
    public.has_active_megatalent_subscription(auth.uid())
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);