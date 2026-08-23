INSERT INTO public.rewards_cosmetic_items (slug, category, name, description, rarity, preview_url, price_xp, price_credits, is_premium)
VALUES
 ('frame_rose_petal','avatar_frame','Rose Petal Frame','Soft rose glow around your avatar','common','🌸',1500,3,false),
 ('frame_emerald_vine','avatar_frame','Emerald Vine Frame','Living emerald ring','rare','🌿',4000,6,false),
 ('frame_royal_crown','avatar_frame','Royal Crown Frame','Regal gold radiance','epic','👑',9000,12,false),
 ('frame_obsidian_flame','avatar_frame','Obsidian Flame Frame','Dark stone with burning edge','legendary','🌋',15000,20,true),
 ('frame_galactic_mythic','avatar_frame','Galactic Halo','Slowly rotating cosmic halo','mythic','🪐',25000,30,true),
 ('name_ocean_ink','name_color','Ocean Ink','Deep blue gradient name','common','🖊️',1500,3,false),
 ('name_lava_flow','name_color','Lava Flow','Molten red-orange name','rare','🔥',4000,6,false),
 ('name_neon_cyber','name_color','Neon Cyber','Glowing magenta neon name','epic','🕹️',9000,12,false),
 ('name_royal_amethyst','name_color','Royal Amethyst','Purple royal gradient','legendary','🔮',15000,20,true),
 ('name_starlight_mythic','name_color','Starlight','Shifting starlight gradient','mythic','⭐',25000,30,true),
 ('theme_cherry_blossom','profile_theme','Cherry Blossom','Soft pink spring theme','common','🌸',1500,3,false),
 ('theme_forest_mist','profile_theme','Forest Mist','Green forest gradient','rare','🌲',4000,6,false),
 ('theme_desert_dune','profile_theme','Desert Dune','Warm sand gradient','epic','🏜️',9000,12,false),
 ('theme_neon_tokyo','profile_theme','Neon Tokyo','Cyberpunk night city','legendary','🌃',15000,20,true),
 ('theme_aurora_mythic','profile_theme','Aurora Nights','Northern lights over deep night','mythic','🌌',25000,30,true),
 ('border_frost_crystal','animated_border','Frost Crystal','Icy shimmering border','common','❄️',1500,3,false),
 ('border_toxic_glow','animated_border','Toxic Glow','Pulsing radioactive edge','rare','☢️',4000,6,false),
 ('border_royal_gold','animated_border','Royal Gold','Polished gold gradient border','epic','🏅',9000,12,false),
 ('border_shadow_smoke','animated_border','Shadow Smoke','Dark smoky aura','legendary','🌫️',15000,20,true),
 ('border_celestial_mythic','animated_border','Celestial Ring','Rotating celestial ring','mythic','✨',25000,30,true)
ON CONFLICT (slug) DO NOTHING;