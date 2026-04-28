-- Add updated_at column to talent_comments
ALTER TABLE public.talent_comments
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Trigger to auto-update updated_at on row update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_talent_comments_set_updated_at'
  ) THEN
    CREATE TRIGGER trg_talent_comments_set_updated_at
      BEFORE UPDATE ON public.talent_comments
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- RLS policy: allow author to update their own comment
DROP POLICY IF EXISTS "Users can update their own talent comments" ON public.talent_comments;
CREATE POLICY "Users can update their own talent comments"
  ON public.talent_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);