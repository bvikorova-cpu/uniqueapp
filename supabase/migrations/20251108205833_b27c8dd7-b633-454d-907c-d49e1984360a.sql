-- Create function to handle follow notifications
CREATE OR REPLACE FUNCTION handle_new_follow()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for the user being followed
  INSERT INTO notifications (user_id, type, actor_id)
  VALUES (NEW.following_id, 'follow', NEW.follower_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on follows table
DROP TRIGGER IF EXISTS on_follow_created ON follows;
CREATE TRIGGER on_follow_created
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_follow();