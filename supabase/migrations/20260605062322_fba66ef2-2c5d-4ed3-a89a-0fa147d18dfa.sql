
-- ============ POSTS: respect privacy ============
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;
CREATE POLICY "View posts by privacy"
ON public.posts FOR SELECT
USING (
  COALESCE(privacy, 'public') = 'public'
  OR user_id = auth.uid()
  OR (COALESCE(privacy, 'public') IN ('friends','followers') AND auth.uid() IS NOT NULL)
);

-- ============ MT_USER_ACHIEVEMENTS: lock writes to service_role ============
REVOKE INSERT, UPDATE ON public.mt_user_achievements FROM authenticated;
DROP POLICY IF EXISTS "Users can unlock own achievements" ON public.mt_user_achievements;
DROP POLICY IF EXISTS "Users can claim own achievements" ON public.mt_user_achievements;

-- ============ MT_MARKETPLACE_ORDERS: restrict updates ============
DROP POLICY IF EXISTS "mt_ord_update_party" ON public.mt_marketplace_orders;
-- Buyer may cancel own pending order; nothing else changeable by users.
CREATE POLICY "mt_ord_buyer_cancel_pending"
ON public.mt_marketplace_orders FOR UPDATE TO authenticated
USING (buyer_id = auth.uid() AND status = 'pending')
WITH CHECK (buyer_id = auth.uid() AND status IN ('pending','cancelled'));

-- ============ MT_MENTORSHIP_BOOKINGS: restrict updates ============
DROP POLICY IF EXISTS "mt_book_update_party" ON public.mt_mentorship_bookings;
CREATE POLICY "mt_book_student_cancel_pending"
ON public.mt_mentorship_bookings FOR UPDATE TO authenticated
USING (student_id = auth.uid() AND status = 'pending')
WITH CHECK (student_id = auth.uid() AND status IN ('pending','cancelled'));
