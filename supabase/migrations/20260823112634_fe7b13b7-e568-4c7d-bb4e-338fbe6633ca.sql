UPDATE public.rewards_cosmetic_items
SET price_xp = CASE rarity
      WHEN 'common' THEN 1500
      WHEN 'rare' THEN 4000
      WHEN 'epic' THEN 9000
      WHEN 'legendary' THEN 15000
      WHEN 'mythic' THEN 25000
      ELSE price_xp * 2 END,
    price_credits = CASE rarity
      WHEN 'common' THEN 3
      WHEN 'rare' THEN 6
      WHEN 'epic' THEN 12
      WHEN 'legendary' THEN 20
      WHEN 'mythic' THEN 30
      ELSE GREATEST(price_credits * 2, 3) END;