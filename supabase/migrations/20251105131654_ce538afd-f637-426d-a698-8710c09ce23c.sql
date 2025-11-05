-- Fix missing RLS policies for timestamp update functions
-- Set search_path for all new functions

-- Drop and recreate functions with proper search_path
DROP FUNCTION IF EXISTS public.update_sports_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_tipster_statistics() CASCADE;
DROP FUNCTION IF EXISTS public.update_tipster_followers_count() CASCADE;
DROP FUNCTION IF EXISTS public.record_tip_purchase_earnings() CASCADE;

-- Recreate with proper search_path
CREATE OR REPLACE FUNCTION public.update_sports_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_tipster_statistics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.result IS NOT NULL AND OLD.result IS NULL THEN
    UPDATE public.sports_tipsters
    SET 
      total_predictions = total_predictions + 1,
      correct_predictions = correct_predictions + (CASE WHEN NEW.result = 'won' THEN 1 ELSE 0 END),
      win_rate = ROUND(
        (correct_predictions + (CASE WHEN NEW.result = 'won' THEN 1 ELSE 0 END))::NUMERIC / 
        (total_predictions + 1)::NUMERIC * 100, 
        2
      ),
      updated_at = now()
    WHERE id = NEW.tipster_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_tipster_followers_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.sports_tipsters
    SET followers_count = followers_count + 1
    WHERE id = NEW.tipster_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.sports_tipsters
    SET followers_count = GREATEST(followers_count - 1, 0)
    WHERE id = OLD.tipster_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_tip_purchase_earnings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tipster_amount DECIMAL(10,2);
  v_commission DECIMAL(10,2);
  v_tipster_id UUID;
BEGIN
  -- Get tipster_id from prediction
  SELECT tipster_id INTO v_tipster_id
  FROM public.sports_predictions
  WHERE id = NEW.prediction_id;
  
  -- Calculate amounts (75% to tipster, 25% commission)
  v_tipster_amount := NEW.amount_paid * 0.75;
  v_commission := NEW.amount_paid * 0.25;
  
  -- Record platform earnings
  INSERT INTO public.sports_platform_earnings (
    tipster_id,
    transaction_type,
    total_amount,
    tipster_amount,
    platform_commission,
    related_id
  ) VALUES (
    v_tipster_id,
    'tip_sale',
    NEW.amount_paid,
    v_tipster_amount,
    v_commission,
    NEW.prediction_id
  );
  
  -- Update tipster earnings
  UPDATE public.sports_tipsters
  SET 
    total_earnings = total_earnings + v_tipster_amount,
    pending_payout = pending_payout + v_tipster_amount,
    updated_at = now()
  WHERE id = v_tipster_id;
  
  RETURN NEW;
END;
$$;

-- Recreate all triggers
DROP TRIGGER IF EXISTS trigger_sports_tipsters_updated_at ON public.sports_tipsters;
DROP TRIGGER IF EXISTS trigger_sports_matches_updated_at ON public.sports_matches;
DROP TRIGGER IF EXISTS trigger_sports_predictions_updated_at ON public.sports_predictions;
DROP TRIGGER IF EXISTS trigger_update_tipster_stats ON public.sports_predictions;
DROP TRIGGER IF EXISTS trigger_update_followers_count ON public.sports_tipster_followers;
DROP TRIGGER IF EXISTS trigger_record_tip_earnings ON public.sports_purchased_tips;

CREATE TRIGGER trigger_sports_tipsters_updated_at
  BEFORE UPDATE ON public.sports_tipsters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sports_updated_at();

CREATE TRIGGER trigger_sports_matches_updated_at
  BEFORE UPDATE ON public.sports_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sports_updated_at();

CREATE TRIGGER trigger_sports_predictions_updated_at
  BEFORE UPDATE ON public.sports_predictions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sports_updated_at();

CREATE TRIGGER trigger_update_tipster_stats
  AFTER UPDATE ON public.sports_predictions
  FOR EACH ROW
  WHEN (NEW.result IS DISTINCT FROM OLD.result)
  EXECUTE FUNCTION public.update_tipster_statistics();

CREATE TRIGGER trigger_update_followers_count
  AFTER INSERT OR DELETE ON public.sports_tipster_followers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tipster_followers_count();

CREATE TRIGGER trigger_record_tip_earnings
  AFTER INSERT ON public.sports_purchased_tips
  FOR EACH ROW
  EXECUTE FUNCTION public.record_tip_purchase_earnings();

-- Add missing RLS policies for subscriptions update
CREATE POLICY "Users can update their subscriptions"
  ON public.sports_tipster_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON public.sports_tipster_subscriptions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Add missing policy for ai subscriptions update
CREATE POLICY "Admins can view AI subscriptions"
  ON public.sports_ai_subscriptions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Add missing update policy for followers
CREATE POLICY "Users can update their follow preferences"
  ON public.sports_tipster_followers FOR UPDATE
  USING (auth.uid() = user_id);