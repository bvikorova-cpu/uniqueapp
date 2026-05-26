-- Allow authenticated users to self-assign ONLY the 'employer' role.
-- Admin/moderator/judge remain protected (only granted by admins via separate flow).
CREATE POLICY "Users can self-register as employer"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role = 'employer'::app_role
);

-- Allow users to remove their own employer role.
CREATE POLICY "Users can remove own employer role"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  AND role = 'employer'::app_role
);