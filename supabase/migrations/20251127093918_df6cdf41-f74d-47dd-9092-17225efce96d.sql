-- Drop the old check constraint and add new one with all reaction types
ALTER TABLE post_reactions DROP CONSTRAINT IF EXISTS post_reactions_reaction_type_check;

ALTER TABLE post_reactions ADD CONSTRAINT post_reactions_reaction_type_check 
CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry'));