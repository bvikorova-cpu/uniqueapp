import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const GIFT_CATEGORIES = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "messages", label: "Messages", emoji: "💌" },
  { id: "emotions", label: "Emotions", emoji: "🤗" },
  { id: "flowers", label: "Flowers", emoji: "🌹" },
  { id: "romantic", label: "Romantic", emoji: "💕" },
  { id: "sweets", label: "Sweets", emoji: "🍬" },
  { id: "drinks", label: "Drinks", emoji: "🍷" },
  { id: "awards", label: "Awards", emoji: "🏆" },
  { id: "luxury", label: "Luxury", emoji: "💎" },
  { id: "special", label: "Special", emoji: "🌟" },
  { id: "mythical", label: "Mythical", emoji: "🦄" },
  { id: "vip", label: "VIP", emoji: "👑" },
];

export const GIFT_CATALOG = [
  // Messages category (5-50 credits)
  { type: "compliment", emoji: "💬", label: "Compliment", value: 5, category: "messages", description: "Send a kind word" },
  { type: "thank_you", emoji: "🙏", label: "Thank You", value: 8, category: "messages", description: "Express gratitude" },
  { type: "encouragement", emoji: "💪", label: "Encouragement", value: 10, category: "messages", description: "Motivational boost" },
  { type: "apology", emoji: "😔", label: "Apology Card", value: 15, category: "messages", description: "Say sorry" },
  { type: "love_letter", emoji: "💌", label: "Love Letter", value: 25, category: "messages", description: "AI-written love note" },
  { type: "poem", emoji: "📜", label: "Custom Poem", value: 30, category: "messages", description: "AI-generated poem" },
  { type: "birthday_wish", emoji: "🎂", label: "Birthday Wish", value: 35, category: "messages", description: "Special birthday message" },
  { type: "wedding_card", emoji: "💒", label: "Wedding Card", value: 45, category: "messages", description: "Marriage blessing" },
  { type: "graduation_card", emoji: "🎓", label: "Graduation Card", value: 40, category: "messages", description: "Celebrate achievement" },
  { type: "new_baby_card", emoji: "👶", label: "New Baby Card", value: 50, category: "messages", description: "Welcome newborn" },
  
  // Emotions category (3-60 credits)
  { type: "virtual_hug", emoji: "🤗", label: "Virtual Hug", value: 5, category: "emotions", description: "Warm embrace" },
  { type: "high_five", emoji: "✋", label: "High Five", value: 5, category: "emotions", description: "Celebrate together" },
  { type: "fist_bump", emoji: "🤜", label: "Fist Bump", value: 6, category: "emotions", description: "Casual greeting" },
  { type: "virtual_kiss", emoji: "😘", label: "Virtual Kiss", value: 8, category: "emotions", description: "Sweet kiss" },
  { type: "thumbs_up", emoji: "👍", label: "Thumbs Up", value: 4, category: "emotions", description: "Approval" },
  { type: "applause", emoji: "👏", label: "Standing Ovation", value: 12, category: "emotions", description: "Round of applause" },
  { type: "wave", emoji: "👋", label: "Friendly Wave", value: 3, category: "emotions", description: "Say hello" },
  { type: "wink", emoji: "😉", label: "Playful Wink", value: 6, category: "emotions", description: "Cheeky gesture" },
  { type: "bear_hug", emoji: "🐻", label: "Bear Hug", value: 25, category: "emotions", description: "Extra tight embrace" },
  { type: "group_hug", emoji: "🫂", label: "Group Hug", value: 35, category: "emotions", description: "Collective warmth" },
  { type: "infinite_love", emoji: "♾️", label: "Infinite Love", value: 60, category: "emotions", description: "Endless affection" },
  
  // Flowers category (7-120 credits)
  { type: "virtual_rose", emoji: "🌹", label: "Red Rose", value: 8, category: "flowers", description: "Classic beauty" },
  { type: "white_rose", emoji: "🤍", label: "White Rose", value: 8, category: "flowers", description: "Pure elegance" },
  { type: "tulip", emoji: "🌷", label: "Tulip", value: 7, category: "flowers", description: "Spring bloom" },
  { type: "sunflower", emoji: "🌻", label: "Sunflower", value: 10, category: "flowers", description: "Bright happiness" },
  { type: "bouquet", emoji: "💐", label: "Flower Bouquet", value: 20, category: "flowers", description: "Mixed arrangement" },
  { type: "orchid", emoji: "🪻", label: "Orchid", value: 25, category: "flowers", description: "Exotic beauty" },
  { type: "cherry_blossom", emoji: "🌸", label: "Cherry Blossom", value: 15, category: "flowers", description: "Delicate petals" },
  { type: "hibiscus", emoji: "🌺", label: "Hibiscus", value: 12, category: "flowers", description: "Tropical flower" },
  { type: "rose_garden", emoji: "🌹", label: "Rose Garden", value: 65, category: "flowers", description: "Hundred roses" },
  { type: "exotic_bouquet", emoji: "🪷", label: "Exotic Bouquet", value: 80, category: "flowers", description: "Rare flowers" },
  { type: "eternal_bloom", emoji: "🌼", label: "Eternal Bloom", value: 120, category: "flowers", description: "Never-fading flowers" },
  
  // Romantic category (3-200 credits)
  { type: "heart", emoji: "❤️", label: "Heart", value: 3, category: "romantic", description: "Simple love" },
  { type: "kiss", emoji: "💋", label: "Kiss Mark", value: 5, category: "romantic", description: "Loving kiss" },
  { type: "heart_balloon", emoji: "🎈", label: "Heart Balloon", value: 10, category: "romantic", description: "Floating love" },
  { type: "love_birds", emoji: "🕊️", label: "Love Doves", value: 18, category: "romantic", description: "Pair of doves" },
  { type: "cupid", emoji: "💘", label: "Cupid's Arrow", value: 25, category: "romantic", description: "Strike of love" },
  { type: "engagement_ring", emoji: "💍", label: "Promise Ring", value: 50, category: "romantic", description: "Symbol of commitment" },
  { type: "love_potion", emoji: "🧪", label: "Love Potion", value: 35, category: "romantic", description: "Magical elixir" },
  { type: "diamond_ring", emoji: "💎", label: "Diamond Ring", value: 150, category: "romantic", description: "Eternal bond" },
  { type: "moonlit_dinner", emoji: "🌙", label: "Moonlit Dinner", value: 85, category: "romantic", description: "Romantic evening" },
  { type: "paris_getaway", emoji: "🗼", label: "Paris Getaway", value: 200, category: "romantic", description: "City of love" },
  { type: "sunset_beach", emoji: "🌅", label: "Sunset Beach", value: 95, category: "romantic", description: "Romantic sunset" },
  
  // Sweets category (5-100 credits)
  { type: "chocolate", emoji: "🍫", label: "Chocolate Bar", value: 8, category: "sweets", description: "Sweet treat" },
  { type: "cake", emoji: "🎂", label: "Birthday Cake", value: 18, category: "sweets", description: "Celebration cake" },
  { type: "cupcake", emoji: "🧁", label: "Cupcake", value: 10, category: "sweets", description: "Mini delight" },
  { type: "ice_cream", emoji: "🍦", label: "Ice Cream", value: 8, category: "sweets", description: "Cool refreshment" },
  { type: "donut", emoji: "🍩", label: "Donut", value: 7, category: "sweets", description: "Glazed goodness" },
  { type: "cookie", emoji: "🍪", label: "Cookie", value: 5, category: "sweets", description: "Sweet bite" },
  { type: "lollipop", emoji: "🍭", label: "Lollipop", value: 6, category: "sweets", description: "Colorful candy" },
  { type: "candy_box", emoji: "🍬", label: "Candy Box", value: 15, category: "sweets", description: "Assorted sweets" },
  { type: "belgian_chocolate", emoji: "🍫", label: "Belgian Chocolate", value: 45, category: "sweets", description: "Premium cocoa" },
  { type: "macaron_tower", emoji: "🍥", label: "Macaron Tower", value: 65, category: "sweets", description: "French delicacy" },
  { type: "wedding_cake", emoji: "🎂", label: "Wedding Cake", value: 100, category: "sweets", description: "Multi-tier masterpiece" },
  
  // Drinks category (6-80 credits)
  { type: "coffee", emoji: "☕", label: "Coffee", value: 6, category: "drinks", description: "Morning boost" },
  { type: "tea", emoji: "🍵", label: "Green Tea", value: 6, category: "drinks", description: "Calming brew" },
  { type: "champagne", emoji: "🍾", label: "Champagne", value: 15, category: "drinks", description: "Celebration bubbles" },
  { type: "wine", emoji: "🍷", label: "Red Wine", value: 12, category: "drinks", description: "Fine vintage" },
  { type: "cocktail", emoji: "🍸", label: "Cocktail", value: 10, category: "drinks", description: "Mixed drink" },
  { type: "beer", emoji: "🍺", label: "Beer", value: 8, category: "drinks", description: "Cheers!" },
  { type: "smoothie", emoji: "🥤", label: "Smoothie", value: 8, category: "drinks", description: "Healthy blend" },
  { type: "vintage_wine", emoji: "🍷", label: "Vintage Wine", value: 55, category: "drinks", description: "1990 reserve" },
  { type: "dom_perignon", emoji: "🍾", label: "Dom Pérignon", value: 80, category: "drinks", description: "Prestige champagne" },
  { type: "royal_tea", emoji: "🫖", label: "Royal Tea Set", value: 40, category: "drinks", description: "Elegant ceremony" },
  
  // Awards category (12-250 credits)
  { type: "trophy", emoji: "🏆", label: "Trophy", value: 25, category: "awards", description: "Winner award" },
  { type: "medal", emoji: "🥇", label: "Gold Medal", value: 20, category: "awards", description: "First place" },
  { type: "silver_medal", emoji: "🥈", label: "Silver Medal", value: 15, category: "awards", description: "Second place" },
  { type: "bronze_medal", emoji: "🥉", label: "Bronze Medal", value: 12, category: "awards", description: "Third place" },
  { type: "ribbon", emoji: "🎀", label: "Award Ribbon", value: 18, category: "awards", description: "Recognition" },
  { type: "certificate", emoji: "📜", label: "Certificate", value: 30, category: "awards", description: "Achievement unlocked" },
  { type: "best_friend", emoji: "🤝", label: "Best Friend Award", value: 40, category: "awards", description: "Friendship badge" },
  { type: "mvp", emoji: "⭐", label: "MVP Award", value: 50, category: "awards", description: "Most valuable person" },
  { type: "legend", emoji: "🌟", label: "Legend Status", value: 60, category: "awards", description: "Legendary achievement" },
  { type: "hall_of_fame", emoji: "🏛️", label: "Hall of Fame", value: 120, category: "awards", description: "Immortal recognition" },
  { type: "lifetime_achievement", emoji: "🎖️", label: "Lifetime Achievement", value: 180, category: "awards", description: "Career recognition" },
  { type: "world_champion", emoji: "🌍", label: "World Champion", value: 250, category: "awards", description: "Global domination" },
  
  // Luxury category (50-1000 credits)
  { type: "diamond", emoji: "💎", label: "Diamond", value: 50, category: "luxury", description: "Precious gem" },
  { type: "gold_bar", emoji: "🥇", label: "Gold Bar", value: 75, category: "luxury", description: "Pure gold" },
  { type: "sports_car", emoji: "🏎️", label: "Sports Car", value: 100, category: "luxury", description: "Speed machine" },
  { type: "yacht", emoji: "🛥️", label: "Luxury Yacht", value: 150, category: "luxury", description: "Sea elegance" },
  { type: "mansion", emoji: "🏛️", label: "Mansion", value: 200, category: "luxury", description: "Dream home" },
  { type: "castle", emoji: "🏰", label: "Dream Castle", value: 250, category: "luxury", description: "Royal residence" },
  { type: "private_jet", emoji: "✈️", label: "Private Jet", value: 300, category: "luxury", description: "Sky luxury" },
  { type: "treasure_chest", emoji: "🧳", label: "Treasure Chest", value: 120, category: "luxury", description: "Hidden riches" },
  { type: "superyacht", emoji: "🚢", label: "Superyacht", value: 400, category: "luxury", description: "Floating palace" },
  { type: "space_station", emoji: "🛸", label: "Space Station", value: 500, category: "luxury", description: "Orbital home" },
  { type: "private_island", emoji: "🏝️", label: "Private Island", value: 650, category: "luxury", description: "Paradise retreat" },
  { type: "moon_base", emoji: "🌙", label: "Moon Base", value: 800, category: "luxury", description: "Lunar estate" },
  { type: "golden_palace", emoji: "👑", label: "Golden Palace", value: 1000, category: "luxury", description: "Ultimate luxury" },
  
  // Special category (15-300 credits)
  { type: "star", emoji: "⭐", label: "Shining Star", value: 15, category: "special", description: "Bright light" },
  { type: "rainbow", emoji: "🌈", label: "Rainbow", value: 25, category: "special", description: "Colorful arc" },
  { type: "fireworks", emoji: "🎆", label: "Fireworks", value: 30, category: "special", description: "Night celebration" },
  { type: "magic_wand", emoji: "🪄", label: "Magic Wand", value: 35, category: "special", description: "Make a wish" },
  { type: "crystal_ball", emoji: "🔮", label: "Crystal Ball", value: 40, category: "special", description: "See the future" },
  { type: "shooting_star", emoji: "🌠", label: "Shooting Star", value: 45, category: "special", description: "Wish upon a star" },
  { type: "rocket", emoji: "🚀", label: "Space Rocket", value: 80, category: "special", description: "To the moon" },
  { type: "aurora", emoji: "🌌", label: "Aurora Borealis", value: 60, category: "special", description: "Northern lights" },
  { type: "supernova", emoji: "💥", label: "Supernova", value: 150, category: "special", description: "Star explosion" },
  { type: "black_hole", emoji: "🕳️", label: "Black Hole", value: 200, category: "special", description: "Cosmic mystery" },
  { type: "galaxy", emoji: "🌀", label: "Entire Galaxy", value: 300, category: "special", description: "Billions of stars" },
  
  // Mythical category (40-500 credits)
  { type: "unicorn", emoji: "🦄", label: "Unicorn", value: 60, category: "mythical", description: "Magical creature" },
  { type: "dragon", emoji: "🐉", label: "Dragon", value: 80, category: "mythical", description: "Fire breather" },
  { type: "phoenix", emoji: "🔥", label: "Phoenix", value: 120, category: "mythical", description: "Rise from ashes" },
  { type: "mermaid", emoji: "🧜‍♀️", label: "Mermaid", value: 70, category: "mythical", description: "Ocean beauty" },
  { type: "fairy", emoji: "🧚", label: "Fairy", value: 50, category: "mythical", description: "Magical sprite" },
  { type: "genie", emoji: "🧞", label: "Genie", value: 100, category: "mythical", description: "Three wishes" },
  { type: "pegasus", emoji: "🦢", label: "Pegasus", value: 90, category: "mythical", description: "Winged horse" },
  { type: "kraken", emoji: "🦑", label: "Kraken", value: 150, category: "mythical", description: "Sea monster" },
  { type: "hydra", emoji: "🐍", label: "Hydra", value: 180, category: "mythical", description: "Multi-headed beast" },
  { type: "thunderbird", emoji: "🦅", label: "Thunderbird", value: 220, category: "mythical", description: "Storm bringer" },
  { type: "leviathan", emoji: "🐋", label: "Leviathan", value: 350, category: "mythical", description: "Ocean titan" },
  { type: "celestial_dragon", emoji: "🐲", label: "Celestial Dragon", value: 500, category: "mythical", description: "Divine creature" },
  
  // VIP category (15-800 credits)
  { type: "crown", emoji: "👑", label: "Royal Crown", value: 75, category: "vip", description: "24h profile crown" },
  { type: "super_like", emoji: "💫", label: "Super Like", value: 15, category: "vip", description: "Extra visibility" },
  { type: "priority_message", emoji: "📌", label: "Priority Message", value: 20, category: "vip", description: "Top of inbox" },
  { type: "spotlight", emoji: "🔦", label: "Spotlight", value: 50, category: "vip", description: "Featured profile" },
  { type: "vip_badge", emoji: "🏅", label: "VIP Badge", value: 100, category: "vip", description: "Elite status" },
  { type: "angel_wings", emoji: "😇", label: "Angel Wings", value: 80, category: "vip", description: "Heavenly glow" },
  { type: "king_status", emoji: "🤴", label: "King Status", value: 150, category: "vip", description: "Rule the platform" },
  { type: "queen_status", emoji: "👸", label: "Queen Status", value: 150, category: "vip", description: "Reign supreme" },
  { type: "diamond_tier", emoji: "💠", label: "Diamond Tier", value: 200, category: "vip", description: "Ultimate prestige" },
  { type: "platinum_aura", emoji: "✨", label: "Platinum Aura", value: 300, category: "vip", description: "Shimmering presence" },
  { type: "legendary_status", emoji: "🌟", label: "Legendary Status", value: 450, category: "vip", description: "Myth and legend" },
  { type: "immortal_crown", emoji: "⚜️", label: "Immortal Crown", value: 600, category: "vip", description: "Eternal royalty" },
  { type: "god_tier", emoji: "🔱", label: "God Tier", value: 800, category: "vip", description: "Divine supremacy" },
  
  // Additional gifts - Various categories and prices
  // Messages extras (10-75)
  { type: "secret_admirer", emoji: "🕵️", label: "Secret Admirer Note", value: 22, category: "messages", description: "Mystery message" },
  { type: "voice_message", emoji: "🎙️", label: "Voice Message", value: 18, category: "messages", description: "AI voice greeting" },
  { type: "video_greeting", emoji: "📹", label: "Video Greeting", value: 55, category: "messages", description: "Animated message" },
  { type: "memory_card", emoji: "📸", label: "Memory Card", value: 28, category: "messages", description: "Photo collage" },
  { type: "fortune_cookie", emoji: "🥠", label: "Fortune Cookie", value: 12, category: "messages", description: "Lucky message" },
  { type: "anniversary_card", emoji: "💞", label: "Anniversary Card", value: 42, category: "messages", description: "Celebrate years" },
  { type: "get_well_card", emoji: "🏥", label: "Get Well Card", value: 20, category: "messages", description: "Healing wishes" },
  { type: "congratulations", emoji: "🎊", label: "Congratulations", value: 32, category: "messages", description: "Celebrate success" },
  
  // Emotions extras (8-90)
  { type: "butterfly_kiss", emoji: "🦋", label: "Butterfly Kiss", value: 12, category: "emotions", description: "Gentle affection" },
  { type: "warm_smile", emoji: "😊", label: "Warm Smile", value: 8, category: "emotions", description: "Genuine happiness" },
  { type: "comfort_blanket", emoji: "🛋️", label: "Comfort Blanket", value: 18, category: "emotions", description: "Cozy feeling" },
  { type: "happy_tears", emoji: "🥹", label: "Happy Tears", value: 22, category: "emotions", description: "Joyful emotion" },
  { type: "soul_connection", emoji: "💫", label: "Soul Connection", value: 55, category: "emotions", description: "Deep bond" },
  { type: "eternal_friendship", emoji: "🤞", label: "Eternal Friendship", value: 45, category: "emotions", description: "Forever friends" },
  { type: "dancing_together", emoji: "💃", label: "Dancing Together", value: 38, category: "emotions", description: "Joy in motion" },
  { type: "heart_explosion", emoji: "💗", label: "Heart Explosion", value: 90, category: "emotions", description: "Overwhelming love" },
  
  // Flowers extras (9-150)
  { type: "daisy", emoji: "🌼", label: "Daisy", value: 9, category: "flowers", description: "Simple beauty" },
  { type: "violet", emoji: "💜", label: "Violet", value: 11, category: "flowers", description: "Purple charm" },
  { type: "lily", emoji: "🪷", label: "Water Lily", value: 18, category: "flowers", description: "Pond flower" },
  { type: "lavender", emoji: "💟", label: "Lavender Field", value: 35, category: "flowers", description: "Purple paradise" },
  { type: "bonsai", emoji: "🌳", label: "Bonsai Tree", value: 42, category: "flowers", description: "Miniature art" },
  { type: "cactus", emoji: "🌵", label: "Cute Cactus", value: 14, category: "flowers", description: "Desert beauty" },
  { type: "bamboo", emoji: "🎋", label: "Lucky Bamboo", value: 28, category: "flowers", description: "Prosperity plant" },
  { type: "botanical_garden", emoji: "🏡", label: "Botanical Garden", value: 150, category: "flowers", description: "Plant paradise" },
  
  // Romantic extras (12-350)
  { type: "love_lock", emoji: "🔐", label: "Love Lock", value: 28, category: "romantic", description: "Bridge of love" },
  { type: "heart_locket", emoji: "💝", label: "Heart Locket", value: 42, category: "romantic", description: "Photo keepsake" },
  { type: "couple_dance", emoji: "👫", label: "Couple Dance", value: 55, category: "romantic", description: "Romantic waltz" },
  { type: "starlight_kiss", emoji: "🌟", label: "Starlight Kiss", value: 65, category: "romantic", description: "Under the stars" },
  { type: "venice_gondola", emoji: "🚣", label: "Venice Gondola", value: 120, category: "romantic", description: "Italian romance" },
  { type: "northern_lights_date", emoji: "🌌", label: "Northern Lights Date", value: 180, category: "romantic", description: "Aurora romance" },
  { type: "private_beach", emoji: "🏖️", label: "Private Beach", value: 250, category: "romantic", description: "Secluded paradise" },
  { type: "world_tour", emoji: "🌍", label: "World Tour", value: 350, category: "romantic", description: "Travel together" },
  
  // Sweets extras (4-120)
  { type: "candy_heart", emoji: "💟", label: "Candy Heart", value: 4, category: "sweets", description: "Sweet message" },
  { type: "cotton_candy", emoji: "🍡", label: "Cotton Candy", value: 9, category: "sweets", description: "Fluffy treat" },
  { type: "honeycomb", emoji: "🍯", label: "Honeycomb", value: 12, category: "sweets", description: "Natural sweet" },
  { type: "tiramisu", emoji: "🍰", label: "Tiramisu", value: 22, category: "sweets", description: "Italian dessert" },
  { type: "crepe", emoji: "🥞", label: "French Crepe", value: 16, category: "sweets", description: "Thin pancake" },
  { type: "waffle", emoji: "🧇", label: "Belgian Waffle", value: 14, category: "sweets", description: "Crispy delight" },
  { type: "churros", emoji: "🥖", label: "Churros", value: 13, category: "sweets", description: "Spanish treat" },
  { type: "dessert_buffet", emoji: "🍨", label: "Dessert Buffet", value: 85, category: "sweets", description: "Unlimited sweets" },
  { type: "chocolate_fountain", emoji: "⛲", label: "Chocolate Fountain", value: 120, category: "sweets", description: "Endless chocolate" },
  
  // Drinks extras (5-120)
  { type: "bubble_tea", emoji: "🧋", label: "Bubble Tea", value: 9, category: "drinks", description: "Trendy drink" },
  { type: "hot_chocolate", emoji: "🍫", label: "Hot Chocolate", value: 8, category: "drinks", description: "Warm and cozy" },
  { type: "mojito", emoji: "🍹", label: "Mojito", value: 14, category: "drinks", description: "Fresh mint" },
  { type: "espresso", emoji: "☕", label: "Espresso", value: 5, category: "drinks", description: "Strong coffee" },
  { type: "milkshake", emoji: "🥛", label: "Milkshake", value: 11, category: "drinks", description: "Creamy blend" },
  { type: "whiskey", emoji: "🥃", label: "Fine Whiskey", value: 35, category: "drinks", description: "Aged spirit" },
  { type: "sake", emoji: "🍶", label: "Japanese Sake", value: 28, category: "drinks", description: "Rice wine" },
  { type: "wine_cellar", emoji: "🍇", label: "Wine Cellar Tour", value: 90, category: "drinks", description: "Vineyard experience" },
  { type: "champagne_tower", emoji: "🗼", label: "Champagne Tower", value: 120, category: "drinks", description: "Celebration stack" },
  
  // Awards extras (25-400)
  { type: "star_of_week", emoji: "🌟", label: "Star of the Week", value: 35, category: "awards", description: "Weekly recognition" },
  { type: "rising_star", emoji: "📈", label: "Rising Star", value: 45, category: "awards", description: "Growing talent" },
  { type: "excellence_badge", emoji: "🎯", label: "Excellence Badge", value: 55, category: "awards", description: "Top quality" },
  { type: "innovation_award", emoji: "💡", label: "Innovation Award", value: 70, category: "awards", description: "Creative genius" },
  { type: "diamond_trophy", emoji: "💎", label: "Diamond Trophy", value: 150, category: "awards", description: "Rare achievement" },
  { type: "olympic_gold", emoji: "🏅", label: "Olympic Gold", value: 200, category: "awards", description: "Champion status" },
  { type: "nobel_prize", emoji: "🏛️", label: "Nobel Prize", value: 300, category: "awards", description: "Highest honor" },
  { type: "universal_legend", emoji: "🌌", label: "Universal Legend", value: 400, category: "awards", description: "Cosmic recognition" },
  
  // Luxury extras (80-1200)
  { type: "rolex", emoji: "⌚", label: "Luxury Watch", value: 80, category: "luxury", description: "Timepiece" },
  { type: "helicopter", emoji: "🚁", label: "Helicopter Ride", value: 180, category: "luxury", description: "Sky tour" },
  { type: "penthouse", emoji: "🌆", label: "Penthouse Suite", value: 280, category: "luxury", description: "Top floor" },
  { type: "ferrari", emoji: "🚗", label: "Ferrari", value: 350, category: "luxury", description: "Italian speed" },
  { type: "royal_suite", emoji: "🛏️", label: "Royal Suite", value: 220, category: "luxury", description: "5-star luxury" },
  { type: "art_collection", emoji: "🖼️", label: "Art Collection", value: 450, category: "luxury", description: "Masterpieces" },
  { type: "mega_mansion", emoji: "🏯", label: "Mega Mansion", value: 750, category: "luxury", description: "Estate living" },
  { type: "space_trip", emoji: "🧑‍🚀", label: "Space Trip", value: 1200, category: "luxury", description: "Orbital journey" },
  
  // Special extras (20-450)
  { type: "lucky_clover", emoji: "🍀", label: "Lucky Clover", value: 20, category: "special", description: "Good fortune" },
  { type: "dream_catcher", emoji: "🪶", label: "Dream Catcher", value: 32, category: "special", description: "Sweet dreams" },
  { type: "time_capsule", emoji: "⏳", label: "Time Capsule", value: 48, category: "special", description: "Future message" },
  { type: "wishing_well", emoji: "⛲", label: "Wishing Well", value: 55, category: "special", description: "Make a wish" },
  { type: "constellation", emoji: "⭐", label: "Personal Constellation", value: 120, category: "special", description: "Named stars" },
  { type: "time_machine", emoji: "🕰️", label: "Time Machine", value: 180, category: "special", description: "Travel through time" },
  { type: "dimension_portal", emoji: "🌀", label: "Dimension Portal", value: 280, category: "special", description: "Multiverse access" },
  { type: "big_bang", emoji: "💫", label: "Big Bang", value: 450, category: "special", description: "Create a universe" },
  
  // Mythical extras (55-700)
  { type: "griffin", emoji: "🦅", label: "Griffin", value: 95, category: "mythical", description: "Eagle-lion hybrid" },
  { type: "sphinx", emoji: "🗿", label: "Sphinx", value: 110, category: "mythical", description: "Ancient riddle" },
  { type: "basilisk", emoji: "🐍", label: "Basilisk", value: 130, category: "mythical", description: "King of serpents" },
  { type: "centaur", emoji: "🏹", label: "Centaur", value: 85, category: "mythical", description: "Horse warrior" },
  { type: "cerberus", emoji: "🐕", label: "Cerberus", value: 160, category: "mythical", description: "Three-headed guard" },
  { type: "valkyrie", emoji: "⚔️", label: "Valkyrie", value: 200, category: "mythical", description: "Norse warrior" },
  { type: "world_serpent", emoji: "🌊", label: "World Serpent", value: 400, category: "mythical", description: "Jörmungandr" },
  { type: "ancient_titan", emoji: "🗻", label: "Ancient Titan", value: 550, category: "mythical", description: "Primordial power" },
  { type: "cosmic_entity", emoji: "🌠", label: "Cosmic Entity", value: 700, category: "mythical", description: "Universe guardian" },
  
  // VIP extras (30-1000)
  { type: "verified_badge", emoji: "✅", label: "Verified Badge", value: 30, category: "vip", description: "Authentic status" },
  { type: "exclusive_access", emoji: "🚪", label: "Exclusive Access", value: 65, category: "vip", description: "VIP entry" },
  { type: "diamond_frame", emoji: "💎", label: "Diamond Frame", value: 120, category: "vip", description: "Profile bling" },
  { type: "royal_treatment", emoji: "🎩", label: "Royal Treatment", value: 180, category: "vip", description: "Full VIP service" },
  { type: "celebrity_status", emoji: "🌟", label: "Celebrity Status", value: 250, category: "vip", description: "Star treatment" },
  { type: "emperor_throne", emoji: "🪑", label: "Emperor Throne", value: 400, category: "vip", description: "Rule supreme" },
  { type: "universe_ruler", emoji: "🌌", label: "Universe Ruler", value: 650, category: "vip", description: "Cosmic authority" },
  { type: "omnipotent_being", emoji: "✨", label: "Omnipotent Being", value: 1000, category: "vip", description: "Ultimate power" },
];

