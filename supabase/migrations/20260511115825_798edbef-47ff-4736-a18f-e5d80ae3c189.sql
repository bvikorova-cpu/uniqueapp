-- Allow authenticated users to spectate live & finished IQ duels
DROP POLICY IF EXISTS "Anyone can spectate active duels" ON public.iq_duels;
CREATE POLICY "Anyone can spectate active duels" ON public.iq_duels
  FOR SELECT
  TO authenticated
  USING (status IN ('active', 'finished'));

CREATE INDEX IF NOT EXISTS idx_iq_duels_active ON public.iq_duels(status, started_at DESC) WHERE status = 'active';