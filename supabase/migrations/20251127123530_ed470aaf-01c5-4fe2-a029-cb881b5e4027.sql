
-- Chýbajúce UPDATE politiky pre credit_payments a instructor_payout_history

-- credit_payments - UPDATE len admin (finančné záznamy)
CREATE POLICY "Only admins can update credit payments" 
ON public.credit_payments FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- instructor_payout_history - UPDATE len admin (finančné záznamy)
CREATE POLICY "Only admins can update instructor payout history" 
ON public.instructor_payout_history FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
