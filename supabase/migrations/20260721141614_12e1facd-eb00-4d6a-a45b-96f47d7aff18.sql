
-- 1. Story sequences catalog
CREATE TABLE IF NOT EXISTS public.kids_story_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'classic',
  difficulty TEXT NOT NULL DEFAULT 'easy',
  cover_url TEXT,
  events JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.kids_story_sequences TO anon, authenticated;
GRANT ALL ON public.kids_story_sequences TO service_role;

ALTER TABLE public.kids_story_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active story sequences"
ON public.kids_story_sequences FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins manage story sequences"
ON public.kids_story_sequences FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_kids_story_sequences_updated
BEFORE UPDATE ON public.kids_story_sequences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.kids_story_sequences (title, category, difficulty, events) VALUES
('Little Red Riding Hood', 'classic', 'easy', '[
  {"id":1,"text":"Grandma was sick","order":1},
  {"id":2,"text":"Little Red Riding Hood walked through the forest","order":2},
  {"id":3,"text":"She met the wolf in the woods","order":3},
  {"id":4,"text":"The wolf ran to Grandma''s house","order":4},
  {"id":5,"text":"The hunter saved Grandma","order":5}
]'::jsonb),
('The Three Little Pigs', 'classic', 'easy', '[
  {"id":1,"text":"Three little pigs left home to build their own houses","order":1},
  {"id":2,"text":"The first pig built a house of straw","order":2},
  {"id":3,"text":"The second pig built a house of sticks","order":3},
  {"id":4,"text":"The third pig built a house of bricks","order":4},
  {"id":5,"text":"The wolf could not blow down the brick house","order":5}
]'::jsonb),
('Goldilocks and the Three Bears', 'classic', 'easy', '[
  {"id":1,"text":"Goldilocks found an empty house in the forest","order":1},
  {"id":2,"text":"She tasted three bowls of porridge","order":2},
  {"id":3,"text":"She sat in three chairs and broke the smallest one","order":3},
  {"id":4,"text":"She fell asleep in the smallest bed","order":4},
  {"id":5,"text":"The three bears came home and found her","order":5}
]'::jsonb),
('Hansel and Gretel', 'classic', 'medium', '[
  {"id":1,"text":"Hansel and Gretel got lost in the forest","order":1},
  {"id":2,"text":"They found a house made of candy","order":2},
  {"id":3,"text":"The witch trapped Hansel in a cage","order":3},
  {"id":4,"text":"Gretel tricked the witch into the oven","order":4},
  {"id":5,"text":"They found their way back home","order":5}
]'::jsonb),
('The Tortoise and the Hare', 'fable', 'easy', '[
  {"id":1,"text":"The hare made fun of the slow tortoise","order":1},
  {"id":2,"text":"They agreed to race each other","order":2},
  {"id":3,"text":"The hare ran ahead and took a nap","order":3},
  {"id":4,"text":"The tortoise kept walking slowly and steadily","order":4},
  {"id":5,"text":"The tortoise crossed the finish line first","order":5}
]'::jsonb);

-- 2. Castle leaderboard function (real stamps)
CREATE OR REPLACE FUNCTION public.get_castle_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  stamps BIGINT,
  xp BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.user_id,
    COALESCE(p.username, p.full_name, 'Explorer') AS display_name,
    p.avatar_url,
    COUNT(DISTINCT s.castle_id) AS stamps,
    COUNT(DISTINCT s.castle_id) * 400 AS xp
  FROM public.user_castle_stamps s
  LEFT JOIN public.profiles p ON p.id = s.user_id
  GROUP BY s.user_id, p.username, p.full_name, p.avatar_url
  ORDER BY stamps DESC, xp DESC
  LIMIT GREATEST(1, LEAST(limit_count, 100));
$$;

GRANT EXECUTE ON FUNCTION public.get_castle_leaderboard(INTEGER) TO anon, authenticated;
