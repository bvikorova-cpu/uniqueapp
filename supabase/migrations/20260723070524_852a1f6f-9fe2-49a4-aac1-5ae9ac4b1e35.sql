
-- Keyset pagination index (created_at DESC, id DESC) for posts
CREATE INDEX IF NOT EXISTS idx_posts_feed_keyset
  ON public.posts (created_at DESC, id DESC)
  WHERE privacy IS NULL OR privacy IN ('public','friends');

CREATE INDEX IF NOT EXISTS idx_post_reactions_post_user
  ON public.post_reactions (post_id, user_id);

CREATE INDEX IF NOT EXISTS idx_post_likes_post_user
  ON public.post_likes (post_id, user_id);

-- Cursor-based feed page (keyset). Returns next page after given (created_at,id).
CREATE OR REPLACE FUNCTION public.feed_page_after(
  cursor_ts timestamptz DEFAULT NULL,
  cursor_id uuid DEFAULT NULL,
  page_size int DEFAULT 20
) RETURNS TABLE (
  id uuid,
  user_id uuid,
  content text,
  created_at timestamptz,
  likes_count int,
  comments_count int,
  shares_count int
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.user_id, p.content, p.created_at,
         COALESCE(p.likes_count,0), COALESCE(p.comments_count,0), COALESCE(p.shares_count,0)
  FROM public.posts p
  WHERE (p.privacy IS NULL OR p.privacy = 'public')
    AND (
      cursor_ts IS NULL
      OR (p.created_at, p.id) < (cursor_ts, cursor_id)
    )
  ORDER BY p.created_at DESC, p.id DESC
  LIMIT LEAST(GREATEST(page_size, 1), 50);
$$;

REVOKE ALL ON FUNCTION public.feed_page_after(timestamptz, uuid, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.feed_page_after(timestamptz, uuid, int) TO anon, authenticated;

-- Batch reactions: process up to 50 toggles in a single call
-- items: jsonb array of { post_id: uuid, reaction: text|null }
-- reaction=null means "remove any reaction/like from this post for the current user"
CREATE OR REPLACE FUNCTION public.batch_apply_reactions(items jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  item jsonb;
  post uuid;
  react text;
  processed int := 0;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '28000';
  END IF;
  IF jsonb_typeof(items) <> 'array' THEN
    RAISE EXCEPTION 'items must be a jsonb array';
  END IF;
  IF jsonb_array_length(items) > 50 THEN
    RAISE EXCEPTION 'batch too large (max 50)';
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(items) LOOP
    BEGIN
      post := (item->>'post_id')::uuid;
    EXCEPTION WHEN others THEN CONTINUE; END;
    react := NULLIF(item->>'reaction','');

    IF react IS NULL THEN
      DELETE FROM public.post_reactions WHERE post_id = post AND user_id = uid;
      DELETE FROM public.post_likes     WHERE post_id = post AND user_id = uid;
    ELSIF react = 'like' THEN
      INSERT INTO public.post_likes(post_id, user_id)
      VALUES (post, uid)
      ON CONFLICT DO NOTHING;
    ELSE
      INSERT INTO public.post_reactions(post_id, user_id, reaction_type)
      VALUES (post, uid, react)
      ON CONFLICT (post_id, user_id) DO UPDATE SET reaction_type = EXCLUDED.reaction_type;
    END IF;
    processed := processed + 1;
  END LOOP;

  RETURN jsonb_build_object('ok', true, 'processed', processed);
END;
$$;

-- Ensure the ON CONFLICT target on post_reactions exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'post_reactions_post_user_unique'
  ) THEN
    BEGIN
      ALTER TABLE public.post_reactions
        ADD CONSTRAINT post_reactions_post_user_unique UNIQUE (post_id, user_id);
    EXCEPTION WHEN duplicate_table THEN NULL;
             WHEN unique_violation THEN NULL;
    END;
  END IF;
END $$;

REVOKE ALL ON FUNCTION public.batch_apply_reactions(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.batch_apply_reactions(jsonb) TO authenticated;
