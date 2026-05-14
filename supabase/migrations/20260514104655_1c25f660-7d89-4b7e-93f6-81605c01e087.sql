-- Page reviews
CREATE TABLE IF NOT EXISTS public.page_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_page_reviews_page ON public.page_reviews(page_id, created_at DESC);

ALTER TABLE public.page_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read page reviews" ON public.page_reviews;
CREATE POLICY "Anyone can read page reviews"
  ON public.page_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can write own page review" ON public.page_reviews;
CREATE POLICY "Users can write own page review"
  ON public.page_reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own page review" ON public.page_reviews;
CREATE POLICY "Users can update own page review"
  ON public.page_reviews FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own page review" ON public.page_reviews;
CREATE POLICY "Users can delete own page review"
  ON public.page_reviews FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE TRIGGER trg_page_reviews_updated
BEFORE UPDATE ON public.page_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Scheduled posts column
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at
  ON public.posts(scheduled_at)
  WHERE scheduled_at IS NOT NULL;

COMMENT ON COLUMN public.posts.scheduled_at IS 'Optional future timestamp at which a cron worker should make the post publicly visible.';