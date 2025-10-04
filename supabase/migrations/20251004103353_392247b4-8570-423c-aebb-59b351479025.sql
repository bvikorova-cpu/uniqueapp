-- Create videos table
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create video_likes table
CREATE TABLE public.video_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(video_id, user_id)
);

-- Create video_comments table
CREATE TABLE public.video_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_follows table
CREATE TABLE public.user_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Enable Row Level Security
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for videos
CREATE POLICY "Anyone can view active videos"
ON public.videos
FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can create videos"
ON public.videos
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
ON public.videos
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
ON public.videos
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for video_likes
CREATE POLICY "Anyone can view likes"
ON public.video_likes
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can like videos"
ON public.video_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
ON public.video_likes
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for video_comments
CREATE POLICY "Anyone can view comments"
ON public.video_comments
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create comments"
ON public.video_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.video_comments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.video_comments
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for user_follows
CREATE POLICY "Anyone can view follows"
ON public.user_follows
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can follow others"
ON public.user_follows
FOR INSERT
WITH CHECK (auth.uid() = follower_id AND follower_id != following_id);

CREATE POLICY "Users can unfollow"
ON public.user_follows
FOR DELETE
USING (auth.uid() = follower_id);

-- Create indexes for better performance
CREATE INDEX idx_videos_user ON public.videos(user_id);
CREATE INDEX idx_videos_created ON public.videos(created_at DESC);
CREATE INDEX idx_video_likes_video ON public.video_likes(video_id);
CREATE INDEX idx_video_likes_user ON public.video_likes(user_id);
CREATE INDEX idx_video_comments_video ON public.video_comments(video_id);
CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows(following_id);

-- Create trigger to update updated_at on videos
CREATE TRIGGER update_videos_updated_at
BEFORE UPDATE ON public.videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to update updated_at on video_comments
CREATE TRIGGER update_video_comments_updated_at
BEFORE UPDATE ON public.video_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update video likes count
CREATE OR REPLACE FUNCTION public.update_video_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.videos
    SET likes_count = likes_count + 1
    WHERE id = NEW.video_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.videos
    SET likes_count = likes_count - 1
    WHERE id = OLD.video_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_video_likes_count_trigger
AFTER INSERT OR DELETE ON public.video_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_video_likes_count();

-- Create function to update video comments count
CREATE OR REPLACE FUNCTION public.update_video_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.videos
    SET comments_count = comments_count + 1
    WHERE id = NEW.video_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.videos
    SET comments_count = comments_count - 1
    WHERE id = OLD.video_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_video_comments_count_trigger
AFTER INSERT OR DELETE ON public.video_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_video_comments_count();

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for videos bucket
CREATE POLICY "Anyone can view videos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can upload videos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'videos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own videos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'videos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own videos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'videos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Enable realtime for videos and comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_comments;