export const CREDIT_PACKAGES = [
  { credits: 15, price: 5, label: "Starter Pack" },
  { credits: 30, price: 8, label: "Basic Pack" },
  { credits: 50, price: 12, label: "Popular Pack", popular: true },
  { credits: 100, price: 20, label: "Value Pack" },
  { credits: 200, price: 35, label: "Pro Pack" },
  { credits: 350, price: 55, label: "Premium Pack" },
  { credits: 500, price: 75, label: "Elite Pack", bestValue: true },
  { credits: 750, price: 100, label: "Diamond Pack" },
  { credits: 1000, price: 130, label: "Platinum Pack" },
  { credits: 1500, price: 180, label: "Ultimate Pack" },
];

export const useSecretSanta = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get current user credits
  const { data: credits, isLoading: creditsLoading } = useQuery({
    queryKey: ["secret-santa-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("secret_santa_credits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Get received gifts
  const { data: receivedGifts = [], isLoading: giftsLoading } = useQuery({
    queryKey: ["secret-santa-received"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("secret_santa_gifts")
        .select("*")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Get sent gifts
  const { data: sentGifts = [], isLoading: sentLoading } = useQuery({
    queryKey: ["secret-santa-sent"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("secret_santa_gifts")
        .select("*")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Get active stories (non-expired)
  const { data: stories = [], isLoading: storiesLoading } = useQuery({
    queryKey: ["secret-santa-stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("secret_santa_stories")
        .select("*, secret_santa_gifts(*)")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Get leaderboard
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ["secret-santa-leaderboard"],
    queryFn: async () => {
      // Get all gifts and aggregate by sender
      const { data: gifts, error } = await supabase
        .from("secret_santa_gifts")
        .select("sender_id, gift_value");

      if (error) throw error;

      // Aggregate by sender
      const senderTotals: Record<string, number> = {};
      gifts?.forEach(gift => {
        senderTotals[gift.sender_id] = (senderTotals[gift.sender_id] || 0) + gift.gift_value;
      });

      // Get profiles for top senders
      const topSenders = Object.entries(senderTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", topSenders.map(([id]) => id));

      return topSenders.map(([id, total], index) => {
        const profile = (profiles || []).find((p: any) => p.id === id) as any;
        return {
          rank: index + 1,
          userId: id,
          username: profile?.full_name || "Anonymous",
          avatarUrl: profile?.avatar_url,
          totalGiftsValue: total,
        };
      });
    },
  });

  // Send gift mutation
  const sendGift = useMutation({
    mutationFn: async ({
      recipientId,
      giftType,
      message,
      isAnonymous = true,
    }: {
      recipientId: string;
      giftType: string;
      message?: string;
      isAnonymous?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const gift = GIFT_CATALOG.find(g => g.type === giftType);
      if (!gift) throw new Error("Invalid gift type");

      // Check credits
      const currentCredits = credits?.credits_remaining || 0;
      if (currentCredits < gift.value) {
        throw new Error("Not enough credits");
      }

      // Deduct credits
      const { error: creditError } = await supabase
        .from("secret_santa_credits")
        .update({ credits_remaining: currentCredits - gift.value })
        .eq("user_id", user.id);

      if (creditError) throw creditError;

      // Send gift
      const { data: giftData, error: giftError } = await supabase.from("secret_santa_gifts").insert({
        sender_id: user.id,
        recipient_id: recipientId,
        gift_type: giftType,
        gift_emoji: gift.emoji,
        gift_value: gift.value,
        message,
        is_anonymous: isAnonymous,
      }).select().single();

      if (giftError) throw giftError;

      // Get sender profile for notification
      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      // Create notification for recipient
      const senderName = isAnonymous ? "Secret Santa" : (senderProfile?.full_name || "Someone");
      await supabase.from("notifications").insert({
        user_id: recipientId,
        type: "secret_santa_gift",
        title: `${gift.emoji} New Gift Received!`,
        message: `${senderName} sent you a ${gift.label}!`,
        related_id: giftData.id,
        actor_id: isAnonymous ? null : user.id,
      });
    },
    onSuccess: () => {
      toast({ title: "Gift sent successfully! 🎁" });
      queryClient.invalidateQueries({ queryKey: ["secret-santa-credits"] });
      queryClient.invalidateQueries({ queryKey: ["secret-santa-sent"] });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  // Share to stories mutation
  const shareToStory = useMutation({
    mutationFn: async (giftId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("secret_santa_stories").insert({
        gift_id: giftId,
        user_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Shared to Gift Stories! ✨" });
      queryClient.invalidateQueries({ queryKey: ["secret-santa-stories"] });
    },
    onError: () => {
      toast({ title: "Failed to share", variant: "destructive" });
    },
  });

  return {
    credits: credits?.credits_remaining || 0,
    creditsLoading,
    receivedGifts,
    giftsLoading,
    sentGifts,
    sentLoading,
    stories,
    storiesLoading,
    leaderboard,
    leaderboardLoading,
    sendGift: sendGift.mutate,
    shareToStory: shareToStory.mutate,
    isSending: sendGift.isPending,
  };
};
