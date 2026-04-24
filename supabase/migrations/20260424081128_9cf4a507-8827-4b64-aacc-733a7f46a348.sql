
-- 1. Fix profile_voice_intros: restrict SELECT to owner only
DROP POLICY IF EXISTS "Voice intros publicly readable" ON public.profile_voice_intros;
DROP POLICY IF EXISTS "view voice intros" ON public.profile_voice_intros;

CREATE POLICY "Users can view their own voice intros"
  ON public.profile_voice_intros FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Fix destination_reviews: replace current_setting() with auth.uid()
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.destination_reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.destination_reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.destination_reviews;

CREATE POLICY "Authenticated users can create reviews"
  ON public.destination_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.destination_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.destination_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Realtime channel authorization: restrict topic subscriptions
-- Allow authenticated users to subscribe only to topics they own (user:<uid>)
-- or to public topics (those starting with 'public:')
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read own user topics" ON realtime.messages;
CREATE POLICY "Authenticated can read own user topics"
  ON realtime.messages FOR SELECT
  TO authenticated
  USING (
    realtime.topic() LIKE 'public:%'
    OR realtime.topic() = ('user:' || auth.uid()::text)
    OR realtime.topic() LIKE ('user:' || auth.uid()::text || ':%')
  );

DROP POLICY IF EXISTS "Authenticated can write own user topics" ON realtime.messages;
CREATE POLICY "Authenticated can write own user topics"
  ON realtime.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    realtime.topic() LIKE 'public:%'
    OR realtime.topic() = ('user:' || auth.uid()::text)
    OR realtime.topic() LIKE ('user:' || auth.uid()::text || ':%')
  );
