
-- 1. eco_comments (parity with healthy_comments)
CREATE TABLE IF NOT EXISTS public.eco_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.eco_submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.eco_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eco_comments TO authenticated;
GRANT ALL ON public.eco_comments TO service_role;

ALTER TABLE public.eco_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eco_comments_select_all"
  ON public.eco_comments FOR SELECT
  USING (true);

CREATE POLICY "eco_comments_insert_auth"
  ON public.eco_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_deleted = false);

CREATE POLICY "eco_comments_update_own_or_admin"
  ON public.eco_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "eco_comments_delete_own_or_admin"
  ON public.eco_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_eco_comments_submission ON public.eco_comments(submission_id, created_at);

-- 2. Cron: award monthly winners on the 1st of each month
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'award-eco-monthly-winner') THEN
    PERFORM cron.unschedule('award-eco-monthly-winner');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'award-healthy-monthly-winner') THEN
    PERFORM cron.unschedule('award-healthy-monthly-winner');
  END IF;
END $$;

SELECT cron.schedule(
  'award-eco-monthly-winner',
  '5 0 1 * *',
  $$ SELECT public.award_eco_monthly_winner(); $$
);

SELECT cron.schedule(
  'award-healthy-monthly-winner',
  '10 0 1 * *',
  $$ SELECT public.award_healthy_monthly_winner(to_char((now() - interval '1 day')::date, 'YYYY-MM')); $$
);
