-- Create skill_swap_messages table if not exists
CREATE TABLE IF NOT EXISTS public.skill_swap_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offering_id UUID REFERENCES public.skill_offerings(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create skill_swap_conversations table if not exists
CREATE TABLE IF NOT EXISTS public.skill_swap_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offering_id UUID REFERENCES public.skill_offerings(id) ON DELETE SET NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_conversation UNIQUE(user1_id, user2_id, offering_id)
);

-- Enable Row Level Security
ALTER TABLE public.skill_swap_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_swap_conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own messages" ON public.skill_swap_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.skill_swap_messages;
DROP POLICY IF EXISTS "Users can update their received messages" ON public.skill_swap_messages;
DROP POLICY IF EXISTS "Users can view their conversations" ON public.skill_swap_conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.skill_swap_conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON public.skill_swap_conversations;

-- RLS Policies for messages
CREATE POLICY "Users can view their own messages"
  ON public.skill_swap_messages
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.skill_swap_messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
  ON public.skill_swap_messages
  FOR UPDATE
  USING (auth.uid() = receiver_id);

-- RLS Policies for conversations
CREATE POLICY "Users can view their conversations"
  ON public.skill_swap_conversations
  FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create conversations"
  ON public.skill_swap_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their conversations"
  ON public.skill_swap_conversations
  FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.skill_swap_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.skill_swap_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.skill_swap_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_users ON public.skill_swap_conversations(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON public.skill_swap_conversations(last_message_at DESC);

-- Enable realtime for messages
ALTER TABLE public.skill_swap_messages REPLICA IDENTITY FULL;
ALTER TABLE public.skill_swap_conversations REPLICA IDENTITY FULL;