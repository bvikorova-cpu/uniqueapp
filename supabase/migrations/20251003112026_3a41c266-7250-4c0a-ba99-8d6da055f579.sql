-- Create table for anonymous psychology chat sessions
CREATE TABLE public.psychology_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_activity timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for chat messages
CREATE TABLE public.psychology_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.psychology_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.psychology_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychology_messages ENABLE ROW LEVEL SECURITY;

-- Sessions are accessible to everyone (anonymous)
CREATE POLICY "Anyone can create sessions"
ON public.psychology_sessions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view their own session"
ON public.psychology_sessions
FOR SELECT
USING (true);

CREATE POLICY "Anyone can update their own session"
ON public.psychology_sessions
FOR UPDATE
USING (true);

-- Messages policies (anonymous access)
CREATE POLICY "Anyone can insert messages"
ON public.psychology_messages
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view messages from their session"
ON public.psychology_messages
FOR SELECT
USING (true);

-- Create index for better performance
CREATE INDEX psychology_messages_session_id_idx ON public.psychology_messages(session_id);
CREATE INDEX psychology_messages_created_at_idx ON public.psychology_messages(created_at);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.psychology_messages;

-- Trigger to update last_activity
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.psychology_sessions
  SET last_activity = now()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_session_activity_trigger
AFTER INSERT ON public.psychology_messages
FOR EACH ROW
EXECUTE FUNCTION update_session_activity();