CREATE TABLE public.mt_contest_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start date NOT NULL,
  period_end date NOT NULL,
  prize_pool_eur numeric NOT NULL DEFAULT 10000,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (period_start, period_end)
);

GRANT SELECT ON public.mt_contest_settings TO anon;
GRANT SELECT ON public.mt_contest_settings TO authenticated;
GRANT ALL ON public.mt_contest_settings TO service_role;

ALTER TABLE public.mt_contest_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone reads contest settings"
  ON public.mt_contest_settings FOR SELECT
  USING (true);

CREATE POLICY "admins manage contest settings"
  ON public.mt_contest_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.mt_contest_settings_touch()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_mt_contest_settings_touch
  BEFORE UPDATE ON public.mt_contest_settings
  FOR EACH ROW EXECUTE FUNCTION public.mt_contest_settings_touch();

INSERT INTO public.mt_contest_settings (period_start, period_end, prize_pool_eur, title) VALUES
  ('2026-07-01','2026-09-30',10000,'Q3 2026 Megatalent Contest'),
  ('2026-10-01','2026-12-31',10000,'Q4 2026 Megatalent Contest')
ON CONFLICT DO NOTHING;