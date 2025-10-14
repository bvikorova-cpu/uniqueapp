-- AI Characters (predefinované osobnosti)
CREATE TABLE ai_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  personality_type TEXT NOT NULL,
  avatar_url TEXT,
  description TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  voice_id TEXT,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User character subscriptions/unlocks
CREATE TABLE user_character_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  character_id UUID REFERENCES ai_characters(id) NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, character_id)
);

-- Conversations with characters
CREATE TABLE character_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  character_id UUID REFERENCES ai_characters(id) NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  summary TEXT,
  memory_context JSONB DEFAULT '{}'::jsonb
);

-- Messages in conversations
CREATE TABLE character_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES character_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Message limits for free users
CREATE TABLE user_message_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  messages_used_today INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  is_premium BOOLEAN DEFAULT false
);

-- RLS Policies
ALTER TABLE ai_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_character_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_message_limits ENABLE ROW LEVEL SECURITY;

-- Anyone can view available characters
CREATE POLICY "Anyone can view characters" ON ai_characters
  FOR SELECT USING (true);

-- Users can view their character access
CREATE POLICY "Users can view their character access" ON user_character_access
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock characters" ON user_character_access
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can manage their conversations
CREATE POLICY "Users can view their conversations" ON character_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations" ON character_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their conversations" ON character_conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can view their messages
CREATE POLICY "Users can view their messages" ON character_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM character_conversations 
      WHERE id = character_messages.conversation_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages" ON character_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM character_conversations 
      WHERE id = character_messages.conversation_id 
      AND user_id = auth.uid()
    )
  );

-- Users can view their message limits
CREATE POLICY "Users can view their limits" ON user_message_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their limits" ON user_message_limits
  FOR ALL USING (auth.uid() = user_id);

-- Insert default characters
INSERT INTO ai_characters (name, personality_type, description, system_prompt, is_premium) VALUES
('Alex - The Motivator', 'motivator', 'Your personal cheerleader who keeps you energized and focused', 'You are Alex, an enthusiastic and energetic motivator. Your goal is to inspire, encourage, and push users to achieve their goals. Use positive reinforcement, celebrate small wins, and help them overcome obstacles with determination.', false),
('Dr. Emma - Therapist', 'therapist', 'A compassionate listener who provides emotional support', 'You are Dr. Emma, a warm and empathetic therapist. Listen actively, validate emotions, ask thoughtful questions, and provide gentle guidance. Create a safe space for users to express themselves.', true),
('Max - The Comedian', 'humor', 'Brings laughter and joy to your day', 'You are Max, a witty and playful comedian. Make people laugh with clever jokes, puns, and lighthearted observations. Keep the mood fun and entertaining while being respectful.', false),
('Sophia - Romance', 'romance', 'Your charming companion for heartfelt conversations', 'You are Sophia, a romantic and affectionate companion. Be warm, caring, and emotionally engaging. Show interest in the user''s life, share thoughtful compliments, and create meaningful connections.', true),
('Professor Lee - Mentor', 'mentor', 'Wise guide for personal and professional growth', 'You are Professor Lee, an experienced mentor. Provide wisdom, ask probing questions, challenge assumptions, and guide users toward their own insights. Focus on long-term growth and development.', true);

-- Trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_character_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_character_conversations_timestamp
  BEFORE UPDATE ON character_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_character_conversation_timestamp();