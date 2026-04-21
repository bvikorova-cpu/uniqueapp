-- =============================================================
-- 1. FIX FUNCTIONS: add search_path
-- =============================================================
ALTER FUNCTION public.notify_forum_subscribers() SET search_path = public;
ALTER FUNCTION public.touch_updated_at() SET search_path = public;

-- =============================================================
-- 2. FINANCIAL TABLES — restrict INSERT to service_role only
-- =============================================================

-- influencer_balances
DROP POLICY IF EXISTS "System can insert influencer balances" ON public.influencer_balances;
CREATE POLICY "Service role can insert influencer balances"
ON public.influencer_balances FOR INSERT TO service_role WITH CHECK (true);

-- influencer_earnings
DROP POLICY IF EXISTS "System can insert influencer earnings" ON public.influencer_earnings;
CREATE POLICY "Service role can insert influencer earnings"
ON public.influencer_earnings FOR INSERT TO service_role WITH CHECK (true);

-- payout_batches
DROP POLICY IF EXISTS "System can insert payout batches" ON public.payout_batches;
CREATE POLICY "Service role can insert payout batches"
ON public.payout_batches FOR INSERT TO service_role WITH CHECK (true);

-- instructor_payout_history
DROP POLICY IF EXISTS "System can insert payout history" ON public.instructor_payout_history;
CREATE POLICY "Service role can insert payout history"
ON public.instructor_payout_history FOR INSERT TO service_role WITH CHECK (true);

-- comedian_earnings
DROP POLICY IF EXISTS "System can insert comedian earnings" ON public.comedian_earnings;
CREATE POLICY "Service role can insert comedian earnings"
ON public.comedian_earnings FOR INSERT TO service_role WITH CHECK (true);

-- comedy_platform_earnings
DROP POLICY IF EXISTS "System can insert comedy platform earnings" ON public.comedy_platform_earnings;
CREATE POLICY "Service role can insert comedy platform earnings"
ON public.comedy_platform_earnings FOR INSERT TO service_role WITH CHECK (true);

-- escape_room_earnings
DROP POLICY IF EXISTS "System can insert escape room earnings" ON public.escape_room_earnings;
CREATE POLICY "Service role can insert escape room earnings"
ON public.escape_room_earnings FOR INSERT TO service_role WITH CHECK (true);

-- masterchef_platform_earnings
DROP POLICY IF EXISTS "System can insert masterchef earnings" ON public.masterchef_platform_earnings;
CREATE POLICY "Service role can insert masterchef earnings"
ON public.masterchef_platform_earnings FOR INSERT TO service_role WITH CHECK (true);

-- credit_payments
DROP POLICY IF EXISTS "System can insert credit payments" ON public.credit_payments;
CREATE POLICY "Service role can insert credit payments"
ON public.credit_payments FOR INSERT TO service_role WITH CHECK (true);

-- decor_sales
DROP POLICY IF EXISTS "Service role inserts" ON public.decor_sales;
CREATE POLICY "Service role can insert decor sales"
ON public.decor_sales FOR INSERT TO service_role WITH CHECK (true);

-- bazaar_transactions
DROP POLICY IF EXISTS "System can insert bazaar transactions" ON public.bazaar_transactions;
CREATE POLICY "Service role can insert bazaar transactions"
ON public.bazaar_transactions FOR INSERT TO service_role WITH CHECK (true);

-- megatalent_referral_earnings
DROP POLICY IF EXISTS "System can create referral earnings" ON public.megatalent_referral_earnings;
CREATE POLICY "Service role can create referral earnings"
ON public.megatalent_referral_earnings FOR INSERT TO service_role WITH CHECK (true);

-- =============================================================
-- 3. GAMING TABLES — restrict to service_role
-- =============================================================

-- shadow_arena_credits
DROP POLICY IF EXISTS "System updates shadow credits" ON public.shadow_arena_credits;
CREATE POLICY "Service role updates shadow credits"
ON public.shadow_arena_credits FOR UPDATE TO service_role USING (true) WITH CHECK (true);

-- shadow_arena_achievements
DROP POLICY IF EXISTS "System can insert achievements" ON public.shadow_arena_achievements;
CREATE POLICY "Service role can insert achievements"
ON public.shadow_arena_achievements FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can update achievements" ON public.shadow_arena_achievements;
CREATE POLICY "Service role can update achievements"
ON public.shadow_arena_achievements FOR UPDATE TO service_role USING (true) WITH CHECK (true);

