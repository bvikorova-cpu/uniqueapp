-- Function to notify admins when new tipster applies
CREATE OR REPLACE FUNCTION notify_admin_new_tipster()
RETURNS TRIGGER AS $$
DECLARE
  admin_id UUID;
BEGIN
  -- Only notify on pending tipsters
  IF NEW.status = 'pending' THEN
    -- Get admin user ID - you'll need to set this to your actual admin user ID
    -- For now, we'll create notification that can be queried by admin role
    -- You can manually set admin_id here or query from a admins table
    
    -- Placeholder: Insert notification (admin will see it when they log in)
    -- Replace 'YOUR_ADMIN_USER_ID' with actual admin user ID
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      action_url,
      metadata
    )
    VALUES (
      NEW.user_id, -- Temporarily using the tipster's user_id, will be updated
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_tipster_created ON public.sports_tipsters;
CREATE TRIGGER on_tipster_created
  AFTER INSERT ON public.sports_tipsters
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_tipster();