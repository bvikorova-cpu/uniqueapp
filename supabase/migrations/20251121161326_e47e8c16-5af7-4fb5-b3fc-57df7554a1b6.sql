-- Create trigger to automatically create balance when influencer is created
CREATE OR REPLACE FUNCTION create_influencer_balance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.influencer_balances (influencer_id, total_earned, withdrawn, pending_withdrawal)
  VALUES (NEW.id, 0, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_create_influencer_balance
  AFTER INSERT ON public.virtual_influencers
  FOR EACH ROW
  EXECUTE FUNCTION create_influencer_balance();