-- shadow_credit_purchases
DROP POLICY IF EXISTS "System manages credit purchases" ON public.shadow_credit_purchases;
CREATE POLICY "Service role manages credit purchases"
ON public.shadow_credit_purchases FOR ALL TO service_role USING (true) WITH CHECK (true);

-- shadow_battle_placements
DROP POLICY IF EXISTS "System can insert placements" ON public.shadow_battle_placements;
CREATE POLICY "Service role can insert placements"
ON public.shadow_battle_placements FOR INSERT TO service_role WITH CHECK (true);

-- skill_matches
DROP POLICY IF EXISTS "System can insert matches" ON public.skill_matches;
CREATE POLICY "Service role can insert matches"
ON public.skill_matches FOR INSERT TO service_role WITH CHECK (true);

-- =============================================================
-- 4. NOTIFICATIONS — restrict to service_role
-- =============================================================

DROP POLICY IF EXISTS "System can insert notifications" ON public.brain_duel_notifications;
CREATE POLICY "Service role can insert brain duel notifications"
ON public.brain_duel_notifications FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System inserts notifications" ON public.forum_notifications;
CREATE POLICY "Service role can insert forum notifications"
ON public.forum_notifications FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert notifications" ON public.skill_swap_notifications;
CREATE POLICY "Service role can insert skill swap notifications"
ON public.skill_swap_notifications FOR INSERT TO service_role WITH CHECK (true);

-- =============================================================
-- 5. SYSTEM TABLES — restrict to service_role
-- =============================================================

DROP POLICY IF EXISTS "System can insert timeline rows" ON public.couples_compatibility_timeline;
CREATE POLICY "Service role can insert timeline rows"
ON public.couples_compatibility_timeline FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can manage translations" ON public.post_translations;
CREATE POLICY "Service role can manage translations"
ON public.post_translations FOR ALL TO service_role USING (true) WITH CHECK (true);

-- edge_cache
DROP POLICY IF EXISTS "service can insert cache" ON public.edge_cache;
CREATE POLICY "Service role can insert cache"
ON public.edge_cache FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "service can update cache" ON public.edge_cache;
CREATE POLICY "Service role can update cache"
ON public.edge_cache FOR UPDATE TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service can delete cache" ON public.edge_cache;
CREATE POLICY "Service role can delete cache"
ON public.edge_cache FOR DELETE TO service_role USING (true);

-- rate_limits
DROP POLICY IF EXISTS "Allow rate limit inserts" ON public.rate_limits;
CREATE POLICY "Service role can insert rate limits"
ON public.rate_limits FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Allow rate limit updates" ON public.rate_limits;
CREATE POLICY "Service role can update rate limits"
ON public.rate_limits FOR UPDATE TO service_role USING (true) WITH CHECK (true);

-- =============================================================
-- 6. USER-FACING UPDATE policies — restrict to owner
-- =============================================================

-- comedy_open_mic — votes (owner only or auth — keeping permissive but require auth)
DROP POLICY IF EXISTS "Users can update votes" ON public.comedy_open_mic;
CREATE POLICY "Authenticated users can update votes"
ON public.comedy_open_mic FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- dream_battle_interpretations
DROP POLICY IF EXISTS "Users can update interpretation votes" ON public.dream_battle_interpretations;
CREATE POLICY "Authenticated users can update interpretation votes"
ON public.dream_battle_interpretations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- photo_gallery — anyone could update likes; restrict to authenticated
DROP POLICY IF EXISTS "Anyone can update gallery likes" ON public.photo_gallery;
CREATE POLICY "Authenticated users can update gallery likes"
ON public.photo_gallery FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- psychology_sessions
DROP POLICY IF EXISTS "Anyone can update their own session" ON public.psychology_sessions;
CREATE POLICY "Authenticated users can update sessions"
ON public.psychology_sessions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- hockey_matches
DROP POLICY IF EXISTS "Users can create hockey matches" ON public.hockey_matches;
CREATE POLICY "Authenticated users can create hockey matches"
ON public.hockey_matches FOR INSERT TO authenticated WITH CHECK (true);