-- Create questions table
CREATE TABLE public.brain_duel_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matches table
CREATE TABLE public.brain_duel_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'ready', 'in_progress', 'finished')),
  category TEXT NOT NULL,
  player1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player1_score INTEGER NOT NULL DEFAULT 0,
  player2_score INTEGER NOT NULL DEFAULT 0,
  current_question_index INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 10,
  winner_id UUID REFERENCES auth.users(id),
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create match answers table to track player answers
CREATE TABLE public.brain_duel_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.brain_duel_matches(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.brain_duel_questions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answer TEXT NOT NULL CHECK (answer IN ('a', 'b', 'c', 'd')),
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brain_duel_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_duel_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_duel_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for questions (everyone can read)
CREATE POLICY "Anyone can view questions"
  ON public.brain_duel_questions FOR SELECT
  USING (true);

-- RLS Policies for matches
CREATE POLICY "Users can view their own matches"
  ON public.brain_duel_matches FOR SELECT
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Users can insert matches"
  ON public.brain_duel_matches FOR INSERT
  WITH CHECK (auth.uid() = player1_id);

CREATE POLICY "Users can update their matches"
  ON public.brain_duel_matches FOR UPDATE
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- RLS Policies for answers
CREATE POLICY "Users can view answers in their matches"
  ON public.brain_duel_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.brain_duel_matches
      WHERE id = match_id
      AND (player1_id = auth.uid() OR player2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert their own answers"
  ON public.brain_duel_answers FOR INSERT
  WITH CHECK (auth.uid() = player_id);

-- Create indexes for better performance
CREATE INDEX idx_brain_duel_matches_status ON public.brain_duel_matches(status);
CREATE INDEX idx_brain_duel_matches_players ON public.brain_duel_matches(player1_id, player2_id);
CREATE INDEX idx_brain_duel_answers_match ON public.brain_duel_answers(match_id);

-- Insert sample questions
INSERT INTO public.brain_duel_questions (category, question, option_a, option_b, option_c, option_d, correct_answer, difficulty) VALUES
('General Knowledge', 'What is the capital of France?', 'London', 'Berlin', 'Paris', 'Madrid', 'c', 'easy'),
('General Knowledge', 'Which planet is known as the Red Planet?', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'b', 'easy'),
('Science', 'What is the chemical symbol for gold?', 'Go', 'Gd', 'Au', 'Ag', 'c', 'medium'),
('Science', 'How many bones are in the human body?', '206', '208', '210', '212', 'a', 'medium'),
('History', 'In which year did World War II end?', '1943', '1944', '1945', '1946', 'c', 'medium'),
('History', 'Who was the first president of the United States?', 'Thomas Jefferson', 'George Washington', 'John Adams', 'Benjamin Franklin', 'b', 'easy'),
('Geography', 'What is the largest ocean on Earth?', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean', 'd', 'easy'),
('Geography', 'Which country has the most natural lakes?', 'USA', 'Canada', 'Russia', 'Brazil', 'b', 'medium'),
('Sports', 'How many players are on a soccer team?', '9', '10', '11', '12', 'c', 'easy'),
('Sports', 'In which sport would you perform a slam dunk?', 'Volleyball', 'Basketball', 'Tennis', 'Baseball', 'b', 'easy'),
('Entertainment', 'Who painted the Mona Lisa?', 'Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo', 'c', 'medium'),
('Entertainment', 'Which movie won the Oscar for Best Picture in 2020?', 'Joker', '1917', 'Parasite', 'Once Upon a Time in Hollywood', 'c', 'medium'),
('Technology', 'What does CPU stand for?', 'Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Computer Processing Unit', 'a', 'easy'),
('Technology', 'Who is the founder of Microsoft?', 'Steve Jobs', 'Bill Gates', 'Mark Zuckerberg', 'Elon Musk', 'b', 'easy'),
('Mathematics', 'What is the value of Pi (π) to two decimal places?', '3.12', '3.14', '3.16', '3.18', 'b', 'easy'),
('Mathematics', 'What is the square root of 144?', '10', '11', '12', '13', 'c', 'easy'),
('Literature', 'Who wrote "Romeo and Juliet"?', 'Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain', 'b', 'easy'),
('Literature', 'Which book series features a character named Harry Potter?', 'The Chronicles of Narnia', 'Lord of the Rings', 'Harry Potter', 'Percy Jackson', 'c', 'easy'),
('Music', 'Which instrument has 88 keys?', 'Guitar', 'Violin', 'Piano', 'Drums', 'c', 'easy'),
('Music', 'Who is known as the "King of Pop"?', 'Elvis Presley', 'Michael Jackson', 'Prince', 'Freddie Mercury', 'b', 'easy');

-- Enable realtime for matches table
ALTER PUBLICATION supabase_realtime ADD TABLE public.brain_duel_matches;