-- Create trigger functions to notify admins of all withdrawal requests

-- Musician withdrawals
CREATE OR REPLACE FUNCTION public.notify_admin_musician_withdrawal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_admin_record RECORD;
  v_musician_name TEXT;
BEGIN
  -- Get musician name
  SELECT stage_name INTO v_musician_name
  FROM public.musician_profiles
  WHERE id = NEW.musician_id;
  
  -- Create notification for all admins
  FOR v_admin_record IN 
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_id,
      is_read
    ) VALUES (
      v_admin_record.user_id,
      'musician_withdrawal',
      'New Musician Withdrawal Request',
      COALESCE(v_musician_name, 'Musician') || ' requested €' || NEW.amount::TEXT || ' withdrawal',
      NEW.id,
      FALSE
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Instructor withdrawals
CREATE OR REPLACE FUNCTION public.notify_admin_instructor_withdrawal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_admin_record RECORD;
  v_instructor_name TEXT;
BEGIN
  -- Get instructor name from profiles via instructor_profiles
  SELECT p.full_name INTO v_instructor_name
  FROM public.instructor_profiles ip
  JOIN public.profiles p ON p.id = ip.user_id
  WHERE ip.id = NEW.instructor_id;
  
  -- Create notification for all admins
  FOR v_admin_record IN 
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_id,
      is_read
    ) VALUES (
      v_admin_record.user_id,
      'instructor_withdrawal',
      'New Instructor Withdrawal Request',
      COALESCE(v_instructor_name, 'Instructor') || ' requested €' || NEW.amount::TEXT || ' withdrawal',
      NEW.id,
      FALSE
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Campaign withdrawals
CREATE OR REPLACE FUNCTION public.notify_admin_campaign_withdrawal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_admin_record RECORD;
  v_creator_name TEXT;
BEGIN
  -- Get creator name
  SELECT full_name INTO v_creator_name
  FROM public.profiles
  WHERE id = NEW.creator_id;
  
  -- Create notification for all admins
  FOR v_admin_record IN 
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_id,
      is_read
    ) VALUES (
      v_admin_record.user_id,
      'campaign_withdrawal',
      'New Campaign Withdrawal Request',
      COALESCE(v_creator_name, 'Creator') || ' requested €' || NEW.amount::TEXT || ' withdrawal',
      NEW.id,
      FALSE
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS notify_admin_on_musician_withdrawal ON public.musician_withdrawal_requests;
CREATE TRIGGER notify_admin_on_musician_withdrawal
  AFTER INSERT ON public.musician_withdrawal_requests
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_admin_musician_withdrawal();

DROP TRIGGER IF EXISTS notify_admin_on_instructor_withdrawal ON public.instructor_withdrawal_requests;
CREATE TRIGGER notify_admin_on_instructor_withdrawal
  AFTER INSERT ON public.instructor_withdrawal_requests
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_admin_instructor_withdrawal();

DROP TRIGGER IF EXISTS notify_admin_on_campaign_withdrawal ON public.withdrawal_requests;
CREATE TRIGGER notify_admin_on_campaign_withdrawal
  AFTER INSERT ON public.withdrawal_requests
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_admin_campaign_withdrawal();