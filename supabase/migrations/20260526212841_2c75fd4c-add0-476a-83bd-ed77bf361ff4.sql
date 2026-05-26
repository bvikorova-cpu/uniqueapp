
INSERT INTO public.homework_credits (user_id, credits_remaining, total_credits_purchased)
VALUES ('a8f98c5c-3ce8-4928-bfaf-061a700411c6', 50, 50)
ON CONFLICT (user_id) DO UPDATE SET credits_remaining = public.homework_credits.credits_remaining + 50;
