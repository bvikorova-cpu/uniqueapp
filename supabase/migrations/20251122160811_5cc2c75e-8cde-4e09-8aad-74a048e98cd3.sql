-- Fix function search path security issue
DROP TRIGGER IF EXISTS update_auction_withdrawal_requests_updated_at ON public.auction_withdrawal_requests;
DROP FUNCTION IF EXISTS public.update_auction_withdrawal_updated_at();

CREATE OR REPLACE FUNCTION public.update_auction_withdrawal_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_auction_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.auction_withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_auction_withdrawal_updated_at();