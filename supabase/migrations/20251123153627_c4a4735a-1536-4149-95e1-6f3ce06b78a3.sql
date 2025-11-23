-- Insert sample competitions (only if they don't exist) with correct column names
INSERT INTO public.iq_competitions (title, description, entry_fee, prize_pool, max_participants, status, start_time, end_time)
SELECT 'Daily IQ Challenge', 'Quick 15-minute daily competition', 5, 250, 200, 'active', now(), now() + interval '6 hours'
WHERE NOT EXISTS (SELECT 1 FROM public.iq_competitions WHERE title = 'Daily IQ Challenge');

INSERT INTO public.iq_competitions (title, description, entry_fee, prize_pool, max_participants, status, start_time, end_time)
SELECT 'Weekly Grand Tournament', '60-minute comprehensive test', 20, 1500, 100, 'active', now(), now() + interval '2 days'
WHERE NOT EXISTS (SELECT 1 FROM public.iq_competitions WHERE title = 'Weekly Grand Tournament');

INSERT INTO public.iq_competitions (title, description, entry_fee, prize_pool, max_participants, status, start_time, end_time)
SELECT 'Premium Championship', 'Expert level competition', 50, 5000, 50, 'upcoming', now() + interval '12 hours', now() + interval '1 day'
WHERE NOT EXISTS (SELECT 1 FROM public.iq_competitions WHERE title = 'Premium Championship');