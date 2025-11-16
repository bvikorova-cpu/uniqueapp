-- Fix search path security issue for the function
CREATE OR REPLACE FUNCTION notify_admin_new_tipster()
RETURNS TRIGGER AS $$
DECLARE
  admin_id UUID;
BEGIN
  IF NEW.status = 'pending' THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      action_url,
      metadata
    )
    VALUES (
      NEW.user_id,
      'tipster_application',
      'New Tipster Application',
      NEW.display_name || ' applied as a tipster for ' || NEW.sport_specialization,
      '/admin/tipsters',
      jsonb_build_object(
        'tipster_id', NEW.id,
        'tipster_name', NEW.display_name,
        'sport', NEW.sport_specialization
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;