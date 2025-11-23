-- Post Collections
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'post_collections') THEN
    CREATE TABLE public.post_collections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      is_public BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    ALTER TABLE public.post_collections ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own collections" ON public.post_collections FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can view public collections" ON public.post_collections FOR SELECT USING (is_public = true);
    CREATE POLICY "Users can create their own collections" ON public.post_collections FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own collections" ON public.post_collections FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own collections" ON public.post_collections FOR DELETE USING (auth.uid() = user_id);
    
    CREATE INDEX idx_post_collections_user_id ON public.post_collections(user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'collection_posts') THEN
    CREATE TABLE public.collection_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      collection_id UUID NOT NULL REFERENCES public.post_collections(id) ON DELETE CASCADE,
      post_id UUID NOT NULL,
      added_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(collection_id, post_id)
    );
    ALTER TABLE public.collection_posts ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their collection posts" ON public.collection_posts FOR SELECT 
      USING (EXISTS (SELECT 1 FROM public.post_collections WHERE id = collection_posts.collection_id AND (user_id = auth.uid() OR is_public = true)));
    CREATE POLICY "Users can add posts to their collections" ON public.collection_posts FOR INSERT 
      WITH CHECK (EXISTS (SELECT 1 FROM public.post_collections WHERE id = collection_posts.collection_id AND user_id = auth.uid()));
    CREATE POLICY "Users can remove posts from their collections" ON public.collection_posts FOR DELETE 
      USING (EXISTS (SELECT 1 FROM public.post_collections WHERE id = collection_posts.collection_id AND user_id = auth.uid()));
    
    CREATE INDEX idx_collection_posts_collection_id ON public.collection_posts(collection_id);
    CREATE INDEX idx_collection_posts_post_id ON public.collection_posts(post_id);
  END IF;
END $$;

-- Post Shares
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'post_shares') THEN
    CREATE TABLE public.post_shares (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id UUID NOT NULL,
      user_id UUID NOT NULL,
      share_type TEXT NOT NULL CHECK (share_type IN ('profile', 'message', 'external', 'story')),
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Anyone can view post shares" ON public.post_shares FOR SELECT USING (true);
    CREATE POLICY "Authenticated users can share posts" ON public.post_shares FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE INDEX idx_post_shares_post_id ON public.post_shares(post_id);
    CREATE INDEX idx_post_shares_user_id ON public.post_shares(user_id);
  END IF;
END $$;

-- Post Collaborators
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'post_collaborators') THEN
    CREATE TABLE public.post_collaborators (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id UUID NOT NULL,
      user_id UUID NOT NULL,
      role TEXT DEFAULT 'contributor' CHECK (role IN ('owner', 'editor', 'contributor')),
      invited_at TIMESTAMPTZ DEFAULT now(),
      accepted_at TIMESTAMPTZ,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
      UNIQUE(post_id, user_id)
    );
    ALTER TABLE public.post_collaborators ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Anyone can view post collaborators" ON public.post_collaborators FOR SELECT USING (true);
    CREATE POLICY "Users can be invited as collaborators" ON public.post_collaborators FOR INSERT WITH CHECK (true);
    CREATE POLICY "Users can update their collaboration status" ON public.post_collaborators FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can remove themselves as collaborators" ON public.post_collaborators FOR DELETE USING (auth.uid() = user_id);
    
    CREATE INDEX idx_post_collaborators_post_id ON public.post_collaborators(post_id);
    CREATE INDEX idx_post_collaborators_user_id ON public.post_collaborators(user_id);
  END IF;
END $$;

-- Post Drafts
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'post_drafts') THEN
    CREATE TABLE public.post_drafts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      content TEXT NOT NULL,
      media_urls TEXT[],
      metadata JSONB,
      last_edited TIMESTAMPTZ DEFAULT now(),
      created_at TIMESTAMPTZ DEFAULT now()
    );
    ALTER TABLE public.post_drafts ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own post drafts" ON public.post_drafts FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can create their own post drafts" ON public.post_drafts FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own post drafts" ON public.post_drafts FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own post drafts" ON public.post_drafts FOR DELETE USING (auth.uid() = user_id);
    
    CREATE INDEX idx_post_drafts_user_id ON public.post_drafts(user_id);
  END IF;
END $$;