-- Fix search_path security warning
DROP TRIGGER IF EXISTS trigger_create_influencer_balance ON public.virtual_influencers;
DROP FUNCTION IF EXISTS create_influencer_balance();

CREATE OR REPLACE FUNCTION create_influencer_balance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.influencer_balances (influencer_id, total_earned, withdrawn, pending_withdrawal)
  VALUES (NEW.id, 0, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_create_influencer_balance
  AFTER INSERT ON public.virtual_influencers
  FOR EACH ROW
  EXECUTE FUNCTION create_influencer_balance();