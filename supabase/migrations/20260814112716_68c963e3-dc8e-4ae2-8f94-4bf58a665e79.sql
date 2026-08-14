CREATE OR REPLACE FUNCTION public.record_influencer_commission()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_commission DECIMAL(10,2);
  v_rate DECIMAL(5,2);
BEGIN
  v_rate := COALESCE(NEW.commission_rate, 15.00);
  v_commission := ROUND(NEW.amount * (v_rate / 100), 2);
  NEW.commission_rate := v_rate;
  NEW.platform_commission := v_commission;
  NEW.chef_amount := NEW.amount - v_commission;
  RETURN NEW;
END;
$$;

UPDATE public.influencer_sent_gifts
SET commission_rate = 15.00,
    platform_commission = ROUND(amount * 0.15, 2),
    chef_amount = amount - ROUND(amount * 0.15, 2)
WHERE COALESCE(commission_rate, 20) <> 15;