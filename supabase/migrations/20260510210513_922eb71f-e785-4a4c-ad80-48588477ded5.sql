
CREATE TABLE IF NOT EXISTS public.iq_duels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode TEXT NOT NULL CHECK (mode IN ('quick','standard','ranked','blitz')),
  host_id UUID NOT NULL,
  opponent_id UUID,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','active','finished','cancelled')),
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  host_score INTEGER NOT NULL DEFAULT 0,
  opponent_score INTEGER NOT NULL DEFAULT 0,
  host_finished BOOLEAN NOT NULL DEFAULT false,
  opponent_finished BOOLEAN NOT NULL DEFAULT false,
  winner_id UUID,
  entry_fee INTEGER NOT NULL DEFAULT 0,
  prize INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_iq_duels_waiting ON public.iq_duels(mode, status) WHERE status = 'waiting';
CREATE INDEX IF NOT EXISTS idx_iq_duels_host ON public.iq_duels(host_id);
CREATE INDEX IF NOT EXISTS idx_iq_duels_opponent ON public.iq_duels(opponent_id);

ALTER TABLE public.iq_duels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Players can view own duels" ON public.iq_duels;
CREATE POLICY "Players can view own duels" ON public.iq_duels
  FOR SELECT USING (auth.uid() = host_id OR auth.uid() = opponent_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.iq_duels;
ALTER TABLE public.iq_duels REPLICA IDENTITY FULL;

CREATE OR REPLACE FUNCTION public.get_iq_competition_counts()
RETURNS TABLE(competition_id UUID, participant_count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT competition_id, count(*)::bigint
  FROM iq_competition_participants
  GROUP BY competition_id
$$;

GRANT EXECUTE ON FUNCTION public.get_iq_competition_counts() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_iq_global_leaderboard()
RETURNS TABLE(user_id UUID, username TEXT, best_iq INTEGER, tests_taken BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    r.user_id,
    COALESCE(p.full_name, 'Player') AS username,
    MAX(r.iq_score) AS best_iq,
    count(*)::bigint AS tests_taken
  FROM iq_test_results r
  LEFT JOIN profiles p ON p.id = r.user_id
  WHERE r.iq_score IS NOT NULL
  GROUP BY r.user_id, p.full_name
  ORDER BY best_iq DESC NULLS LAST
  LIMIT 10
$$;

GRANT EXECUTE ON FUNCTION public.get_iq_global_leaderboard() TO anon, authenticated;

INSERT INTO public.iq_questions (question, option_a, option_b, option_c, option_d, correct_answer, difficulty, category, time_limit) VALUES
('What number comes next: 2, 4, 8, 16, ?', '24', '30', '32', '36', 'C', 'beginner', 'pattern', 30),
('Which is the odd one out?', 'Cat', 'Dog', 'Lion', 'Car', 'D', 'beginner', 'logic', 30),
('5 + 3 × 2 = ?', '11', '16', '13', '10', 'A', 'beginner', 'math', 30),
('Complete: A, C, E, G, ?', 'H', 'I', 'J', 'K', 'B', 'beginner', 'pattern', 30),
('Which shape has 3 sides?', 'Square', 'Triangle', 'Hexagon', 'Pentagon', 'B', 'beginner', 'shapes', 30),
('If today is Monday, what day will it be in 10 days?', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'B', 'beginner', 'logic', 30),
('25% of 80 = ?', '15', '20', '25', '30', 'B', 'beginner', 'math', 30),
('Which word is the synonym of "Happy"?', 'Sad', 'Joyful', 'Angry', 'Tired', 'B', 'beginner', 'verbal', 30),
('1, 1, 2, 3, 5, 8, ?', '11', '12', '13', '15', 'C', 'beginner', 'pattern', 30),
('How many minutes in 2.5 hours?', '120', '130', '140', '150', 'D', 'beginner', 'math', 30),
('If 3x + 2 = 14, x = ?', '3', '4', '5', '6', 'B', 'intermediate', 'math', 45),
('Find the missing: 7, 14, 28, 56, ?', '84', '98', '112', '128', 'C', 'intermediate', 'pattern', 45),
('Which doesn''t belong: Mercury, Venus, Earth, Pluto?', 'Mercury', 'Venus', 'Earth', 'Pluto', 'D', 'intermediate', 'general', 45),
('Sum of angles in a hexagon?', '540°', '720°', '900°', '1080°', 'B', 'intermediate', 'geometry', 45),
('A train travels 60km in 45min. Speed in km/h?', '60', '70', '80', '90', 'C', 'intermediate', 'math', 45),
('Antonym of "Verbose"?', 'Talkative', 'Concise', 'Loud', 'Detailed', 'B', 'intermediate', 'verbal', 45),
('If A=1, B=2... what is "FACE" sum?', '14', '16', '17', '18', 'B', 'intermediate', 'logic', 45),
('Square root of 144?', '10', '11', '12', '13', 'C', 'intermediate', 'math', 45),
('3, 6, 11, 18, 27, ?', '36', '38', '40', '42', 'B', 'intermediate', 'pattern', 45),
('Which is prime?', '15', '21', '27', '29', 'D', 'intermediate', 'math', 45),
('If 2 painters paint 2 walls in 2 hours, how long for 8 painters to paint 8 walls?', '1h', '2h', '4h', '8h', 'B', 'advanced', 'logic', 60),
('Probability of two coins both showing heads?', '1/2', '1/3', '1/4', '1/8', 'C', 'advanced', 'math', 60),
('Next: 1, 4, 9, 16, 25, ?', '30', '32', '36', '49', 'C', 'advanced', 'pattern', 60),
('A clock shows 3:15. Angle between hands?', '0°', '7.5°', '15°', '22.5°', 'B', 'advanced', 'geometry', 60),
('Log₂(64) = ?', '4', '5', '6', '8', 'C', 'advanced', 'math', 60),
('Find the odd: 121, 144, 169, 200', '121', '144', '169', '200', 'D', 'advanced', 'math', 60),
('If all Bloops are Razzles and some Razzles are Lazzles, then:', 'All Bloops are Lazzles', 'Some Bloops may be Lazzles', 'No Bloops are Lazzles', 'Cannot tell', 'B', 'advanced', 'logic', 60),
('Sum 1+2+...+100 = ?', '4950', '5000', '5050', '5500', 'C', 'advanced', 'math', 60),
('In a row of 20, John is 7th from left. What position from right?', '13', '14', '15', '16', 'B', 'advanced', 'logic', 60),
('Cube has how many edges?', '6', '8', '10', '12', 'D', 'advanced', 'geometry', 60)
ON CONFLICT DO NOTHING;
