-- Insert current sports matches for November 5, 2025
INSERT INTO sports_matches (sport, league, home_team, away_team, match_date, match_time, venue, status, home_form, away_form) VALUES
-- Premier League matches
('Football', 'Premier League', 'Manchester City', 'Arsenal', '2025-11-05 20:00:00+00', '20:00', 'Etihad Stadium', 'scheduled', 'WWDWW', 'WWLWW'),
('Football', 'Premier League', 'Liverpool', 'Chelsea', '2025-11-05 17:30:00+00', '17:30', 'Anfield', 'scheduled', 'WWWDW', 'WDWWL'),
('Football', 'Premier League', 'Manchester United', 'Tottenham', '2025-11-05 19:45:00+00', '19:45', 'Old Trafford', 'scheduled', 'LWDWW', 'WWWDL'),

-- La Liga matches  
('Football', 'La Liga', 'Real Madrid', 'Barcelona', '2025-11-05 21:00:00+00', '21:00', 'Santiago Bernabéu', 'scheduled', 'WWWWW', 'WWDWW'),
('Football', 'La Liga', 'Atletico Madrid', 'Sevilla', '2025-11-05 18:30:00+00', '18:30', 'Wanda Metropolitano', 'scheduled', 'WDWWL', 'LWWDW'),

-- Champions League
('Football', 'Champions League', 'Bayern Munich', 'PSG', '2025-11-05 21:00:00+00', '21:00', 'Allianz Arena', 'scheduled', 'WWWWW', 'WWWDW'),
('Football', 'Champions League', 'Inter Milan', 'Juventus', '2025-11-05 21:00:00+00', '21:00', 'San Siro', 'scheduled', 'WWDWW', 'WDWWW'),

-- NBA games
('Basketball', 'NBA', 'LA Lakers', 'Boston Celtics', '2025-11-06 02:30:00+00', '02:30', 'Crypto.com Arena', 'scheduled', 'WWLWW', 'WWWWL'),
('Basketball', 'NBA', 'Golden State Warriors', 'Miami Heat', '2025-11-06 03:00:00+00', '03:00', 'Chase Center', 'scheduled', 'WLWWW', 'LWWDW'),

-- Tennis
('Tennis', 'ATP Finals', 'Carlos Alcaraz', 'Novak Djokovic', '2025-11-05 19:00:00+00', '19:00', 'Pala Alpitour', 'scheduled', 'WWWWL', 'WWWWW');