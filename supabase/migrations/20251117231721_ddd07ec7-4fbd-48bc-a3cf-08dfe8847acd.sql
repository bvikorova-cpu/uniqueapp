-- Create trigger function to notify admins of new MasterChef withdrawal requests
CREATE OR REPLACE FUNCTION public.notify_admin_masterchef_withdrawal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_admin_record RECORD;
  v_chef_name TEXT;
BEGIN
  -- Get chef name
  SELECT full_name INTO v_chef_name
  FROM public.profiles
  WHERE id = NEW.chef_id;
  
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
      'masterchef_withdrawal',
      'New MasterChef Withdrawal Request',
      v_chef_name || ' requested €' || NEW.amount::TEXT || ' withdrawal',
      NEW.id,
      FALSE
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger on masterchef_withdrawal_requests
CREATE TRIGGER notify_admin_on_masterchef_withdrawal
  AFTER INSERT ON public.masterchef_withdrawal_requests
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_admin_masterchef_withdrawal();