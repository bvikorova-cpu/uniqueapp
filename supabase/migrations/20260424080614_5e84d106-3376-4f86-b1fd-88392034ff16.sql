-- Helper: stable, security definer to keep policies fast and recursion-safe
CREATE OR REPLACE FUNCTION public.has_active_megatalent_subscription(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.megatalent_subscriptions
    WHERE user_id = _user_id
      AND status = 'active'
  );
$$;

-- ============================================================
-- talent_submissions : drop the permissive duplicate INSERT
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can create submissions" ON public.talent_submissions;
DROP POLICY IF EXISTS "Subscribed users can create submissions"    ON public.talent_submissions;

CREATE POLICY "Subscribed users can create submissions"
  ON public.talent_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND public.has_active_megatalent_subscription(auth.uid())
  );

-- ============================================================
-- talent_votes : require active subscription to insert a vote
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can vote" ON public.talent_votes;

CREATE POLICY "Subscribed users can vote"
  ON public.talent_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND public.has_active_megatalent_subscription(auth.uid())
  );

-- ============================================================
-- talent_comments : require active subscription to comment
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.talent_comments;

CREATE POLICY "Subscribed users can comment"
  ON public.talent_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND public.has_active_megatalent_subscription(auth.uid())
  );
