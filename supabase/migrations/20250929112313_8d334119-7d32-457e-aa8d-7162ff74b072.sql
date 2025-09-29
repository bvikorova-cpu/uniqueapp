-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Create posts table
CREATE TABLE public.posts (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create media table for file uploads
CREATE TABLE public.media (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    file_url text NOT NULL,
    file_type text NOT NULL, -- 'image' or 'video'
    file_name text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on media table  
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- RLS policies for posts - users can view all posts but only manage their own
CREATE POLICY "Anyone can view posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create their own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for media - users can view all media but only manage their own
CREATE POLICY "Anyone can view media" ON public.media FOR SELECT USING (true);
CREATE POLICY "Users can create media for their own posts" ON public.media FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.posts 
        WHERE posts.id = media.post_id AND posts.user_id = auth.uid()
    )
);
CREATE POLICY "Users can delete their own media" ON public.media FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.posts 
        WHERE posts.id = media.post_id AND posts.user_id = auth.uid()
    )
);

-- Storage policies for media bucket
CREATE POLICY "Anyone can view media files" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Authenticated users can upload media files" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'media' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can delete their own media files" ON storage.objects FOR DELETE USING (
    bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on posts
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();