INSERT INTO public.league_seasons (season_number, starts_at, ends_at, is_active)
VALUES (1, date_trunc('week', now()), date_trunc('week', now()) + interval '7 days', true);