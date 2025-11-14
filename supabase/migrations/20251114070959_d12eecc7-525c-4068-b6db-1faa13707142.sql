-- Create notifications table for skill swap
CREATE TABLE IF NOT EXISTS public.skill_swap_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('exchange_request', 'message', 'review', 'exchange_accepted', 'exchange_completed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.skill_swap_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.skill_swap_notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.skill_swap_notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- System can insert notifications
CREATE POLICY "System can insert notifications"
ON public.skill_swap_notifications
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_skill_swap_notifications_user_id ON public.skill_swap_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_swap_notifications_created_at ON public.skill_swap_notifications(created_at DESC);

-- Enable realtime
ALTER TABLE public.skill_swap_notifications REPLICA IDENTITY FULL;

-- Function to create notification when exchange is requested
CREATE OR REPLACE FUNCTION notify_exchange_request()
RETURNS TRIGGER AS $$
DECLARE
  v_offering_owner UUID;
  v_requester_name TEXT;
  v_offering_title TEXT;
BEGIN
  -- Get offering owner and title
  SELECT user_id, title INTO v_offering_owner, v_offering_title
  FROM skill_offerings
  WHERE id = NEW.offering_id;
  
  -- Get requester name
  SELECT full_name INTO v_requester_name
  FROM profiles
  WHERE id = NEW.user1_id OR id = NEW.user2_id
  LIMIT 1;
  
  -- Create notification for offering owner
  IF v_offering_owner != NEW.user1_id THEN
    INSERT INTO skill_swap_notifications (user_id, actor_id, type, title, message, related_id)
    VALUES (
      v_offering_owner,
      NEW.user1_id,
      'exchange_request',
      'New Exchange Request',
      v_requester_name || ' wants to exchange skills with you for: ' || v_offering_title,
      NEW.id
    );
  ELSIF v_offering_owner != NEW.user2_id THEN
    INSERT INTO skill_swap_notifications (user_id, actor_id, type, title, message, related_id)
    VALUES (
      v_offering_owner,
      NEW.user2_id,
      'exchange_request',
      'New Exchange Request',
      v_requester_name || ' wants to exchange skills with you for: ' || v_offering_title,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for exchange requests
DROP TRIGGER IF EXISTS trigger_notify_exchange_request ON skill_swap_conversations;
CREATE TRIGGER trigger_notify_exchange_request
AFTER INSERT ON skill_swap_conversations
FOR EACH ROW
EXECUTE FUNCTION notify_exchange_request();

-- Function to notify on new message
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_recipient_id UUID;
  v_sender_name TEXT;
BEGIN
  -- Get recipient (the other user in conversation)
  SELECT CASE 
    WHEN user1_id = NEW.sender_id THEN user2_id
    ELSE user1_id
  END INTO v_recipient_id
  FROM skill_swap_conversations
  WHERE id = NEW.conversation_id;
  
  -- Get sender name
  SELECT full_name INTO v_sender_name
  FROM profiles
  WHERE id = NEW.sender_id;
  
  -- Create notification
  INSERT INTO skill_swap_notifications (user_id, actor_id, type, title, message, related_id)
  VALUES (
    v_recipient_id,
    NEW.sender_id,
    'message',
    'New Message',
    v_sender_name || ' sent you a message',
    NEW.conversation_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new messages
DROP TRIGGER IF EXISTS trigger_notify_new_message ON skill_swap_messages;
CREATE TRIGGER trigger_notify_new_message
AFTER INSERT ON skill_swap_messages
FOR EACH ROW
EXECUTE FUNCTION notify_new_message();