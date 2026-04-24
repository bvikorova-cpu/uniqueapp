CREATE POLICY "Deny all client access to psychology_sessions"
  ON public.psychology_sessions
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny all client access to psychology_messages"
  ON public.psychology_messages
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);