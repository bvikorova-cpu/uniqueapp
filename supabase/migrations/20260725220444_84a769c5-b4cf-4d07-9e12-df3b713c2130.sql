
-- Fix Starter box icon (was brown square)
UPDATE public.mystery_boxes SET icon = '🎉' WHERE name = 'Starter Mystery Box';

-- Add per-item emoji icons into item_data so UI can render proper visuals
UPDATE public.mystery_box_items SET item_data = COALESCE(item_data, '{}'::jsonb) || jsonb_build_object('icon',
  CASE item_name
    WHEN 'Confetti Burst' THEN '🎉'
    WHEN 'Flower Frame' THEN '🌸'
    WHEN 'Newcomer Badge' THEN '🔰'
    WHEN 'Pastel Glow' THEN '🌷'
    WHEN 'Neon Outline' THEN '💡'
    WHEN 'Silver Frame' THEN '🥈'
    WHEN 'Lucky Star' THEN '⭐'
    WHEN 'Golden Sparkle Aura' THEN '✨'
    WHEN 'Sparkle Filter' THEN '✨'
    WHEN 'Vintage Filter' THEN '📷'
    WHEN 'Neon Glow' THEN '💫'
    WHEN 'Cool Frame' THEN '🖼️'
    WHEN 'Aurora Effect' THEN '🌈'
    WHEN 'Golden Frame' THEN '🥇'
    WHEN 'Dark Galaxy Theme' THEN '🌌'
    WHEN 'Rainbow Filter' THEN '🌈'
    WHEN 'Cosmic Effect' THEN '☄️'
    WHEN 'VIP Badge' THEN '👑'
    ELSE
      CASE item_type
        WHEN 'filter' THEN '🎨'
        WHEN 'effect' THEN '✨'
        WHEN 'badge' THEN '🏅'
        WHEN 'avatar' THEN '🖼️'
        WHEN 'theme' THEN '🎭'
        ELSE '🎁'
      END
  END
);
