-- Add story_id column to messages table to track story replies
ALTER TABLE public.messages 
ADD COLUMN story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_messages_story ON public.messages(story_id);