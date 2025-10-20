-- Fix IBAN exposure and add proper RLS policies to profiles table
-- Remove the overly permissive public policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Add owner-only access for sensitive data
CREATE POLICY "Users can view own profile"
  ON public.profiles 
  FOR SELECT
  USING (auth.uid() = id);

-- Add RLS policies for transactions table
-- Users can only view their own transactions (as buyer or seller)
CREATE POLICY "Users view own transactions"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = buyer_id OR 
    auth.uid() = seller_id OR
    auth.uid() = user_id
  );

-- Only system/edge functions can insert transactions (prevent client-side creation)
CREATE POLICY "System creates transactions"
  ON public.transactions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- No direct updates allowed (use edge functions)
CREATE POLICY "No direct updates"
  ON public.transactions
  FOR UPDATE
  TO authenticated
  USING (false);

-- No deletions (financial records are immutable)
CREATE POLICY "No deletions"
  ON public.transactions
  FOR DELETE
  TO authenticated
  USING (false);

-- Admins can view all transactions
CREATE POLICY "Admins view all transactions"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));
