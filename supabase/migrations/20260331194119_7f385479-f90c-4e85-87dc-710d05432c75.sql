CREATE TABLE IF NOT EXISTS public.comedy_open_mic (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.comedy_open_mic ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read open mic performances"
  ON public.comedy_open_mic FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Users can insert own performances"
  ON public.comedy_open_mic FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update votes"
  ON public.comedy_open_mic FOR UPDATE
  TO authenticated USING (true);