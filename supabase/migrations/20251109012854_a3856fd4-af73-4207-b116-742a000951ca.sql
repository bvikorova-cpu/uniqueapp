-- Function to notify admins about new verification requests
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new verification is submitted
CREATE TRIGGER on_verification_request_submitted
  AFTER INSERT ON employer_verifications
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_verification_request();