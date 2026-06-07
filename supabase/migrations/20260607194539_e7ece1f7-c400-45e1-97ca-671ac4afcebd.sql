CREATE OR REPLACE FUNCTION public.validate_profile_tip()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.amount_cents IS NULL OR NEW.amount_cents < 100 OR NEW.amount_cents > 10000 THEN
    RAISE EXCEPTION 'Tip amount must be between €1 and €100';
  END IF;
  IF NEW.sender_id = NEW.recipient_id THEN
    RAISE EXCEPTION 'Cannot tip yourself';
  END IF;
  IF NEW.status NOT IN ('pending','completed','refunded','failed') THEN
    RAISE EXCEPTION 'Invalid status %', NEW.status;
  END IF;
  IF NEW.platform_fee_cents < 0 OR NEW.platform_fee_cents > NEW.amount_cents THEN
    RAISE EXCEPTION 'Invalid platform fee';
  END IF;
  IF NEW.recipient_amount_cents IS NULL THEN
    NEW.recipient_amount_cents := NEW.amount_cents - NEW.platform_fee_cents;
  END IF;
  IF NEW.amount IS NULL THEN
    NEW.amount := NEW.amount_cents::numeric / 100;
  END IF;
  RETURN NEW;
END;
$function$;