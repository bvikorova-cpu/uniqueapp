
-- DELETE POLICIES FOR ALL CRITICAL FINANCIAL TABLES
-- Pravidlo: Finančné záznamy sa NESMÚ mazať (len admin pre výnimočné prípady)

-- 1. bazaar_transactions - DELETE zakázané (finančné záznamy)
CREATE POLICY "No deletion of bazaar transactions" 
ON public.bazaar_transactions FOR DELETE USING (false);

-- 2. comedian_earnings - DELETE len admin
CREATE POLICY "Only admins can delete comedian earnings" 
ON public.comedian_earnings FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. comedy_battles - DELETE len admin
CREATE POLICY "Only admins can delete comedy battles" 
ON public.comedy_battles FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. comedy_platform_earnings - DELETE len admin
CREATE POLICY "Only admins can delete comedy platform earnings" 
ON public.comedy_platform_earnings FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. credit_payments - DELETE zakázané (finančné záznamy)
CREATE POLICY "No deletion of credit payments" 
ON public.credit_payments FOR DELETE USING (false);

-- 6. escape_room_earnings - DELETE len admin
CREATE POLICY "Only admins can delete escape room earnings" 
ON public.escape_room_earnings FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. home_decor_sales - DELETE zakázané (finančné záznamy)
CREATE POLICY "No deletion of home decor sales" 
ON public.home_decor_sales FOR DELETE USING (false);

-- 8. influencer_balances - DELETE len admin
CREATE POLICY "Only admins can delete influencer balances" 
ON public.influencer_balances FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- 9. influencer_earnings - DELETE len admin
CREATE POLICY "Only admins can delete influencer earnings" 
ON public.influencer_earnings FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- 10. instructor_payout_history - DELETE zakázané (finančné záznamy)
CREATE POLICY "No deletion of instructor payout history" 
ON public.instructor_payout_history FOR DELETE USING (false);

-- 11. masterchef_platform_earnings - DELETE len admin
CREATE POLICY "Only admins can delete masterchef earnings" 
ON public.masterchef_platform_earnings FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- 12. megatalent_referral_earnings - DELETE zakázané (finančné záznamy)
CREATE POLICY "No deletion of referral earnings" 
ON public.megatalent_referral_earnings FOR DELETE USING (false);

-- 13. payout_batches - DELETE len admin
CREATE POLICY "Only admins can delete payout batches" 
ON public.payout_batches FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- 14. sports_platform_earnings - DELETE len admin
CREATE POLICY "Only admins can delete sports earnings" 
ON public.sports_platform_earnings FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- 15. stock_content_earnings - DELETE len admin
CREATE POLICY "Only admins can delete stock content earnings" 
ON public.stock_content_earnings FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- 16. subscriptions - DELETE len admin
CREATE POLICY "Only admins can delete subscriptions" 
ON public.subscriptions FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- 17. withdrawal_requests - DELETE zakázané (finančné záznamy)
CREATE POLICY "No deletion of withdrawal requests" 
ON public.withdrawal_requests FOR DELETE USING (false);

-- 18. ai_credits - DELETE len admin
CREATE POLICY "Only admins can delete ai credits" 
ON public.ai_credits FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- 19. brain_duel_credits - DELETE len admin
CREATE POLICY "Only admins can delete brain duel credits" 
ON public.brain_duel_credits FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- 20. iq_credits - DELETE len admin
CREATE POLICY "Only admins can delete iq credits" 
ON public.iq_credits FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
