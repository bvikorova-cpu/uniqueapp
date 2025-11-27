
-- Create demo tipsters (3 expert tipsters) with correct badge values
INSERT INTO public.sports_tipsters (id, user_id, display_name, bio, avatar_url, sport_specialization, status, badge, total_predictions, correct_predictions, win_rate, roi, followers_count, tip_price, subscription_price, total_earnings, pending_payout)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', '3c23b29d-c9e2-4495-8772-143464d08486', 'ProTipster_SK', 'Profesionálny tipster s 10+ rokmi skúseností v futbalovom tipovaní. Špecializujem sa na Premier League a Bundesligu.', NULL, 'Football', 'active', 'elite', 245, 178, 72.65, 18.5, 1250, 4.99, 29.99, 12500.00, 450.00)
ON CONFLICT (user_id) DO NOTHING;

-- Create demo matches
INSERT INTO public.sports_matches (id, sport, league, home_team, away_team, match_date, match_time, venue, status, home_form, away_form)
VALUES
  ('d4444444-4444-4444-4444-444444444444', 'Football', 'Premier League', 'Manchester United', 'Liverpool FC', NOW() + INTERVAL '2 days', '20:00', 'Old Trafford', 'scheduled', 'WWDLW', 'WLWWW'),
  ('e5555555-5555-5555-5555-555555555555', 'Football', 'Bundesliga', 'Bayern Munich', 'Borussia Dortmund', NOW() + INTERVAL '3 days', '18:30', 'Allianz Arena', 'scheduled', 'WWWWD', 'WDWWL'),
  ('f6666666-6666-6666-6666-666666666666', 'Tennis', 'ATP Masters', 'Novak Djokovic', 'Carlos Alcaraz', NOW() + INTERVAL '1 day', '15:00', 'Melbourne Park', 'scheduled', NULL, NULL),
  ('a7777777-7777-7777-7777-777777777777', 'Ice Hockey', 'NHL', 'Vegas Golden Knights', 'Colorado Avalanche', NOW() + INTERVAL '4 days', '02:00', 'T-Mobile Arena', 'scheduled', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Add price column to sports_predictions if not exists
ALTER TABLE public.sports_predictions ADD COLUMN IF NOT EXISTS price numeric DEFAULT 4.99;

-- Create demo predictions (premium tips)
INSERT INTO public.sports_predictions (id, match_id, tipster_id, prediction_type, prediction_value, odds, confidence, analysis_text, is_free, is_premium, price)
VALUES
  (gen_random_uuid(), 'd4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 'Over 2.5 Goals', 'Over', 1.85, 78, 'Manchester United doma hrá ofenzívne a Liverpool má silný útok. Očakávam otvorený zápas s minimálne 3 gólmi.', false, true, 4.99),
  (gen_random_uuid(), 'e5555555-5555-5555-5555-555555555555', 'a1111111-1111-1111-1111-111111111111', 'Home Win', 'Bayern', 1.65, 82, 'Bayern doma neprehrali 23 zápasov. Dortmund má problémy v obrane a Bayern je v top forme.', false, true, 5.99),
  (gen_random_uuid(), 'f6666666-6666-6666-6666-666666666666', 'a1111111-1111-1111-1111-111111111111', 'Match Winner', 'Djokovic', 1.55, 85, 'Djokovic je v neuveriteľnej forme a na hard courte je takmer neporaziteľný.', false, true, 3.99),
  (gen_random_uuid(), 'a7777777-7777-7777-7777-777777777777', 'a1111111-1111-1111-1111-111111111111', 'Over 5.5 Goals', 'Over', 1.72, 71, 'Oba tímy hrajú ofenzívny hokej. Vegas má najlepší útok v západnej konferencii.', false, true, 4.99);
