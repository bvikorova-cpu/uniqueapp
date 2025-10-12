-- Create contact messages table
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can send contact messages
CREATE POLICY "Anyone can send contact messages"
ON public.contact_messages
FOR INSERT
TO public
WITH CHECK (true);

-- Admins can view all contact messages
CREATE POLICY "Admins can view all contact messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admins can update contact messages (mark as read)
CREATE POLICY "Admins can update contact messages"
ON public.contact_messages
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Create index for better performance
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX idx_contact_messages_is_read ON public.contact_messages(is_read);