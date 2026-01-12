-- FINAL CLEANUP - Delete all remaining test data
DELETE FROM post_comments;
DELETE FROM media WHERE post_id IS NOT NULL;
DELETE FROM post_likes;
DELETE FROM reposts;
DELETE FROM bookmarks;
DELETE FROM saved_posts;
DELETE FROM posts;
DELETE FROM groups WHERE name IN ('blabla', 'Bests');

-- Reset founder data
DELETE FROM activity_logs WHERE user_id = '3c23b29d-c9e2-4495-8772-143464d08486';
DELETE FROM user_achievements WHERE user_id = '3c23b29d-c9e2-4495-8772-143464d08486';
DELETE FROM daily_rewards WHERE user_id = '3c23b29d-c9e2-4495-8772-143464d08486';
UPDATE profiles SET coins = 0, updated_at = now() WHERE id = '3c23b29d-c9e2-4495-8772-143464d08486';

-- CREATE OFFICIAL FOUNDER POST
INSERT INTO posts (user_id, content, created_at, updated_at)
VALUES (
  '3c23b29d-c9e2-4495-8772-143464d08486',
  'Vítajte v Unique – mieste, kde oslavujeme jedinečnosť každého z nás. 🌟

Naším cieľom je spojiť svet vzdelávania, obchodu a zábavy do jedného zmysluplného celku. Som hrdá, že vám môžem predstaviť platformu, ktorá vás odmeňuje za vašu aktivitu a odborný prínos.

Poďme spoločne tvoriť budúcnosť! 🚀

📚 Ako bonus si môžete stiahnuť zakladateľský e-book úplne ZADARMO – stačí kliknúť na kartu nižšie!

---

Budem rada, ak mi zanecháte vašu prvú spätnú väzbu prostredníctvom hlasového komentára nižšie! 🎙️',
  now(),
  now()
);

-- CREATE FOUNDERS E-BOOK IN BAZAAR (correct listing_type)
INSERT INTO bazaar_items (user_id, title, description, price, category, condition, location, is_active, is_sold, listing_type, created_at, updated_at)
VALUES (
  '3c23b29d-c9e2-4495-8772-143464d08486',
  'Unique Founders E-book',
  'Zakladateľský e-book platformy Unique. Zistite všetko o našej vízii, hodnotách a budúcnosti vzdelávania. ZADARMO pre všetkých používateľov!',
  0,
  'Knihy',
  'new',
  'Online',
  true,
  false,
  'sell',
  now(),
  now()
);

-- Voice comment XP reward trigger
CREATE OR REPLACE FUNCTION award_voice_comment_xp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.voice_url IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM post_comments 
      WHERE user_id = NEW.user_id 
      AND voice_url IS NOT NULL 
      AND id != NEW.id
    ) THEN
      INSERT INTO activity_logs (user_id, activity_type, points_earned, created_at)
      VALUES (NEW.user_id, 'first_voice_comment', 5, now());
      
      UPDATE profiles 
      SET coins = COALESCE(coins, 0) + 5, updated_at = now()
      WHERE id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_voice_comment_xp ON post_comments;

CREATE TRIGGER trigger_voice_comment_xp
AFTER INSERT ON post_comments
FOR EACH ROW
EXECUTE FUNCTION award_voice_comment_xp();