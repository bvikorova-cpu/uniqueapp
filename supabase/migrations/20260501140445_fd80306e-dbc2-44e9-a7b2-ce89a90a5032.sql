CREATE POLICY "Users can view matched partner profiles"
ON public.anonymous_dating_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.anonymous_dating_matches m
    WHERE m.status IN ('active', 'revealed')
      AND (
        (m.user1_id = auth.uid() AND m.user2_id = anonymous_dating_profiles.user_id)
        OR
        (m.user2_id = auth.uid() AND m.user1_id = anonymous_dating_profiles.user_id)
      )
  )
);