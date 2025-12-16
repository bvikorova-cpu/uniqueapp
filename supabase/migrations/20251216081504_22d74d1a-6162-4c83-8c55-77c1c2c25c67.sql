-- Add self-destructing message support
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Create group chats table
CREATE TABLE public.group_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group chat members table
CREATE TABLE public.group_chat_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.group_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create group messages table
CREATE TABLE public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.group_chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT,
  message_type TEXT DEFAULT 'text',
  attachment_url TEXT,
  attachment_type TEXT,
  voice_duration INTEGER,
  reply_to_id UUID REFERENCES public.group_messages(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user online status table
CREATE TABLE public.user_online_status (
  user_id UUID NOT NULL PRIMARY KEY,
  is_online BOOLEAN NOT NULL DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.group_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_online_status ENABLE ROW LEVEL SECURITY;

-- Group chats policies
CREATE POLICY "Users can view groups they are members of" ON public.group_chats
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.group_chat_members WHERE group_id = id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create groups" ON public.group_chats
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups" ON public.group_chats
  FOR UPDATE USING (auth.uid() = created_by);

-- Group members policies
CREATE POLICY "Users can view members of their groups" ON public.group_chat_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.group_chat_members gcm WHERE gcm.group_id = group_id AND gcm.user_id = auth.uid())
  );

CREATE POLICY "Group admins can add members" ON public.group_chat_members
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.group_chat_members gcm WHERE gcm.group_id = group_id AND gcm.user_id = auth.uid() AND gcm.role IN ('admin', 'creator'))
    OR EXISTS (SELECT 1 FROM public.group_chats gc WHERE gc.id = group_id AND gc.created_by = auth.uid())
  );

CREATE POLICY "Users can leave groups" ON public.group_chat_members
  FOR DELETE USING (auth.uid() = user_id);

-- Group messages policies
CREATE POLICY "Users can view messages in their groups" ON public.group_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.group_chat_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can send messages to their groups" ON public.group_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM public.group_chat_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())
  );

-- Online status policies
CREATE POLICY "Anyone can view online status" ON public.user_online_status
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own status" ON public.user_online_status
  FOR ALL USING (auth.uid() = user_id);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_chat_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_online_status;