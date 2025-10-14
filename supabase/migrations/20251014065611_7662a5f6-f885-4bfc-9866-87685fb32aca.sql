-- Fix security warnings by setting search_path on trigger function
DROP TRIGGER IF EXISTS update_character_conversations_timestamp ON character_conversations;
DROP FUNCTION IF EXISTS update_character_conversation_timestamp();

CREATE OR REPLACE FUNCTION update_character_conversation_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_character_conversations_timestamp
  BEFORE UPDATE ON character_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_character_conversation_timestamp();