
-- Add 100+ new achievements for more motivation
INSERT INTO public.achievements (code, name, description, icon, points) VALUES
-- Social achievements
('social_butterfly_1', 'Spoločenský motýľ I', 'Získaj 10 followerov', '🦋', 10),
('social_butterfly_2', 'Spoločenský motýľ II', 'Získaj 50 followerov', '🦋', 25),
('social_butterfly_3', 'Spoločenský motýľ III', 'Získaj 100 followerov', '🦋', 50),
('social_butterfly_4', 'Spoločenský motýľ IV', 'Získaj 500 followerov', '🦋', 100),
('social_butterfly_5', 'Spoločenský motýľ V', 'Získaj 1000 followerov', '🦋', 200),

-- Posting achievements
('content_creator_1', 'Tvorca obsahu I', 'Vytvor 5 príspevkov', '📝', 5),
('content_creator_2', 'Tvorca obsahu II', 'Vytvor 25 príspevkov', '📝', 15),
('content_creator_3', 'Tvorca obsahu III', 'Vytvor 50 príspevkov', '📝', 30),
('content_creator_4', 'Tvorca obsahu IV', 'Vytvor 100 príspevkov', '📝', 60),
('content_creator_5', 'Tvorca obsahu V', 'Vytvor 500 príspevkov', '📝', 150),

-- Like achievements
('like_magnet_1', 'Magnet lajkov I', 'Získaj 10 lajkov', '❤️', 5),
('like_magnet_2', 'Magnet lajkov II', 'Získaj 50 lajkov', '❤️', 15),
('like_magnet_3', 'Magnet lajkov III', 'Získaj 100 lajkov', '❤️', 30),
('like_magnet_4', 'Magnet lajkov IV', 'Získaj 500 lajkov', '❤️', 75),
('like_magnet_5', 'Magnet lajkov V', 'Získaj 1000 lajkov', '❤️', 150),

-- Comment achievements
('commentator_1', 'Komentátor I', 'Napíš 10 komentárov', '💬', 5),
('commentator_2', 'Komentátor II', 'Napíš 50 komentárov', '💬', 15),
('commentator_3', 'Komentátor III', 'Napíš 100 komentárov', '💬', 30),
('commentator_4', 'Komentátor IV', 'Napíš 500 komentárov', '💬', 75),
('commentator_5', 'Komentátor V', 'Napíš 1000 komentárov', '💬', 150),

-- Streak achievements
('streak_warrior_1', 'Bojovník streak I', '3 dni aktivity v rade', '🔥', 10),
('streak_warrior_2', 'Bojovník streak II', '7 dní aktivity v rade', '🔥', 25),
('streak_warrior_3', 'Bojovník streak III', '14 dní aktivity v rade', '🔥', 50),
('streak_warrior_4', 'Bojovník streak IV', '30 dní aktivity v rade', '🔥', 100),
('streak_warrior_5', 'Bojovník streak V', '100 dní aktivity v rade', '🔥', 300),

-- Photo achievements
('photographer_1', 'Fotograf I', 'Nahraj 5 fotiek', '📸', 5),
('photographer_2', 'Fotograf II', 'Nahraj 25 fotiek', '📸', 15),
('photographer_3', 'Fotograf III', 'Nahraj 50 fotiek', '📸', 30),
('photographer_4', 'Fotograf IV', 'Nahraj 100 fotiek', '📸', 60),
('photographer_5', 'Fotograf V', 'Nahraj 500 fotiek', '📸', 150),

-- Video achievements
('videographer_1', 'Kameraman I', 'Nahraj 3 videá', '🎬', 10),
('videographer_2', 'Kameraman II', 'Nahraj 10 videí', '🎬', 25),
('videographer_3', 'Kameraman III', 'Nahraj 25 videí', '🎬', 50),
('videographer_4', 'Kameraman IV', 'Nahraj 50 videí', '🎬', 100),
('videographer_5', 'Kameraman V', 'Nahraj 100 videí', '🎬', 200),

