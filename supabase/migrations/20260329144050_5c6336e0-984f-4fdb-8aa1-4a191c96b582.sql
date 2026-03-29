CREATE TABLE IF NOT EXISTS public.masterchef_recipe_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  image_url text,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.masterchef_recipe_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read recipe posts" ON public.masterchef_recipe_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own posts" ON public.masterchef_recipe_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);