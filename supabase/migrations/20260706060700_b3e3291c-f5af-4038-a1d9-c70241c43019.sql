CREATE POLICY "Users can delete their own ticket purchases"
  ON public.concert_ticket_purchases FOR DELETE
  USING (auth.uid() = user_id);