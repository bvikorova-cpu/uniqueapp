-- Update RLS policy to allow subscribed users to view all active submissions
DROP POLICY IF EXISTS "Anyone can view active submissions" ON public.talent_submissions;

CREATE POLICY "Subscribed users can view active submissions"
ON public.talent_submissions
FOR SELECT
USING (
  is_active = true
  AND EXISTS (
    SELECT 1 FROM public.megatalent_subscriptions
    WHERE user_id = auth.uid()
    AND status = 'active'
  )
);