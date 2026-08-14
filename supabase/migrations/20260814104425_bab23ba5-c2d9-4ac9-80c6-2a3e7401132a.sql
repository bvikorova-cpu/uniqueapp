-- BEFORE trigger: compute split into existing columns (chef_amount = influencer share)
CREATE OR REPLACE FUNCTION public.record_influencer_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_commission DECIMAL(10,2);
  v_rate DECIMAL(5,2);
BEGIN
  v_rate := COALESCE(NEW.commission_rate, 20.00);
  v_commission := ROUND(NEW.amount * (v_rate / 100), 2);
  NEW.commission_rate := v_rate;
  NEW.platform_commission := v_commission;
  NEW.chef_amount := NEW.amount - v_commission;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS record_influencer_commission_trigger ON public.influencer_sent_gifts;
CREATE TRIGGER record_influencer_commission_trigger
BEFORE INSERT OR UPDATE ON public.influencer_sent_gifts
FOR EACH ROW EXECUTE FUNCTION public.record_influencer_commission();

-- AFTER trigger: ledger + balances once completed
CREATE OR REPLACE FUNCTION public.settle_influencer_gift_earnings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status NOT IN ('completed','paid','succeeded') THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND COALESCE(OLD.status,'') IN ('completed','paid','succeeded') THEN RETURN NEW; END IF;

  INSERT INTO public.influencer_platform_earnings (
    gift_id, total_amount, influencer_amount, commission_amount, commission_rate, status
  ) VALUES (
    NEW.id, NEW.amount, COALESCE(NEW.chef_amount, NEW.amount * 0.8),
    COALESCE(NEW.platform_commission, NEW.amount * 0.2),
    COALESCE(NEW.commission_rate, 20.00), 'pending'
  ) ON CONFLICT (gift_id) DO NOTHING;

  UPDATE public.influencer_profiles
  SET pending_balance = COALESCE(pending_balance,0) + COALESCE(NEW.chef_amount, NEW.amount * 0.8),
      lifetime_earnings = COALESCE(lifetime_earnings,0) + COALESCE(NEW.chef_amount, NEW.amount * 0.8)
  WHERE id = NEW.influencer_id;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS settle_influencer_gift_earnings_trigger ON public.influencer_sent_gifts;
CREATE TRIGGER settle_influencer_gift_earnings_trigger
AFTER INSERT OR UPDATE ON public.influencer_sent_gifts
FOR EACH ROW EXECUTE FUNCTION public.settle_influencer_gift_earnings();