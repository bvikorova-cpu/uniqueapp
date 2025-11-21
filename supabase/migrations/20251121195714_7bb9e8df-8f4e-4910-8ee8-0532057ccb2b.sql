-- Fix security warning: Set search_path for function
CREATE OR REPLACE FUNCTION create_influencer_earnings_from_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create earnings when payment status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Insert into influencer_earnings
    INSERT INTO public.influencer_earnings (
      influencer_id,
      amount,
      net_amount,
      platform_fee,
      source,
      source_id,
      user_id
    )
    SELECT
      va.influencer_id,
      NEW.amount,
      NEW.influencer_amount,
      NEW.platform_fee,
      'brand_campaign',
      NEW.campaign_id,
      NEW.influencer_user_id
    FROM public.virtual_influencers va
    WHERE va.id = (
      SELECT ca.influencer_id 
      FROM public.campaign_applications ca 
      WHERE ca.id = NEW.application_id
    );

    -- Update influencer balance
    INSERT INTO public.influencer_balances (
      influencer_id,
      user_id,
      total_earned,
      available_balance
    )
    SELECT
      va.influencer_id,
      va.user_id,
      NEW.influencer_amount,
      NEW.influencer_amount
    FROM public.virtual_influencers va
    WHERE va.id = (
      SELECT ca.influencer_id 
      FROM public.campaign_applications ca 
      WHERE ca.id = NEW.application_id
    )
    ON CONFLICT (influencer_id) 
    DO UPDATE SET
      total_earned = influencer_balances.total_earned + NEW.influencer_amount,
      available_balance = influencer_balances.available_balance + NEW.influencer_amount,
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;