-- Share achievements
('sharer_1', 'Zdieľač I', 'Zdieľaj 5 príspevkov', '🔄', 5),
('sharer_2', 'Zdieľač II', 'Zdieľaj 25 príspevkov', '🔄', 15),
('sharer_3', 'Zdieľač III', 'Zdieľaj 50 príspevkov', '🔄', 30),
('sharer_4', 'Zdieľač IV', 'Zdieľaj 100 príspevkov', '🔄', 60),
('sharer_5', 'Zdieľač V', 'Zdieľaj 500 príspevkov', '🔄', 150),

-- Profile achievements
('profile_master_1', 'Majster profilu I', 'Vyplň 50% profilu', '👤', 5),
('profile_master_2', 'Majster profilu II', 'Vyplň 75% profilu', '👤', 15),
('profile_master_3', 'Majster profilu III', 'Vyplň 100% profilu', '👤', 30),
('profile_verified', 'Overený používateľ', 'Získaj overenie profilu', '✅', 100),

-- Time-based achievements
('early_riser_1', 'Ranné vtáča I', '10 príspevkov pred 7:00', '🌅', 10),
('early_riser_2', 'Ranné vtáča II', '50 príspevkov pred 7:00', '🌅', 30),
('early_riser_3', 'Ranné vtáča III', '100 príspevkov pred 7:00', '🌅', 60),
('night_poster_1', 'Nočný tvorca I', '10 príspevkov po 23:00', '🌙', 10),
('night_poster_2', 'Nočný tvorca II', '50 príspevkov po 23:00', '🌙', 30),
('night_poster_3', 'Nočný tvorca III', '100 príspevkov po 23:00', '🌙', 60),

-- Weekend achievements
('weekend_warrior_1', 'Víkendový bojovník I', '10 príspevkov cez víkend', '🎉', 10),
('weekend_warrior_2', 'Víkendový bojovník II', '50 príspevkov cez víkend', '🎉', 30),
('weekend_warrior_3', 'Víkendový bojovník III', '100 príspevkov cez víkend', '🎉', 60),

-- Engagement achievements
('engaging_1', 'Zapájač I', 'Získaj 10 odpovedí', '💡', 10),
('engaging_2', 'Zapájač II', 'Získaj 50 odpovedí', '💡', 25),
('engaging_3', 'Zapájač III', 'Získaj 100 odpovedí', '💡', 50),
('engaging_4', 'Zapájač IV', 'Získaj 500 odpovedí', '💡', 100),
('engaging_5', 'Zapájač V', 'Získaj 1000 odpovedí', '💡', 200),

-- Viral achievements
('viral_1', 'Virálny I', 'Príspevok s 50+ lajkami', '🚀', 25),
('viral_2', 'Virálny II', 'Príspevok s 100+ lajkami', '🚀', 50),
('viral_3', 'Virálny III', 'Príspevok s 500+ lajkami', '🚀', 150),
('viral_4', 'Virálny IV', 'Príspevok s 1000+ lajkami', '🚀', 300),
('viral_5', 'Virálny V', 'Príspevok s 5000+ lajkami', '🚀', 500),

-- Following achievements
('follower_1', 'Sledovateľ I', 'Sleduj 10 ľudí', '👁️', 5),
('follower_2', 'Sledovateľ II', 'Sleduj 50 ľudí', '👁️', 15),
('follower_3', 'Sledovateľ III', 'Sleduj 100 ľudí', '👁️', 30),
('follower_4', 'Sledovateľ IV', 'Sleduj 500 ľudí', '👁️', 60),
('follower_5', 'Sledovateľ V', 'Sleduj 1000 ľudí', '👁️', 120),

-- Daily login achievements
('daily_login_1', 'Denný návštevník I', 'Prihlás sa 7 dní', '📅', 10),
('daily_login_2', 'Denný návštevník II', 'Prihlás sa 30 dní', '📅', 30),
('daily_login_3', 'Denný návštevník III', 'Prihlás sa 100 dní', '📅', 100),
('daily_login_4', 'Denný návštevník IV', 'Prihlás sa 365 dní', '📅', 365),

