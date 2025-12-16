-- Add new columns to messages table for enhanced features
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';

-- Create message reactions table
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, reaction)
);

-- Create typing indicators table (for real-time presence)
CREATE TABLE IF NOT EXISTS public.typing_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_typing BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_reactions
CREATE POLICY "Users can view reactions in their conversations"
ON public.message_reactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
    WHERE m.id = message_reactions.message_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add reactions to messages in their conversations"
ON public.message_reactions FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
    WHERE m.id = message_reactions.message_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove their own reactions"
ON public.message_reactions FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for typing_indicators
CREATE POLICY "Users can view typing in their conversations"
ON public.typing_indicators FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = typing_indicators.conversation_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own typing status"
ON public.typing_indicators FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = typing_indicators.conversation_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update typing indicator"
ON public.typing_indicators FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete typing indicator"
ON public.typing_indicators FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for typing indicators
ALTER PUBLICATION supabase_realtime ADD TABLE typing_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_conversation ON public.typing_indicators(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON public.messages(reply_to_id);