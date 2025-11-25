-- Add missing INSERT, UPDATE, DELETE RLS policies with correct column references
-- Phase 1: User-owned tables with user_id column

-- astrology_subscriptions (has user_id)
DROP POLICY IF EXISTS "Users can insert their own astrology subscriptions" ON public.astrology_subscriptions;
CREATE POLICY "Users can insert their own astrology subscriptions"
  ON public.astrology_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own astrology subscriptions" ON public.astrology_subscriptions;
CREATE POLICY "Users can update their own astrology subscriptions"
  ON public.astrology_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own astrology subscriptions" ON public.astrology_subscriptions;
CREATE POLICY "Users can delete their own astrology subscriptions"
  ON public.astrology_subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- holographic_purchases (has user_id)
DROP POLICY IF EXISTS "Users can insert holographic purchases" ON public.holographic_purchases;
CREATE POLICY "Users can insert holographic purchases"
  ON public.holographic_purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own holographic purchases" ON public.holographic_purchases;
CREATE POLICY "Users can update their own holographic purchases"
  ON public.holographic_purchases FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- post_views (has user_id)
DROP POLICY IF EXISTS "Users can view their own post views" ON public.post_views;
CREATE POLICY "Users can view their own post views"
  ON public.post_views FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- reincarnation_purchases (has user_id)
DROP POLICY IF EXISTS "Users can insert their own reincarnation purchases" ON public.reincarnation_purchases;
CREATE POLICY "Users can insert their own reincarnation purchases"
  ON public.reincarnation_purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reincarnation purchases" ON public.reincarnation_purchases;
CREATE POLICY "Users can update their own reincarnation purchases"
  ON public.reincarnation_purchases FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- shadow_credit_transactions (has user_id)
DROP POLICY IF EXISTS "Users can insert their own shadow credit transactions" ON public.shadow_credit_transactions;
CREATE POLICY "Users can insert their own shadow credit transactions"
  ON public.shadow_credit_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own shadow credit transactions" ON public.shadow_credit_transactions;
CREATE POLICY "Users can update their own shadow credit transactions"
  ON public.shadow_credit_transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- vip_subscriptions (has user_id)
DROP POLICY IF EXISTS "Users can insert their own VIP subscriptions" ON public.vip_subscriptions;
CREATE POLICY "Users can insert their own VIP subscriptions"
  ON public.vip_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own VIP subscriptions" ON public.vip_subscriptions;
CREATE POLICY "Users can update their own VIP subscriptions"
  ON public.vip_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Phase 2: Tables with specific user columns

-- comedian_earnings (has comedian_id)
DROP POLICY IF EXISTS "Comedians can insert their own earnings" ON public.comedian_earnings;
CREATE POLICY "Comedians can insert their own earnings"
  ON public.comedian_earnings FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Comedians can update their own earnings" ON public.comedian_earnings;
CREATE POLICY "Comedians can update their own earnings"
  ON public.comedian_earnings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- comedy_platform_earnings (has comedian_id)
DROP POLICY IF EXISTS "System can insert comedy platform earnings" ON public.comedy_platform_earnings;
CREATE POLICY "System can insert comedy platform earnings"
  ON public.comedy_platform_earnings FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "System can update comedy platform earnings" ON public.comedy_platform_earnings;
CREATE POLICY "System can update comedy platform earnings"
  ON public.comedy_platform_earnings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- escape_room_earnings (has creator_id)
DROP POLICY IF EXISTS "Creators can insert escape room earnings" ON public.escape_room_earnings;
CREATE POLICY "Creators can insert escape room earnings"
  ON public.escape_room_earnings FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Creators can update escape room earnings" ON public.escape_room_earnings;
CREATE POLICY "Creators can update escape room earnings"
  ON public.escape_room_earnings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- influencer_balances (has influencer_id)
DROP POLICY IF EXISTS "Influencers can insert their own balance" ON public.influencer_balances;
CREATE POLICY "Influencers can insert their own balance"
  ON public.influencer_balances FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Influencers can update their own balance" ON public.influencer_balances;
CREATE POLICY "Influencers can update their own balance"
  ON public.influencer_balances FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- stock_content_earnings (has creator_id)
DROP POLICY IF EXISTS "Creators can insert stock content earnings" ON public.stock_content_earnings;
CREATE POLICY "Creators can insert stock content earnings"
  ON public.stock_content_earnings FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Creators can update stock content earnings" ON public.stock_content_earnings;
CREATE POLICY "Creators can update stock content earnings"
  ON public.stock_content_earnings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- sports_platform_earnings (has tipster_id)
DROP POLICY IF EXISTS "Tipsters can insert sports platform earnings" ON public.sports_platform_earnings;
CREATE POLICY "Tipsters can insert sports platform earnings"
  ON public.sports_platform_earnings FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Tipsters can update sports platform earnings" ON public.sports_platform_earnings;
CREATE POLICY "Tipsters can update sports platform earnings"
  ON public.sports_platform_earnings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Phase 3: System/Public tables

-- comedy_battles
DROP POLICY IF EXISTS "Users can insert comedy battles" ON public.comedy_battles;
CREATE POLICY "Users can insert comedy battles"
  ON public.comedy_battles FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update comedy battles" ON public.comedy_battles;
CREATE POLICY "Users can update comedy battles"
  ON public.comedy_battles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- home_decor_sales
DROP POLICY IF EXISTS "System can insert home decor sales" ON public.home_decor_sales;
CREATE POLICY "System can insert home decor sales"
  ON public.home_decor_sales FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "System can update home decor sales" ON public.home_decor_sales;
CREATE POLICY "System can update home decor sales"
  ON public.home_decor_sales FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- lesson_progress
DROP POLICY IF EXISTS "Users can insert lesson progress" ON public.lesson_progress;
CREATE POLICY "Users can insert lesson progress"
  ON public.lesson_progress FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update lesson progress" ON public.lesson_progress;
CREATE POLICY "Users can update lesson progress"
  ON public.lesson_progress FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete lesson progress" ON public.lesson_progress;
CREATE POLICY "Users can delete lesson progress"
  ON public.lesson_progress FOR DELETE
  TO authenticated
  USING (true);

-- masterchef_platform_earnings
DROP POLICY IF EXISTS "System can insert masterchef platform earnings" ON public.masterchef_platform_earnings;
CREATE POLICY "System can insert masterchef platform earnings"
  ON public.masterchef_platform_earnings FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "System can update masterchef platform earnings" ON public.masterchef_platform_earnings;
CREATE POLICY "System can update masterchef platform earnings"
  ON public.masterchef_platform_earnings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- payout_batches
DROP POLICY IF EXISTS "System can insert payout batches" ON public.payout_batches;
CREATE POLICY "System can insert payout batches"
  ON public.payout_batches FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "System can update payout batches" ON public.payout_batches;
CREATE POLICY "System can update payout batches"
  ON public.payout_batches FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);