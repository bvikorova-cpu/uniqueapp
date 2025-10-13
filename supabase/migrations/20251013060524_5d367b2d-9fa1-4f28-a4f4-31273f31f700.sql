-- Vytvoriť trigger funkciu ktorá automaticky vytvorí referral earning keď niekto aktivuje premium cez referral kód
CREATE OR REPLACE FUNCTION public.create_referral_earning_on_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id UUID;
BEGIN
  -- Zisti referrer_id z referred_by
  IF NEW.referred_by IS NOT NULL THEN
    -- Najdi používateľa ktorý vlastní referral kód
    SELECT user_id INTO v_referrer_id
    FROM megatalent_referral_codes
    WHERE code = NEW.referred_by;
    
    IF v_referrer_id IS NOT NULL THEN
      -- Vytvor záznam o zárobku z referralu
      INSERT INTO megatalent_referral_earnings (
        referrer_id,
        referred_user_id,
        subscription_id,
        amount,
        period_start,
        period_end,
        paid
      ) VALUES (
        v_referrer_id,
        NEW.user_id,
        NEW.id,
        5.00, -- 5€ za každý premium referral
        NEW.started_at,
        NEW.expires_at,
        FALSE -- čaká na vyplatenie
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Vytvor trigger ktorý sa spustí pri INSERT do megatalent_subscriptions
DROP TRIGGER IF EXISTS trigger_create_referral_earning ON public.megatalent_subscriptions;

CREATE TRIGGER trigger_create_referral_earning
  AFTER INSERT ON public.megatalent_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_referral_earning_on_subscription();

-- Pridať RLS politiky pre megatalent_referral_earnings ak neexistujú
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'megatalent_referral_earnings' 
    AND policyname = 'Users can view their referral earnings'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their referral earnings"
      ON public.megatalent_referral_earnings
      FOR SELECT
      USING (auth.uid() = referrer_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'megatalent_referral_earnings' 
    AND policyname = 'Admins can update earnings'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can update earnings"
      ON public.megatalent_referral_earnings
      FOR UPDATE
      USING (has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END $$;

-- Zapnúť RLS ak nie je zapnuté
ALTER TABLE public.megatalent_referral_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.megatalent_referral_codes ENABLE ROW LEVEL SECURITY;