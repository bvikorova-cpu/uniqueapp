ALTER TABLE public.mt_contest_settings ALTER COLUMN min_prize_pool_eur SET DEFAULT 0;
UPDATE public.mt_contest_settings SET min_prize_pool_eur = 0;