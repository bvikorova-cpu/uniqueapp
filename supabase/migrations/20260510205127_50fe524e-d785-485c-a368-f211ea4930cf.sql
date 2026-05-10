-- Replace the permissive UPDATE policy on iq_credits with one that prevents
-- clients from changing their own balance. All balance changes must go through
-- edge functions running with the service role (which bypasses RLS).
DROP POLICY IF EXISTS "Users can update own iq credits" ON public.iq_credits;

-- No client UPDATE policy is created on purpose. The DELETE policy for admins
-- and the SELECT/INSERT policies for users remain in place.