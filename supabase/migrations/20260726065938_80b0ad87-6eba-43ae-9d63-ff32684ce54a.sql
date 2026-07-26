-- Remove pre-seeded free credits so Kids Gold Pass modules are truly pass-gated.
-- Only wipes untouched seed rows (nothing purchased). Users who purchased credits keep them.
UPDATE public.homework_credits SET credits_remaining = 0 WHERE total_credits_purchased = 0;
UPDATE public.kids_story_credits SET credits_remaining = 0 WHERE total_credits_purchased = 0;
UPDATE public.kids_drawing_credits SET credits_remaining = 0 WHERE COALESCE(total_credits_purchased, 0) = 0;
UPDATE public.kids_reading_credits SET credits_remaining = 0 WHERE COALESCE(total_credits_purchased, 0) = 0;
UPDATE public.science_credits SET credits_remaining = 0 WHERE COALESCE(total_credits_purchased, 0) = 0;