-- XP achievements
('xp_hunter_1', 'Lovec XP I', 'Získaj 100 XP', '⭐', 10),
('xp_hunter_2', 'Lovec XP II', 'Získaj 500 XP', '⭐', 25),
('xp_hunter_3', 'Lovec XP III', 'Získaj 1000 XP', '⭐', 50),
('xp_hunter_4', 'Lovec XP IV', 'Získaj 5000 XP', '⭐', 100),
('xp_hunter_5', 'Lovec XP V', 'Získaj 10000 XP', '⭐', 200),

-- Level achievements
('level_up_1', 'Level Up I', 'Dosiahni level 5', '🎮', 10),
('level_up_2', 'Level Up II', 'Dosiahni level 10', '🎮', 25),
('level_up_3', 'Level Up III', 'Dosiahni level 25', '🎮', 50),
('level_up_4', 'Level Up IV', 'Dosiahni level 50', '🎮', 100),
('level_up_5', 'Level Up V', 'Dosiahni level 100', '🎮', 250),

-- Badge collector
('badge_collector_1', 'Zberateľ odznakov I', 'Získaj 5 odznakov', '🏅', 10),
('badge_collector_2', 'Zberateľ odznakov II', 'Získaj 25 odznakov', '🏅', 30),
('badge_collector_3', 'Zberateľ odznakov III', 'Získaj 50 odznakov', '🏅', 60),
('badge_collector_4', 'Zberateľ odznakov IV', 'Získaj 100 odznakov', '🏅', 150),
('badge_collector_5', 'Zberateľ odznakov V', 'Získaj 250 odznakov', '🏅', 400),

-- Reaction achievements
('reactor_1', 'Reaktor I', 'Daj 50 reakcií', '😊', 5),
('reactor_2', 'Reaktor II', 'Daj 200 reakcií', '😊', 15),
('reactor_3', 'Reaktor III', 'Daj 500 reakcií', '😊', 30),
('reactor_4', 'Reaktor IV', 'Daj 1000 reakcií', '😊', 60),
('reactor_5', 'Reaktor V', 'Daj 5000 reakcií', '😊', 150),

-- First achievements
('first_post', 'Prvý príspevok', 'Vytvor svoj prvý príspevok', '🎯', 5),
('first_like', 'Prvý lajk', 'Daj svoj prvý lajk', '❤️', 2),
('first_comment', 'Prvý komentár', 'Napíš svoj prvý komentár', '💬', 3),
('first_follow', 'Prvé sledovanie', 'Sleduj prvého človeka', '👁️', 2),
('first_share', 'Prvé zdieľanie', 'Zdieľaj prvý príspevok', '🔄', 3),

-- Milestone achievements  
('milestone_100', 'Míľnik 100', 'Získaj 100 interakcií', '🏆', 25),
('milestone_500', 'Míľnik 500', 'Získaj 500 interakcií', '🏆', 75),
('milestone_1000', 'Míľnik 1000', 'Získaj 1000 interakcií', '🏆', 150),
('milestone_5000', 'Míľnik 5000', 'Získaj 5000 interakcií', '🏆', 400),
('milestone_10000', 'Míľnik 10000', 'Získaj 10000 interakcií', '🏆', 1000),

-- Special achievements
('trendsetter', 'Trendsetter', 'Vytvor virálny trend', '✨', 200),
('influencer', 'Influencer', 'Dosiahni 10000 followerov', '👑', 500),
('legend', 'Legenda', 'Buď aktívny 1 rok', '🌟', 1000),
('pioneer', 'Priekopník', 'Jeden z prvých používateľov', '🚀', 100),
('helper', 'Pomocník', 'Pomôž 100 ľuďom', '🤝', 75),

-- Video watching achievements
('video_watcher_1', 'Sledovač videí I', 'Pozri 10 video reklám', '📺', 10),
('video_watcher_2', 'Sledovač videí II', 'Pozri 50 video reklám', '📺', 30),
('video_watcher_3', 'Sledovač videí III', 'Pozri 100 video reklám', '📺', 60),
('video_watcher_4', 'Sledovač videí IV', 'Pozri 500 video reklám', '📺', 150),
('video_watcher_5', 'Sledovač videí V', 'Pozri 1000 video reklám', '📺', 300)

ON CONFLICT (code) DO NOTHING;
