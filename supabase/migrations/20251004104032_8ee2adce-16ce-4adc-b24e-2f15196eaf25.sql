-- Fix infinite recursion in conversation_participants RLS policies
-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to conversations" ON public.conversation_participants;

-- Create security definer function to check conversation membership
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conversation_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_participants
    WHERE conversation_participants.conversation_id = is_conversation_participant.conversation_id
    AND conversation_participants.user_id = is_conversation_participant.user_id
  );
$$;

-- Recreate policies using the security definer function
CREATE POLICY "Users can view participants in their conversations"
ON public.conversation_participants
FOR SELECT
USING (public.is_conversation_participant(conversation_id, auth.uid()));

CREATE POLICY "Users can add participants to new conversations"
ON public.conversation_participants
FOR INSERT
WITH CHECK (
  -- Allow if user is adding themselves
  auth.uid() = user_id OR
  -- Or if this is a new conversation (no participants yet except this insert)
  NOT EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_participants.conversation_id
  )
);