-- Create pages table
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  cover_image_url TEXT,
  avatar_url TEXT,
  website TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  follower_count INTEGER DEFAULT 0
);

-- Create page_followers table
CREATE TABLE IF NOT EXISTS public.page_followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  followed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(page_id, user_id)
);

-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_followers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pages
CREATE POLICY "Pages are viewable by everyone"
  ON public.pages FOR SELECT
  USING (true);

CREATE POLICY "Users can create pages"
  ON public.pages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Page creators can update their pages"
  ON public.pages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Page creators can delete their pages"
  ON public.pages FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for page_followers
CREATE POLICY "Page followers are viewable by everyone"
  ON public.page_followers FOR SELECT
  USING (true);

CREATE POLICY "Users can follow pages"
  ON public.page_followers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow pages"
  ON public.page_followers FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_page_followers_user_id ON public.page_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_page_followers_page_id ON public.page_followers(page_id);

-- Create trigger for updated_at
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();