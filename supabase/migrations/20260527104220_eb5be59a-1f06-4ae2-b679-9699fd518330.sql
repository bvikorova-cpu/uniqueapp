INSERT INTO public.ai_credits (user_id, credits_remaining, last_used_at)
VALUES ('a8f98c5c-3ce8-4928-bfaf-061a700411c6', 200, now())
ON CONFLICT (user_id) DO UPDATE SET credits_remaining = GREATEST(public.ai_credits.credits_remaining, 200);