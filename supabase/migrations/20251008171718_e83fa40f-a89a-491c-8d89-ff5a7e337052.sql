-- Add foreign key to forum_posts table to reference profiles
ALTER TABLE public.forum_posts
ADD CONSTRAINT forum_posts_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;