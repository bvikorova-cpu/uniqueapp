INSERT INTO public.megatalent_subscriptions (user_id, tier, price, bonus_votes, win_chance_boost, status, expires_at, current_period_end)
VALUES ('a8f98c5c-3ce8-4928-bfaf-061a700411c6', 'top_premium', 0, 100000, 50, 'active', now() + interval '90 days', now() + interval '90 days')
ON CONFLICT DO NOTHING;