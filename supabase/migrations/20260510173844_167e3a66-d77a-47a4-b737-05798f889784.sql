
-- 1. PERSONA
CREATE TABLE public.best_friend_persona (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  friend_name text NOT NULL DEFAULT 'Bestie',
  friend_gender text NOT NULL DEFAULT 'neutral' CHECK (friend_gender IN ('female','male','neutral')),
  personality text NOT NULL DEFAULT 'empathetic' CHECK (personality IN ('empathetic','playful','direct','witty','calm','motivational')),
  voice_id text,
  avatar_url text,
  language text NOT NULL DEFAULT 'en',
  user_nickname text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.best_friend_persona ENABLE ROW LEVEL SECURITY;
CREATE POLICY "persona_select" ON public.best_friend_persona FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "persona_insert" ON public.best_friend_persona FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "persona_update" ON public.best_friend_persona FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "persona_delete" ON public.best_friend_persona FOR DELETE USING (auth.uid() = user_id);

-- 2. MEMORIES
CREATE TABLE public.best_friend_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL DEFAULT 'fact' CHECK (category IN ('fact','person','preference','event','goal','dislike')),
  content text NOT NULL,
  importance int NOT NULL DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.best_friend_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mem_select" ON public.best_friend_memories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mem_insert" ON public.best_friend_memories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mem_update" ON public.best_friend_memories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "mem_delete" ON public.best_friend_memories FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_bf_memories_user ON public.best_friend_memories(user_id, importance DESC);

-- 3. PROGRESS / XP
CREATE TABLE public.best_friend_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  xp int NOT NULL DEFAULT 0,
  level int NOT NULL DEFAULT 1,
  current_streak int NOT NULL DEFAULT 0,
  longest_streak int NOT NULL DEFAULT 0,
  last_interaction_date date,
  total_messages int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.best_friend_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prog_select" ON public.best_friend_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "prog_insert" ON public.best_friend_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prog_update" ON public.best_friend_progress FOR UPDATE USING (auth.uid() = user_id);

-- 4. CHECK-INS
CREATE TABLE public.best_friend_check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  enabled boolean NOT NULL DEFAULT true,
  preferred_hour int NOT NULL DEFAULT 19 CHECK (preferred_hour BETWEEN 0 AND 23),
  timezone text NOT NULL DEFAULT 'UTC',
  last_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.best_friend_check_ins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ci_select" ON public.best_friend_check_ins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ci_insert" ON public.best_friend_check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ci_update" ON public.best_friend_check_ins FOR UPDATE USING (auth.uid() = user_id);

-- 5. CRISIS LOG
CREATE TABLE public.best_friend_crisis_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  matched_terms text[] NOT NULL DEFAULT '{}',
  message_excerpt text,
  acknowledged boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.best_friend_crisis_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crisis_select" ON public.best_friend_crisis_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "crisis_insert" ON public.best_friend_crisis_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "crisis_update" ON public.best_friend_crisis_events FOR UPDATE USING (auth.uid() = user_id);

-- 6. SHARED PHOTOS
CREATE TABLE public.best_friend_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  caption text,
  ai_reaction text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.best_friend_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "photo_select" ON public.best_friend_photos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "photo_insert" ON public.best_friend_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "photo_delete" ON public.best_friend_photos FOR DELETE USING (auth.uid() = user_id);

-- 7. STORAGE BUCKET for photos + avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('best-friend-media', 'best-friend-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "bf_media_select" ON storage.objects FOR SELECT USING (bucket_id = 'best-friend-media');
CREATE POLICY "bf_media_insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'best-friend-media' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "bf_media_delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'best-friend-media' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 8. UPDATED_AT triggers
CREATE TRIGGER trg_bf_persona_updated BEFORE UPDATE ON public.best_friend_persona
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bf_progress_updated BEFORE UPDATE ON public.best_friend_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
