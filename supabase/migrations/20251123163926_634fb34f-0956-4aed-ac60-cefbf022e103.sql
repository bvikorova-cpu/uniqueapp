-- Create IQ questions table
CREATE TABLE IF NOT EXISTS iq_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  category TEXT NOT NULL,
  time_limit INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE iq_questions ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read questions
CREATE POLICY "Questions are viewable by authenticated users"
  ON iq_questions FOR SELECT
  TO authenticated
  USING (true);

-- Seed questions for Daily competitions (beginner level)
INSERT INTO iq_questions (question, option_a, option_b, option_c, option_d, correct_answer, difficulty, category, time_limit) VALUES
('What number should come next in this sequence? 2, 4, 8, 16, __', '20', '24', '28', '32', 'D', 'beginner', 'patterns', 60),
('If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are definitely Lazzies?', 'True', 'False', 'Maybe', 'Cannot determine', 'A', 'beginner', 'logic', 60),
('Which word does not belong? Apple, Banana, Car, Orange', 'Apple', 'Banana', 'Car', 'Orange', 'C', 'beginner', 'classification', 60),
('What is 15% of 200?', '20', '25', '30', '35', 'C', 'beginner', 'math', 60),
('Complete the analogy: Hand is to Glove as Foot is to __', 'Ankle', 'Shoe', 'Leg', 'Toe', 'B', 'beginner', 'analogy', 60),
('Which number is the odd one out? 3, 5, 7, 9, 12', '3', '5', '9', '12', 'D', 'beginner', 'patterns', 60),
('If you rearrange the letters "CIFAIPC" you would have the name of a(n):', 'City', 'Animal', 'Ocean', 'Country', 'C', 'beginner', 'anagrams', 60),
('What comes next? Circle, Square, Triangle, Circle, Square, __', 'Circle', 'Square', 'Triangle', 'Pentagon', 'C', 'beginner', 'patterns', 60),
('Book is to Reading as Fork is to:', 'Drawing', 'Writing', 'Stirring', 'Eating', 'D', 'beginner', 'analogy', 60),
('How many months have 28 days?', 'One', 'Two', 'Twelve', 'None', 'C', 'beginner', 'logic', 60),
('What is the next number? 1, 4, 9, 16, 25, __', '30', '35', '36', '49', 'C', 'beginner', 'patterns', 60),
('Which is the heaviest? 1kg of feathers or 1kg of stones?', 'Feathers', 'Stones', 'Same weight', 'Cannot determine', 'C', 'beginner', 'logic', 60),
('Complete the series: A, C, E, G, __', 'H', 'I', 'J', 'K', 'B', 'beginner', 'patterns', 60),
('If 5 cats can catch 5 mice in 5 minutes, how many cats does it take to catch 100 mice in 100 minutes?', '5', '10', '20', '100', 'A', 'beginner', 'math', 60),
('Which word is the opposite of "generous"?', 'Kind', 'Selfish', 'Helpful', 'Friendly', 'B', 'beginner', 'vocabulary', 60);

-- Seed questions for Weekly competitions (intermediate level)
INSERT INTO iq_questions (question, option_a, option_b, option_c, option_d, correct_answer, difficulty, category, time_limit) VALUES
('What is the next number in the Fibonacci sequence? 1, 1, 2, 3, 5, 8, __', '11', '12', '13', '14', 'C', 'intermediate', 'patterns', 90),
('If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?', '5 minutes', '10 minutes', '20 minutes', '100 minutes', 'A', 'intermediate', 'logic', 90),
('Which number logically follows? 7, 14, 21, 28, __', '32', '35', '42', '49', 'B', 'intermediate', 'patterns', 90),
('A bat and ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?', '10 cents', '5 cents', '15 cents', '20 cents', 'B', 'intermediate', 'math', 90),
('If all A are B, and some B are C, then some A are definitely C?', 'True', 'False', 'Maybe', 'Insufficient information', 'D', 'intermediate', 'logic', 90),
('What is the missing number? 2, 6, 12, 20, 30, __', '40', '42', '44', '48', 'B', 'intermediate', 'patterns', 90),
('Which word completes the analogy? Painter is to Brush as Surgeon is to __', 'Hospital', 'Scalpel', 'Patient', 'Operation', 'B', 'intermediate', 'analogy', 90),
('In a certain code, COMPUTER is written as RFUVQNPC. How is KEYBOARD written?', 'LHZBNPEW', 'LFYCQBPX', 'MHZCQCPY', 'LFZBQAPW', 'A', 'intermediate', 'coding', 90),
('If 3x + 7 = 22, what is the value of x?', '3', '4', '5', '6', 'C', 'intermediate', 'math', 90),
('Which is the odd one out? Square, Rectangle, Triangle, Parallelogram', 'Square', 'Rectangle', 'Triangle', 'Parallelogram', 'C', 'intermediate', 'classification', 90),
('Continue the pattern: 1, 3, 6, 10, 15, __', '18', '19', '20', '21', 'D', 'intermediate', 'patterns', 90),
('Mary is 24 years old. She is twice as old as Ann was when Mary was as old as Ann is now. How old is Ann?', '12', '16', '18', '20', 'C', 'intermediate', 'logic', 90),
('What number should replace the question mark? 3, 7, 15, 31, ?', '63', '64', '65', '66', 'A', 'intermediate', 'patterns', 90),
('If you have a 3-liter jug and a 5-liter jug, how can you measure exactly 4 liters?', 'Impossible', 'Fill 5L, pour into 3L', 'Fill both jugs', 'Fill 3L twice', 'B', 'intermediate', 'logic', 90),
('Which comes next in the series? Z, Y, X, W, V, __', 'U', 'T', 'S', 'R', 'A', 'intermediate', 'patterns', 90);

