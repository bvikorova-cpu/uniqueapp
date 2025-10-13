-- Create function to activate a theme (deactivates others)
CREATE OR REPLACE FUNCTION activate_user_theme(p_user_id uuid, p_theme_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Deactivate all themes for this user
  UPDATE user_premium_themes
  SET is_active = false
  WHERE user_id = p_user_id;
  
  -- Activate the selected theme
  UPDATE user_premium_themes
  SET is_active = true
  WHERE user_id = p_user_id AND theme_id = p_theme_id;
END;
$$;

-- Add theme_data column to store theme colors/config
ALTER TABLE premium_themes
ADD COLUMN IF NOT EXISTS theme_data jsonb DEFAULT '{
  "primary": "262 83% 58%",
  "background": "0 0% 100%",
  "foreground": "240 10% 3.9%"
}'::jsonb;

-- Update themes with actual color schemes
UPDATE premium_themes 
SET theme_data = '{
  "primary": "271 81% 56%",
  "background": "270 50% 5%",
  "foreground": "270 20% 98%"
}'::jsonb
WHERE name = 'Royal Purple';

UPDATE premium_themes 
SET theme_data = '{
  "primary": "199 89% 48%",
  "background": "200 100% 97%",
  "foreground": "200 50% 10%"
}'::jsonb
WHERE name = 'Ocean Blue';

UPDATE premium_themes 
SET theme_data = '{
  "primary": "24 95% 53%",
  "background": "33 100% 96%",
  "foreground": "20 14% 4%"
}'::jsonb
WHERE name = 'Sunset Orange';

UPDATE premium_themes 
SET theme_data = '{
  "primary": "142 71% 45%",
  "background": "138 76% 97%",
  "foreground": "140 40% 10%"
}'::jsonb
WHERE name = 'Forest Green';

UPDATE premium_themes 
SET theme_data = '{
  "primary": "217 33% 17%",
  "background": "222 47% 11%",
  "foreground": "210 40% 98%"
}'::jsonb
WHERE name = 'Midnight Dark';

UPDATE premium_themes 
SET theme_data = '{
  "primary": "43 96% 56%",
  "background": "48 100% 96%",
  "foreground": "20 14% 4%"
}'::jsonb
WHERE name = 'Golden Luxury';