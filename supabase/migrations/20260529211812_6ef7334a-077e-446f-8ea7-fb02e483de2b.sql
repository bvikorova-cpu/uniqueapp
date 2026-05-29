DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='posts_content_length_check') THEN
    ALTER TABLE public.posts ADD CONSTRAINT posts_content_length_check CHECK (content IS NULL OR char_length(content) <= 5000);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='post_comments_content_length_check') THEN
    ALTER TABLE public.post_comments ADD CONSTRAINT post_comments_content_length_check CHECK (content IS NULL OR char_length(content) <= 1000);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='reposts_comment_length_check') THEN
    ALTER TABLE public.reposts ADD CONSTRAINT reposts_comment_length_check CHECK (comment IS NULL OR char_length(comment) <= 500);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='post_reactions_type_check') THEN
    ALTER TABLE public.post_reactions ADD CONSTRAINT post_reactions_type_check CHECK (reaction_type IN ('like','love','haha','wow','sad','angry','care','fire','clap'));
  END IF;
END $$;

DELETE FROM public.reposts a USING public.reposts b
WHERE a.ctid > b.ctid AND a.user_id = b.user_id AND a.original_post_id = b.original_post_id;

CREATE UNIQUE INDEX IF NOT EXISTS reposts_user_original_unique ON public.reposts (user_id, original_post_id);