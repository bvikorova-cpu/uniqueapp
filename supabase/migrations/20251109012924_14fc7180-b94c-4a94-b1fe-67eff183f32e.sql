-- Fix search_path for the notification function
CREATE OR REPLACE FUNCTION notify_admins_verification_request()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
BEGIN
  -- Loop through all admin users and create notifications
  FOR admin_record IN 
    SELECT user_id 
    FROM user_roles 
    WHERE role = 'admin'
  LOOP
    -- Create notification for each admin
    INSERT INTO notifications (
      user_id,
      type,
      actor_id,
      related_id,
      is_read
    ) VALUES (
      admin_record.user_id,
      'verification_request',
      NEW.employer_id,
      NEW.id,
      false
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;