-- Seed questions for Premium competitions (expert level)
INSERT INTO iq_questions (question, option_a, option_b, option_c, option_d, correct_answer, difficulty, category, time_limit) VALUES
('What is the next prime number after 97?', '99', '101', '103', '107', 'B', 'expert', 'math', 120),
('In a family of 6 persons A, B, C, D, E and F, there are two married couples. D is grandmother of A and mother of B. C is wife of B and mother of F. F is the granddaughter of D. Who is the husband of D?', 'A', 'B', 'C', 'E', 'D', 'expert', 'logic', 120),
('What is the missing number in this sequence? 2, 3, 5, 7, 11, 13, 17, __', '19', '21', '23', '25', 'A', 'expert', 'patterns', 120),
('If you write down all the numbers from 1 to 100, how many times will you write the digit 1?', '11', '19', '20', '21', 'C', 'expert', 'math', 120),
('A clock shows 3:00. What is the angle between the hour and minute hands?', '60 degrees', '75 degrees', '90 degrees', '105 degrees', 'C', 'expert', 'geometry', 120),
('What is the value of x? x^2 - 5x + 6 = 0', '2 or 3', '1 or 6', '-2 or -3', '0 or 5', 'A', 'expert', 'algebra', 120),
('In a certain language, if RAINBOW is coded as GVRMYLD, how would you code FLOWERS?', 'UOLDVGH', 'UQMDVGH', 'UOLDWHG', 'UQMDWHG', 'A', 'expert', 'coding', 120),
('How many ways can you arrange the letters in the word "STATISTICS"?', '50,400', '100,800', '201,600', '403,200', 'A', 'expert', 'probability', 120),
('If 5 people can complete a job in 12 days, and 3 people can do it in 20 days, how many days would it take 8 people?', '7.5', '8', '9', '10', 'A', 'expert', 'logic', 120),
('What is the next number? 1, 11, 21, 1211, 111221, __', '312211', '321211', '213211', '231211', 'A', 'expert', 'patterns', 120),
('A train travels from A to B at 60 mph and returns at 40 mph. What is its average speed?', '48 mph', '50 mph', '52 mph', '54 mph', 'A', 'expert', 'math', 120),
('In how many ways can you select 3 items from a set of 10 items?', '60', '90', '120', '720', 'C', 'expert', 'combinatorics', 120),
('What is the 10th term in the sequence where an = n^2 - n?', '80', '90', '100', '110', 'B', 'expert', 'patterns', 120),
('If log₂(x) = 5, what is x?', '10', '16', '25', '32', 'D', 'expert', 'algebra', 120),
('A sphere has a radius of 5cm. What is its volume? (Use π ≈ 3.14)', '392.5 cm³', '418.7 cm³', '523.3 cm³', '654.2 cm³', 'C', 'expert', 'geometry', 120);

-- Create function to get random questions for test/competition
CREATE OR REPLACE FUNCTION get_random_questions(
  p_difficulty TEXT,
  p_count INTEGER
)
RETURNS SETOF iq_questions
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM iq_questions
  WHERE difficulty = p_difficulty
  ORDER BY RANDOM()
  LIMIT p_count;
$$;