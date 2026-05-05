import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { characterImages } from "@/data/characterImages";

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
  { id: "disney", label: "Disney", emoji: "🏰" },
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
  
  // Disney characters (10-500 credits) - with real character images
  { type: "elsa", emoji: "❄️", label: "Elsa", value: 45, category: "disney", description: "Ice Queen magic", image: characterImages.elsa },
  { type: "anna", emoji: "🧡", label: "Anna", value: 40, category: "disney", description: "Brave princess", image: characterImages.anna },
  { type: "olaf", emoji: "⛄", label: "Olaf", value: 25, category: "disney", description: "Warm hugs", image: characterImages.olaf },
  { type: "moana", emoji: "🌊", label: "Moana", value: 50, category: "disney", description: "Ocean voyager", image: characterImages.moana },
  { type: "simba", emoji: "🦁", label: "Simba", value: 55, category: "disney", description: "Lion King", image: characterImages.simba },
  { type: "nemo", emoji: "🐠", label: "Nemo", value: 30, category: "disney", description: "Little fish", image: characterImages.nemo },
  { type: "dory", emoji: "🐟", label: "Dory", value: 35, category: "disney", description: "Just keep swimming", image: characterImages.dory },
  { type: "woody", emoji: "🤠", label: "Woody", value: 45, category: "disney", description: "Cowboy friend", image: characterImages.woody },
  { type: "buzz", emoji: "🚀", label: "Buzz Lightyear", value: 50, category: "disney", description: "To infinity!", image: characterImages.buzz },
  { type: "mickey", emoji: "🐭", label: "Mickey Mouse", value: 60, category: "disney", description: "Disney icon", image: characterImages.mickey },
  { type: "minnie", emoji: "🎀", label: "Minnie Mouse", value: 55, category: "disney", description: "Polka dot queen" },
  { type: "donald", emoji: "🦆", label: "Donald Duck", value: 40, category: "disney", description: "Feathered friend" },
  { type: "goofy", emoji: "🐕", label: "Goofy", value: 35, category: "disney", description: "Silly pal" },
  { type: "pluto", emoji: "🐶", label: "Pluto", value: 30, category: "disney", description: "Loyal pup" },
  { type: "ariel", emoji: "🧜‍♀️", label: "Ariel", value: 65, category: "disney", description: "Little Mermaid", image: characterImages.ariel },
  { type: "belle", emoji: "📖", label: "Belle", value: 60, category: "disney", description: "Beauty & wisdom", image: characterImages.belle },
  { type: "cinderella", emoji: "👠", label: "Cinderella", value: 55, category: "disney", description: "Glass slipper", image: characterImages.cinderella },
  { type: "rapunzel", emoji: "💇‍♀️", label: "Rapunzel", value: 50, category: "disney", description: "Golden hair", image: characterImages.rapunzel },
  { type: "jasmine", emoji: "🧞", label: "Jasmine", value: 55, category: "disney", description: "Arabian princess", image: characterImages.jasmine },
  { type: "mulan", emoji: "⚔️", label: "Mulan", value: 60, category: "disney", description: "Warrior princess", image: characterImages.mulan },
  { type: "tiana", emoji: "🐸", label: "Tiana", value: 50, category: "disney", description: "Princess & frog", image: characterImages.tiana },
  { type: "merida", emoji: "🏹", label: "Merida", value: 55, category: "disney", description: "Brave archer", image: characterImages.merida },
  { type: "pocahontas", emoji: "🍂", label: "Pocahontas", value: 50, category: "disney", description: "Colors of wind" },
  { type: "aladdin", emoji: "🪔", label: "Aladdin", value: 45, category: "disney", description: "Street rat hero", image: characterImages.aladdin },
  { type: "genie", emoji: "🧞‍♂️", label: "Genie", value: 80, category: "disney", description: "3 wishes granted", image: characterImages.genie },
  { type: "stitch", emoji: "👽", label: "Stitch", value: 70, category: "disney", description: "Ohana means family" },
  { type: "dumbo", emoji: "🐘", label: "Dumbo", value: 40, category: "disney", description: "Flying elephant" },
  { type: "bambi", emoji: "🦌", label: "Bambi", value: 35, category: "disney", description: "Forest prince" },
  { type: "tinkerbell", emoji: "🧚", label: "Tinker Bell", value: 45, category: "disney", description: "Pixie dust", image: characterImages.tinkerbell },
  { type: "peter_pan", emoji: "🪶", label: "Peter Pan", value: 50, category: "disney", description: "Never grow up" },
  { type: "alice", emoji: "🐇", label: "Alice", value: 45, category: "disney", description: "Wonderland" },
  { type: "snow_white", emoji: "🍎", label: "Snow White", value: 50, category: "disney", description: "Fairest of all" },
  { type: "sleeping_beauty", emoji: "🌹", label: "Aurora", value: 55, category: "disney", description: "Sleeping Beauty" },
  { type: "pinocchio", emoji: "🪵", label: "Pinocchio", value: 35, category: "disney", description: "Real boy wish" },
  { type: "baloo", emoji: "🐻", label: "Baloo", value: 40, category: "disney", description: "Bare necessities" },
  { type: "mowgli", emoji: "🌴", label: "Mowgli", value: 35, category: "disney", description: "Jungle boy" },
  { type: "tarzan", emoji: "🦍", label: "Tarzan", value: 45, category: "disney", description: "King of jungle" },
  { type: "hercules", emoji: "💪", label: "Hercules", value: 65, category: "disney", description: "Zero to hero" },
  { type: "maui", emoji: "🪝", label: "Maui", value: 70, category: "disney", description: "You're welcome" },
  { type: "hades", emoji: "🔥", label: "Hades", value: 75, category: "disney", description: "Lord of dead" },
  { type: "maleficent", emoji: "🐉", label: "Maleficent", value: 80, category: "disney", description: "Mistress of evil" },
  { type: "ursula", emoji: "🐙", label: "Ursula", value: 70, category: "disney", description: "Sea witch" },
  { type: "scar", emoji: "🦁", label: "Scar", value: 65, category: "disney", description: "Be prepared" },
  { type: "cruella", emoji: "🐕‍🦺", label: "Cruella", value: 60, category: "disney", description: "Fashion villain" },
  { type: "ratatouille", emoji: "🐀", label: "Remy", value: 45, category: "disney", description: "Chef rat" },
  { type: "wall_e", emoji: "🤖", label: "WALL-E", value: 55, category: "disney", description: "Love robot" },
  { type: "eve", emoji: "🌱", label: "EVE", value: 50, category: "disney", description: "Plant finder" },
  { type: "monsters_inc", emoji: "👹", label: "Sulley", value: 55, category: "disney", description: "Big blue monster" },
  { type: "mike", emoji: "👁️", label: "Mike Wazowski", value: 45, category: "disney", description: "One-eyed wonder" },
  { type: "incredibles", emoji: "🦸", label: "Mr. Incredible", value: 60, category: "disney", description: "Super strength" },
  { type: "elastigirl", emoji: "🦸‍♀️", label: "Elastigirl", value: 60, category: "disney", description: "Stretch hero" },
  { type: "frozone", emoji: "🧊", label: "Frozone", value: 55, category: "disney", description: "Ice cool" },
  
  // WAVE 3 - 50 more gifts
  // Messages wave 3 (6-85)
  { type: "friendship_letter", emoji: "📨", label: "Friendship Letter", value: 16, category: "messages", description: "BFF message" },
  { type: "holiday_card", emoji: "🎄", label: "Holiday Card", value: 24, category: "messages", description: "Seasonal greetings" },
  { type: "valentine_card", emoji: "💌", label: "Valentine Card", value: 38, category: "messages", description: "Love day special" },
  { type: "mother_day_card", emoji: "👩", label: "Mother's Day Card", value: 35, category: "messages", description: "For mom" },
  { type: "father_day_card", emoji: "👨", label: "Father's Day Card", value: 35, category: "messages", description: "For dad" },
  { type: "ai_song_dedication", emoji: "🎵", label: "AI Song Dedication", value: 85, category: "messages", description: "Custom melody" },
  
  // Emotions wave 3 (7-110)
  { type: "gentle_pat", emoji: "🤚", label: "Gentle Pat", value: 7, category: "emotions", description: "Comforting touch" },
  { type: "proud_moment", emoji: "🥲", label: "Proud Moment", value: 28, category: "emotions", description: "Proud of you" },
  { type: "belly_laugh", emoji: "😂", label: "Belly Laugh", value: 15, category: "emotions", description: "Hilarious moment" },
  { type: "mind_meld", emoji: "🧠", label: "Mind Meld", value: 65, category: "emotions", description: "Telepathic bond" },
  { type: "spiritual_hug", emoji: "🕊️", label: "Spiritual Hug", value: 48, category: "emotions", description: "Soul embrace" },
  { type: "love_overload", emoji: "💖", label: "Love Overload", value: 110, category: "emotions", description: "Maximum affection" },
  
  // Flowers wave 3 (6-180)
  { type: "clover_field", emoji: "☘️", label: "Clover Field", value: 22, category: "flowers", description: "Irish luck" },
  { type: "rose_gold", emoji: "🌹", label: "Rose Gold Bouquet", value: 95, category: "flowers", description: "Premium roses" },
  { type: "japanese_garden", emoji: "🏯", label: "Japanese Garden", value: 130, category: "flowers", description: "Zen paradise" },
  { type: "wildflower_meadow", emoji: "🌾", label: "Wildflower Meadow", value: 75, category: "flowers", description: "Natural beauty" },
  { type: "enchanted_forest", emoji: "🌲", label: "Enchanted Forest", value: 180, category: "flowers", description: "Magical woodland" },
  { type: "lotus", emoji: "🪷", label: "Sacred Lotus", value: 45, category: "flowers", description: "Spiritual bloom" },
  
  // Romantic wave 3 (8-500)
  { type: "first_date", emoji: "🍿", label: "First Date Memory", value: 32, category: "romantic", description: "Nostalgic moment" },
  { type: "love_story_book", emoji: "📖", label: "Love Story Book", value: 58, category: "romantic", description: "Our story" },
  { type: "couples_spa", emoji: "🧖", label: "Couples Spa", value: 95, category: "romantic", description: "Relaxation duo" },
  { type: "hot_air_balloon", emoji: "🎈", label: "Hot Air Balloon", value: 145, category: "romantic", description: "Sky romance" },
  { type: "maldives_escape", emoji: "🏝️", label: "Maldives Escape", value: 320, category: "romantic", description: "Island paradise" },
  { type: "aurora_proposal", emoji: "💍", label: "Aurora Proposal", value: 500, category: "romantic", description: "Dream proposal" },
  
  // Sweets wave 3 (3-150)
  { type: "gummy_bears", emoji: "🐻", label: "Gummy Bears", value: 6, category: "sweets", description: "Chewy fun" },
  { type: "baklava", emoji: "🥮", label: "Baklava", value: 18, category: "sweets", description: "Honey layers" },
  { type: "mochi", emoji: "🍡", label: "Mochi", value: 14, category: "sweets", description: "Japanese treat" },
  { type: "croissant", emoji: "🥐", label: "Croissant", value: 11, category: "sweets", description: "French pastry" },
  { type: "swiss_chocolate", emoji: "🍫", label: "Swiss Chocolate Box", value: 65, category: "sweets", description: "Alpine quality" },
  { type: "dessert_island", emoji: "🏝️", label: "Dessert Island", value: 150, category: "sweets", description: "Sweet paradise" },
  
  // Drinks wave 3 (7-150)
  { type: "matcha", emoji: "🍵", label: "Matcha Latte", value: 10, category: "drinks", description: "Green energy" },
  { type: "irish_coffee", emoji: "☕", label: "Irish Coffee", value: 16, category: "drinks", description: "Whiskey blend" },
  { type: "pina_colada", emoji: "🍹", label: "Piña Colada", value: 18, category: "drinks", description: "Tropical mix" },
  { type: "cognac", emoji: "🥃", label: "Fine Cognac", value: 65, category: "drinks", description: "French brandy" },
  { type: "champagne_cellar", emoji: "🍾", label: "Champagne Cellar", value: 150, category: "drinks", description: "Bubbly heaven" },
  { type: "craft_beer_set", emoji: "🍻", label: "Craft Beer Set", value: 32, category: "drinks", description: "Artisan brews" },
  
  // Awards wave 3 (28-550)
  { type: "hero_medal", emoji: "🦸", label: "Hero Medal", value: 75, category: "awards", description: "Heroic deed" },
  { type: "genius_award", emoji: "🧠", label: "Genius Award", value: 95, category: "awards", description: "Brilliant mind" },
  { type: "heart_of_gold", emoji: "💛", label: "Heart of Gold", value: 65, category: "awards", description: "Kind soul" },
  { type: "inspiration_trophy", emoji: "💪", label: "Inspiration Trophy", value: 88, category: "awards", description: "You inspire" },
  { type: "eternal_flame", emoji: "🔥", label: "Eternal Flame Award", value: 350, category: "awards", description: "Undying passion" },
  { type: "galaxy_champion", emoji: "🌌", label: "Galaxy Champion", value: 550, category: "awards", description: "Intergalactic winner" },
  
  // Luxury wave 3 (90-1500)
  { type: "lamborghini", emoji: "🏎️", label: "Lamborghini", value: 420, category: "luxury", description: "Italian beast" },
  { type: "dubai_tower", emoji: "🏙️", label: "Dubai Penthouse", value: 550, category: "luxury", description: "Sky high living" },
  { type: "gold_helicopter", emoji: "🚁", label: "Gold Helicopter", value: 380, category: "luxury", description: "Flying gold" },
  { type: "diamond_yacht", emoji: "💎", label: "Diamond Yacht", value: 900, category: "luxury", description: "Floating jewel" },
  { type: "mars_colony", emoji: "🔴", label: "Mars Colony", value: 1500, category: "luxury", description: "Red planet home" },
  { type: "billionaire_bundle", emoji: "💰", label: "Billionaire Bundle", value: 1200, category: "luxury", description: "Everything luxury" },
  
  // Special wave 3 (25-600)
  { type: "magic_mirror", emoji: "🪞", label: "Magic Mirror", value: 42, category: "special", description: "Enchanted reflection" },
  { type: "infinity_stone", emoji: "💎", label: "Infinity Stone", value: 250, category: "special", description: "Cosmic power" },
  { type: "philosophers_stone", emoji: "🔶", label: "Philosopher's Stone", value: 350, category: "special", description: "Alchemy magic" },
  { type: "parallel_universe", emoji: "🌀", label: "Parallel Universe", value: 400, category: "special", description: "Alternate reality" },
  { type: "multiverse_key", emoji: "🗝️", label: "Multiverse Key", value: 600, category: "special", description: "Access all realities" },
  { type: "quantum_entanglement", emoji: "⚛️", label: "Quantum Entanglement", value: 180, category: "special", description: "Connected forever" },
  
  // Mythical wave 3 (65-900)
  { type: "chimera", emoji: "🦁", label: "Chimera", value: 145, category: "mythical", description: "Triple beast" },
  { type: "minotaur", emoji: "🐂", label: "Minotaur", value: 115, category: "mythical", description: "Labyrinth guardian" },
  { type: "banshee", emoji: "👻", label: "Banshee", value: 100, category: "mythical", description: "Spirit wail" },
  { type: "fenrir", emoji: "🐺", label: "Fenrir", value: 280, category: "mythical", description: "Giant wolf" },
  { type: "ragnarok", emoji: "⚡", label: "Ragnarök", value: 650, category: "mythical", description: "End times" },
  { type: "primordial_chaos", emoji: "🌑", label: "Primordial Chaos", value: 900, category: "mythical", description: "Before creation" },
  
  // VIP wave 3 (35-1500)
  { type: "influencer_badge", emoji: "📱", label: "Influencer Badge", value: 45, category: "vip", description: "Social star" },
  { type: "golden_halo", emoji: "😇", label: "Golden Halo", value: 95, category: "vip", description: "Divine glow" },
  { type: "supreme_crown", emoji: "👑", label: "Supreme Crown", value: 350, category: "vip", description: "Above all" },
  { type: "galactic_emperor", emoji: "🌌", label: "Galactic Emperor", value: 800, category: "vip", description: "Rule the galaxy" },
  { type: "reality_bender", emoji: "🌀", label: "Reality Bender", value: 1200, category: "vip", description: "Shape existence" },
  { type: "supreme_being", emoji: "🔆", label: "Supreme Being", value: 1500, category: "vip", description: "Beyond comprehension" },
  
  // WAVE 4 - Final 50 gifts
  // Messages wave 4 (5-100)
  { type: "easter_card", emoji: "🐰", label: "Easter Card", value: 22, category: "messages", description: "Spring wishes" },
  { type: "new_year_card", emoji: "🎆", label: "New Year Card", value: 28, category: "messages", description: "Fresh start" },
  { type: "halloween_card", emoji: "🎃", label: "Halloween Card", value: 20, category: "messages", description: "Spooky greetings" },
  { type: "sympathy_card", emoji: "🕯️", label: "Sympathy Card", value: 25, category: "messages", description: "Comfort in loss" },
  { type: "ai_story", emoji: "📚", label: "AI Story", value: 75, category: "messages", description: "Custom tale" },
  { type: "secret_confession", emoji: "🤫", label: "Secret Confession", value: 45, category: "messages", description: "Hidden truth" },
  { type: "bucket_list_card", emoji: "📋", label: "Bucket List Card", value: 38, category: "messages", description: "Dream together" },
  
  // Emotions wave 4 (5-130)
  { type: "silent_support", emoji: "🤝", label: "Silent Support", value: 18, category: "emotions", description: "I'm here" },
  { type: "nostalgic_moment", emoji: "📷", label: "Nostalgic Moment", value: 32, category: "emotions", description: "Remember when" },
  { type: "victory_dance", emoji: "🕺", label: "Victory Dance", value: 25, category: "emotions", description: "Celebrate win" },
  { type: "zen_peace", emoji: "🧘", label: "Zen Peace", value: 42, category: "emotions", description: "Inner calm" },
  { type: "cosmic_love", emoji: "🌌", label: "Cosmic Love", value: 85, category: "emotions", description: "Universal bond" },
  { type: "unconditional_love", emoji: "💗", label: "Unconditional Love", value: 130, category: "emotions", description: "Pure devotion" },
  
  // Flowers wave 4 (8-220)
  { type: "peony", emoji: "🌺", label: "Peony", value: 16, category: "flowers", description: "Romantic bloom" },
  { type: "magnolia", emoji: "🌸", label: "Magnolia", value: 22, category: "flowers", description: "Noble flower" },
  { type: "greenhouse", emoji: "🏡", label: "Private Greenhouse", value: 120, category: "flowers", description: "Year-round garden" },
  { type: "flower_crown", emoji: "👑", label: "Flower Crown", value: 35, category: "flowers", description: "Floral tiara" },
  { type: "secret_garden", emoji: "🚪", label: "Secret Garden", value: 220, category: "flowers", description: "Hidden paradise" },
  
  // Romantic wave 4 (15-650)
  { type: "love_song", emoji: "🎶", label: "Love Song", value: 48, category: "romantic", description: "Our melody" },
  { type: "picnic_date", emoji: "🧺", label: "Picnic Date", value: 32, category: "romantic", description: "Park romance" },
  { type: "castle_wedding", emoji: "🏰", label: "Castle Wedding", value: 450, category: "romantic", description: "Fairytale event" },
  { type: "eternal_vow", emoji: "📜", label: "Eternal Vow", value: 280, category: "romantic", description: "Forever promise" },
  { type: "honeymoon_cruise", emoji: "🚢", label: "Honeymoon Cruise", value: 380, category: "romantic", description: "Ocean romance" },
  { type: "stars_named", emoji: "⭐", label: "Star Named After Us", value: 650, category: "romantic", description: "Celestial tribute" },
  
  // Sweets wave 4 (5-180)
  { type: "brownie", emoji: "🍫", label: "Fudge Brownie", value: 9, category: "sweets", description: "Chocolate heaven" },
  { type: "pancakes", emoji: "🥞", label: "Pancake Stack", value: 12, category: "sweets", description: "Breakfast treat" },
  { type: "cheesecake", emoji: "🍰", label: "Cheesecake", value: 18, category: "sweets", description: "Creamy delight" },
  { type: "candy_store", emoji: "🏪", label: "Candy Store", value: 95, category: "sweets", description: "Sweet shop" },
  { type: "willy_wonka", emoji: "🏭", label: "Chocolate Factory", value: 180, category: "sweets", description: "Wonka experience" },
  
  // Drinks wave 4 (8-180)
  { type: "kombucha", emoji: "🫖", label: "Kombucha", value: 12, category: "drinks", description: "Probiotic drink" },
  { type: "margarita", emoji: "🍹", label: "Margarita", value: 16, category: "drinks", description: "Salt rimmed" },
  { type: "wine_yacht", emoji: "🛥️", label: "Wine Tasting Yacht", value: 180, category: "drinks", description: "Luxury sipping" },
  { type: "speakeasy", emoji: "🚪", label: "Speakeasy Entry", value: 55, category: "drinks", description: "Secret bar" },
  
  // Awards wave 4 (40-750)
  { type: "kindness_award", emoji: "🤗", label: "Kindness Award", value: 58, category: "awards", description: "Pure heart" },
  { type: "courage_medal", emoji: "🦁", label: "Courage Medal", value: 72, category: "awards", description: "Brave soul" },
  { type: "wisdom_crown", emoji: "🦉", label: "Wisdom Crown", value: 110, category: "awards", description: "Sage advice" },
  { type: "universe_creator", emoji: "🌌", label: "Universe Creator", value: 750, category: "awards", description: "God-like honor" },
  
  // Luxury wave 4 (120-2000)
  { type: "bugatti", emoji: "🏎️", label: "Bugatti", value: 680, category: "luxury", description: "Ultimate supercar" },
  { type: "undersea_hotel", emoji: "🐠", label: "Undersea Hotel", value: 450, category: "luxury", description: "Ocean suite" },
  { type: "orbital_wedding", emoji: "💒", label: "Orbital Wedding", value: 1800, category: "luxury", description: "Space ceremony" },
  { type: "entire_planet", emoji: "🪐", label: "Entire Planet", value: 2000, category: "luxury", description: "Your own world" },
  
  // Special wave 4 (30-800)
  { type: "good_karma", emoji: "🔄", label: "Good Karma", value: 35, category: "special", description: "Positive energy" },
  { type: "serendipity", emoji: "🎲", label: "Serendipity", value: 55, category: "special", description: "Happy accident" },
  { type: "destiny_thread", emoji: "🧵", label: "Destiny Thread", value: 145, category: "special", description: "Fate connection" },
  { type: "reality_stone", emoji: "🔴", label: "Reality Stone", value: 380, category: "special", description: "Alter existence" },
  { type: "omniscience", emoji: "👁️", label: "Omniscience", value: 800, category: "special", description: "Know everything" },
  
  // Mythical wave 4 (75-1200)
  { type: "kitsune", emoji: "🦊", label: "Kitsune", value: 125, category: "mythical", description: "Nine-tailed fox" },
  { type: "selkie", emoji: "🦭", label: "Selkie", value: 95, category: "mythical", description: "Seal spirit" },
  { type: "yggdrasil", emoji: "🌳", label: "Yggdrasil", value: 450, category: "mythical", description: "World tree" },
  { type: "odin_wisdom", emoji: "👁️", label: "Odin's Wisdom", value: 550, category: "mythical", description: "Allfather knowledge" },
  { type: "creation_power", emoji: "✨", label: "Creation Power", value: 1200, category: "mythical", description: "Make worlds" },
  
  // VIP wave 4 (50-2500)
  { type: "platinum_wings", emoji: "🦅", label: "Platinum Wings", value: 280, category: "vip", description: "Flying elite" },
  { type: "time_lord", emoji: "⏰", label: "Time Lord Status", value: 550, category: "vip", description: "Control time" },
  { type: "dimension_emperor", emoji: "🌀", label: "Dimension Emperor", value: 950, category: "vip", description: "Rule dimensions" },
  { type: "absolute_god", emoji: "⚡", label: "Absolute God", value: 2000, category: "vip", description: "Supreme deity" },
  { type: "infinity_itself", emoji: "♾️", label: "Infinity Itself", value: 2500, category: "vip", description: "Boundless power" },

  // MARVEL HEROES with images
  { type: "spider-man", emoji: "🕷️", label: "Spider-Man", value: 45, category: "disney", description: "Friendly neighborhood hero", image: characterImages["spider-man"] },
  { type: "iron-man", emoji: "🤖", label: "Iron Man", value: 65, category: "disney", description: "Genius billionaire", image: characterImages["iron-man"] },
  { type: "captain-america", emoji: "🛡️", label: "Captain America", value: 55, category: "disney", description: "First Avenger", image: characterImages["captain-america"] },
  { type: "black-panther", emoji: "🐆", label: "Black Panther", value: 70, category: "disney", description: "King of Wakanda", image: characterImages["black-panther"] },
  { type: "hulk", emoji: "💪", label: "Hulk", value: 50, category: "disney", description: "Incredible strength", image: characterImages["hulk"] },
  { type: "thor", emoji: "⚡", label: "Thor", value: 60, category: "disney", description: "God of Thunder", image: characterImages["thor"] },
  { type: "black-widow", emoji: "🕷️", label: "Black Widow", value: 48, category: "disney", description: "Super spy", image: characterImages["black-widow"] },
  { type: "captain-marvel", emoji: "⭐", label: "Captain Marvel", value: 68, category: "disney", description: "Cosmic hero", image: characterImages["captain-marvel"] },
  { type: "ant-man", emoji: "🐜", label: "Ant-Man", value: 42, category: "disney", description: "Size-changing hero", image: characterImages["ant-man"] },
  { type: "doctor-strange", emoji: "🔮", label: "Doctor Strange", value: 75, category: "disney", description: "Sorcerer Supreme", image: characterImages["doctor-strange"] },

  // DC HEROES with images
  { type: "batman", emoji: "🦇", label: "Batman", value: 70, category: "disney", description: "Dark Knight", image: characterImages["batman"] },
  { type: "superman", emoji: "💪", label: "Superman", value: 65, category: "disney", description: "Man of Steel", image: characterImages["superman"] },
  { type: "wonder-woman", emoji: "⭐", label: "Wonder Woman", value: 68, category: "disney", description: "Amazon Princess", image: characterImages["wonder-woman"] },
  { type: "flash", emoji: "⚡", label: "The Flash", value: 55, category: "disney", description: "Fastest man alive", image: characterImages["flash"] },
  { type: "aquaman", emoji: "🔱", label: "Aquaman", value: 58, category: "disney", description: "King of Atlantis", image: characterImages["aquaman"] },
  { type: "green-lantern", emoji: "💚", label: "Green Lantern", value: 52, category: "disney", description: "Emerald Knight", image: characterImages["green-lantern"] },
  { type: "cyborg", emoji: "🤖", label: "Cyborg", value: 48, category: "disney", description: "Half man, half machine", image: characterImages["cyborg"] },
  { type: "batgirl", emoji: "🦇", label: "Batgirl", value: 45, category: "disney", description: "Gotham's protector", image: characterImages["batgirl"] },
  { type: "supergirl", emoji: "💫", label: "Supergirl", value: 60, category: "disney", description: "Girl of Steel", image: characterImages["supergirl"] },
  { type: "robin", emoji: "🐦", label: "Robin", value: 42, category: "disney", description: "Boy Wonder", image: characterImages["robin"] },
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

      const { error } = await supabase.rpc("send_secret_santa_gift", {
        p_recipient_id: recipientId,
        p_gift_type: giftType,
        p_gift_emoji: gift.emoji,
        p_gift_value: gift.value,
        p_message: message ?? null,
        p_is_anonymous: isAnonymous,
        p_animation_type: null,
      });
      if (error) throw error;
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
