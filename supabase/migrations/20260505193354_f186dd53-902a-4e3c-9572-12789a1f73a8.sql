
-- Remove permissive user INSERT/UPDATE policies; only service_role (webhook) may write
DROP POLICY IF EXISTS "Users can create their own subscription" ON public.dating_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.dating_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.dating_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.dating_subscriptions;

-- Keep SELECT policies (deduped to one)
DROP POLICY IF EXISTS "Users can view own subscription" ON public.dating_subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.dating_subscriptions;
CREATE POLICY "Users can view own dating subscription"
  ON public.dating_subscriptions FOR SELECT
  USING (auth.uid() = user_id);
