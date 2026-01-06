import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Image as ImageIcon, 
  Upload, 
  CreditCard, 
  Check, 
  Loader2,
  Wand2,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useNavigate } from "react-router-dom";

// Helper to get image path from public folder - NO static imports!
const getImagePath = (filename: string): string => `/ai-studio/${filename}.jpg`;

// Define categories with string paths instead of imported modules
const TRANSFORMATION_CATEGORIES = [
  {
    name: "💎 Glamour Photo",
    items: [
      { id: "glamour-barbie", label: "Barbie Dream", image: getImagePath("glamour-barbie") },
      { id: "glamour-paris", label: "Paris Eiffel", image: getImagePath("glamour-paris") },
      { id: "glamour-flowers", label: "Flower Garden", image: getImagePath("glamour-flowers") },
      { id: "glamour-biker", label: "Biker Girl", image: getImagePath("glamour-biker") },
      { id: "glamour-vintage", label: "Vintage Mirror", image: getImagePath("glamour-vintage") },
      { id: "glamour-balloons", label: "Red Balloons", image: getImagePath("glamour-balloons") },
      { id: "glamour-golden", label: "Golden Glamour", image: getImagePath("glamour-golden") },
      { id: "glamour-butterfly", label: "Butterfly Queen", image: getImagePath("glamour-butterfly") },
      { id: "glamour-birthday", label: "Birthday Glam", image: getImagePath("glamour-birthday") },
      { id: "glamour-christmas-lights", label: "Christmas Lights", image: getImagePath("glamour-christmas-lights") },
      { id: "glamour-monochrome", label: "Monochrome", image: getImagePath("glamour-monochrome") },
      { id: "glamour-golden-moon", label: "Golden Moon", image: getImagePath("glamour-golden-moon") },
      { id: "glamour-ocean-waves", label: "Ocean Goddess", image: getImagePath("glamour-ocean-waves") },
      { id: "glamour-panther", label: "Black Panther", image: getImagePath("glamour-panther") },
      { id: "glamour-reindeer", label: "Magic Reindeer", image: getImagePath("glamour-reindeer") },
      { id: "glamour-christmas-family", label: "Christmas Family", image: getImagePath("glamour-christmas-family") },
      { id: "glamour-cozy-mug", label: "Cozy Christmas Mug", image: getImagePath("glamour-cozy-mug") },
      { id: "glamour-tree-dance", label: "Tree Dance", image: getImagePath("glamour-tree-dance") },
      { id: "glamour-santa-candy", label: "Santa Candy", image: getImagePath("glamour-santa-candy") },
      { id: "glamour-santa-mirror", label: "Santa Mirror", image: getImagePath("glamour-santa-mirror") },
      { id: "glamour-grinch", label: "Grinch Friend", image: getImagePath("glamour-grinch") },
      { id: "glamour-red-dress-gift", label: "Red Dress Gift", image: getImagePath("glamour-red-dress-gift") },
      { id: "glamour-baby-sled", label: "Baby Sled", image: getImagePath("glamour-baby-sled") },
      { id: "glamour-gift-box", label: "Gift Box", image: getImagePath("glamour-gift-box") },
      { id: "glamour-rose-wreath", label: "Rose Wreath", image: getImagePath("glamour-rose-wreath") },
      { id: "glamour-champagne-tree", label: "Champagne Tree", image: getImagePath("glamour-champagne-tree") },
      { id: "glamour-gingerbread-girl", label: "Gingerbread Girl", image: getImagePath("glamour-gingerbread-girl") },
      { id: "glamour-santa-lollipop", label: "Santa Lollipop", image: getImagePath("glamour-santa-lollipop") },
    ]
  },
  {
    name: "🧜‍♀️ Atlantis Mermaid",
    items: [
      { id: "atlantis-seaflora", label: "Seaflora Blush", image: getImagePath("atlantis-seaflora") },
      { id: "atlantis-sunwave", label: "Sunwave Opal", image: getImagePath("atlantis-sunwave") },
      { id: "atlantis-nyxelle", label: "Nyxelle Pearl", image: getImagePath("atlantis-nyxelle") },
    ]
  },
  {
    name: "🎨 Creative Studio",
    items: [
      { id: "creative-sunflower", label: "Sun Flower", image: getImagePath("creative-sunflower") },
      { id: "creative-giant", label: "Giant Statue", image: getImagePath("creative-giant") },
      { id: "creative-desert", label: "Desert Queen", image: getImagePath("creative-desert") },
      { id: "creative-graffiti", label: "Graffiti Wall", image: getImagePath("creative-graffiti") },
    ]
  },
  {
    name: "🏆 Chibi Champs",
    items: [
      { id: "chibi-skiing", label: "Frosty Zoomers", image: getImagePath("chibi-skiing") },
      { id: "chibi-basketball", label: "Bounce Buds", image: getImagePath("chibi-basketball") },
    ]
  },
  {
    name: "💝 Pocket Buddies",
    items: [
      { id: "pocket-work", label: "Pocket Work", image: getImagePath("pocket-work") },
      { id: "pocket-gift", label: "Pocket Gift", image: getImagePath("pocket-gift") },
    ]
  },
  {
    name: "🎄 Christmas Magic",
    items: [
      { id: "christmas-polar", label: "Polar Bear Hug", image: getImagePath("christmas-polar") },
      { id: "christmas-tree", label: "Christmas Tree", image: getImagePath("christmas-tree") },
      { id: "christmas-elf", label: "Santa's Helper", image: getImagePath("christmas-elf") },
      { id: "christmas-cozy", label: "Cozy Winter", image: getImagePath("christmas-cozy") },
    ]
  },
  {
    name: "💕 Valentine's Day",
    items: [
      { id: "valentine-roses", label: "Red Roses", image: getImagePath("valentine-roses") },
      { id: "valentine-cupid", label: "Cupid Angel", image: getImagePath("valentine-cupid") },
      { id: "valentine-dinner", label: "Romantic Dinner", image: getImagePath("valentine-dinner") },
      { id: "valentine-garden", label: "Love Garden", image: getImagePath("valentine-garden") },
    ]
  },
  {
    name: "🐣 Easter & Spring",
    items: [
      { id: "easter-bunny", label: "Easter Bunny", image: getImagePath("easter-bunny") },
      { id: "easter-spring", label: "Spring Flowers", image: getImagePath("easter-spring") },
      { id: "easter-chick", label: "Easter Chick", image: getImagePath("easter-chick") },
      { id: "easter-basket", label: "Easter Basket", image: getImagePath("easter-basket") },
    ]
  },
  {
    name: "🎃 Halloween",
    items: [
      { id: "halloween-vampire", label: "Vampire", image: getImagePath("halloween-vampire") },
      { id: "halloween-witch", label: "Magic Witch", image: getImagePath("halloween-witch") },
      { id: "halloween-zombie", label: "Zombie", image: getImagePath("halloween-zombie") },
      { id: "halloween-ghost", label: "Ghost", image: getImagePath("halloween-ghost") },
    ]
  },
  {
    name: "👑 Luxury & VIP",
    items: [
      { id: "luxury-vip", label: "VIP Lifestyle", image: getImagePath("luxury-vip") },
      { id: "luxury-dubai", label: "Dubai Dream", image: getImagePath("luxury-dubai") },
      { id: "luxury-royal", label: "Royal Queen", image: getImagePath("luxury-royal") },
      { id: "luxury-yacht", label: "Yacht Life", image: getImagePath("luxury-yacht") },
    ]
  },
  {
    name: "📸 Portrait & Professional",
    items: [
      { id: "portrait-business", label: "Business Pro", image: getImagePath("portrait-business") },
      { id: "portrait-artistic", label: "Artistic", image: getImagePath("portrait-artistic") },
      { id: "glamour-hollywood", label: "Hollywood Star", image: getImagePath("glamour-hollywood") },
      { id: "portrait-fashion", label: "Fashion", image: getImagePath("portrait-fashion") },
    ]
  },
  {
    name: "⭐ Celebrity & Star",
    items: [
      { id: "star-popstar", label: "Pop Star", image: getImagePath("star-popstar") },
      { id: "star-movie", label: "Movie Star", image: getImagePath("star-movie") },
      { id: "star-grammy", label: "Grammy Winner", image: getImagePath("star-grammy") },
      { id: "star-runway", label: "Runway Model", image: getImagePath("star-runway") },
    ]
  },
  {
    name: "🧚 Fantasy & Magic",
    items: [
      { id: "fairytale-princess", label: "Princess", image: getImagePath("fairytale-princess") },
      { id: "fantasy-elf", label: "Mystical Elf", image: getImagePath("fantasy-elf") },
      { id: "fantasy-mermaid", label: "Mermaid", image: getImagePath("fantasy-mermaid") },
      { id: "fantasy-knight", label: "Knight", image: getImagePath("fantasy-knight") },
    ]
  },
  {
    name: "🦸 Superhero",
    items: [
      { id: "super-hero", label: "Superhero", image: getImagePath("super-hero") },
      { id: "super-heroine", label: "Superheroine", image: getImagePath("super-heroine") },
      { id: "super-villain", label: "Villain", image: getImagePath("super-villain") },
      { id: "super-comic", label: "Comic Style", image: getImagePath("super-comic") },
    ]
  },
  {
    name: "📼 Retro & Vintage",
    items: [
      { id: "retro-80s", label: "80s Neon", image: getImagePath("retro-80s") },
      { id: "retro-50s", label: "50s Classic", image: getImagePath("retro-50s") },
      { id: "retro-70s", label: "70s Disco", image: getImagePath("retro-70s") },
      { id: "retro-gatsby", label: "Gatsby 20s", image: getImagePath("retro-gatsby") },
    ]
  },
  {
    name: "🌲 Nature & Outdoor",
    items: [
      { id: "nature-forest", label: "Enchanted Forest", image: getImagePath("nature-forest") },
      { id: "nature-mountain", label: "Mountain Peak", image: getImagePath("nature-mountain") },
      { id: "summer-beach", label: "Summer Beach", image: getImagePath("summer-beach") },
      { id: "winter-snow", label: "Winter Snow", image: getImagePath("winter-snow") },
    ]
  },
  {
    name: "🏆 Sports & Fitness",
    items: [
      { id: "sports-fitness", label: "Fitness Pro", image: getImagePath("sports-fitness") },
      { id: "sports-champion", label: "Champion", image: getImagePath("sports-champion") },
      { id: "sports-basketball", label: "Basketball", image: getImagePath("sports-basketball") },
      { id: "sports-yoga", label: "Yoga Master", image: getImagePath("sports-yoga") },
    ]
  },
  {
    name: "🎨 Art & Creative",
    items: [
      { id: "art-painting", label: "Oil Painting", image: getImagePath("art-painting") },
      { id: "art-popart", label: "Pop Art", image: getImagePath("art-popart") },
      { id: "art-anime", label: "Anime Style", image: getImagePath("art-anime") },
      { id: "art-watercolor", label: "Watercolor", image: getImagePath("art-watercolor") },
    ]
  },
  {
    name: "✈️ Travel & Adventure",
    items: [
      { id: "travel-paris", label: "Paris Dream", image: getImagePath("travel-paris") },
      { id: "travel-safari", label: "Safari Adventure", image: getImagePath("travel-safari") },
      { id: "travel-newyork", label: "New York", image: getImagePath("travel-newyork") },
      { id: "travel-maldives", label: "Maldives", image: getImagePath("travel-maldives") },
    ]
  },
  {
    name: "🎉 Party & Celebration",
    items: [
      { id: "party-birthday", label: "Birthday Party", image: getImagePath("party-birthday") },
      { id: "party-club", label: "VIP Club", image: getImagePath("party-club") },
      { id: "party-newyear", label: "New Year", image: getImagePath("party-newyear") },
      { id: "party-carnival", label: "Carnival", image: getImagePath("party-carnival") },
    ]
  },
  {
    name: "💒 Wedding",
    items: [
      { id: "wedding-bride", label: "Beautiful Bride", image: getImagePath("wedding-bride") },
      { id: "wedding-groom", label: "Elegant Groom", image: getImagePath("wedding-groom") },
      { id: "wedding-bridesmaid", label: "Bridesmaid", image: getImagePath("wedding-bridesmaid") },
      { id: "wedding-dance", label: "First Dance", image: getImagePath("wedding-dance") },
    ]
  },
  {
    name: "🚀 Futuristic & Sci-Fi",
    items: [
      { id: "future-cyberpunk", label: "Cyberpunk", image: getImagePath("future-cyberpunk") },
      { id: "future-space", label: "Space Explorer", image: getImagePath("future-space") },
      { id: "future-robot", label: "Robot", image: getImagePath("future-robot") },
      { id: "future-matrix", label: "Matrix", image: getImagePath("future-matrix") },
    ]
  },
  {
    name: "🎵 Music & Stage",
    items: [
      { id: "music-dj", label: "Famous DJ", image: getImagePath("music-dj") },
      { id: "music-rockstar", label: "Rock Star", image: getImagePath("music-rockstar") },
      { id: "music-country", label: "Country Star", image: getImagePath("music-country") },
      { id: "music-orchestra", label: "Conductor", image: getImagePath("music-orchestra") },
    ]
  },
  {
    name: "🐕 Pets & Animals",
    items: [
      { id: "pets-dog", label: "With Puppy", image: getImagePath("pets-dog") },
      { id: "pets-cat", label: "Cat Lover", image: getImagePath("pets-cat") },
      { id: "pets-bunny", label: "Bunny", image: getImagePath("pets-bunny") },
      { id: "pets-horse", label: "Horse Riding", image: getImagePath("pets-horse") },
    ]
  },
  {
    name: "🦇 Gothic & Dark",
    items: [
      { id: "gothic-dark", label: "Dark Queen", image: getImagePath("gothic-dark") },
      { id: "gothic-angel", label: "Dark Angel", image: getImagePath("gothic-angel") },
      { id: "gothic-romantic", label: "Romantic Gothic", image: getImagePath("gothic-romantic") },
      { id: "gothic-vampire", label: "Vampire Lord", image: getImagePath("gothic-vampire") },
    ]
  },
  {
    name: "⚙️ Steampunk",
    items: [
      { id: "steampunk-inventor", label: "Inventor", image: getImagePath("steampunk-inventor") },
      { id: "steampunk-pilot", label: "Airship Pilot", image: getImagePath("steampunk-pilot") },
      { id: "steampunk-lady", label: "Victorian Lady", image: getImagePath("steampunk-lady") },
      { id: "steampunk-explorer", label: "Explorer", image: getImagePath("steampunk-explorer") },
    ]
  },
  {
    name: "⚔️ Historical Warriors",
    items: [
      { id: "viking-warrior", label: "Viking", image: getImagePath("viking-warrior") },
      { id: "pirate-captain", label: "Pirate Captain", image: getImagePath("pirate-captain") },
      { id: "warrior-spartan", label: "Spartan", image: getImagePath("warrior-spartan") },
      { id: "warrior-samurai", label: "Samurai", image: getImagePath("warrior-samurai") },
    ]
  },
  {
    name: "🤠 Western",
    items: [
      { id: "western-cowboy", label: "Cowboy", image: getImagePath("western-cowboy") },
      { id: "western-sheriff", label: "Sheriff", image: getImagePath("western-sheriff") },
      { id: "western-rodeo", label: "Rodeo", image: getImagePath("western-rodeo") },
      { id: "western-saloon", label: "Saloon", image: getImagePath("western-saloon") },
    ]
  },
  {
    name: "👨‍🍳 Culinary",
    items: [
      { id: "chef-gourmet", label: "Gourmet Chef", image: getImagePath("chef-gourmet") },
      { id: "chef-pastry", label: "Pastry Chef", image: getImagePath("chef-pastry") },
      { id: "chef-sushi", label: "Sushi Chef", image: getImagePath("chef-sushi") },
      { id: "chef-bbq", label: "BBQ Master", image: getImagePath("chef-bbq") },
    ]
  },
  {
    name: "🧘 Zen & Spiritual",
    items: [
      { id: "zen-meditation", label: "Meditation", image: getImagePath("zen-meditation") },
      { id: "underwater-diver", label: "Deep Sea", image: getImagePath("underwater-diver") },
      { id: "zen-taichi", label: "Tai Chi", image: getImagePath("zen-taichi") },
      { id: "zen-monk", label: "Monk", image: getImagePath("zen-monk") },
    ]
  },
  {
    name: "🏋️ Extreme Sports",
    items: [
      { id: "sports-racing", label: "F1 Racer", image: getImagePath("sports-racing") },
      { id: "sports-boxer", label: "Boxer", image: getImagePath("sports-boxer") },
      { id: "sports-surfing", label: "Pro Surfer", image: getImagePath("sports-surfing") },
      { id: "sports-soccer", label: "Soccer Star", image: getImagePath("sports-soccer") },
      { id: "sports-skating", label: "Ice Skater", image: getImagePath("sports-skating") },
      { id: "sports-tennis", label: "Tennis Pro", image: getImagePath("sports-tennis") },
      { id: "sports-snowboard", label: "Snowboarder", image: getImagePath("sports-snowboard") },
    ]
  },
  {
    name: "💼 Career Dreams",
    items: [
      { id: "career-pilot", label: "Airline Pilot", image: getImagePath("career-pilot") },
      { id: "career-firefighter", label: "Firefighter", image: getImagePath("career-firefighter") },
      { id: "career-doctor", label: "Surgeon", image: getImagePath("career-doctor") },
      { id: "lifestyle-barista", label: "Barista", image: getImagePath("lifestyle-barista") },
    ]
  },
  {
    name: "🌍 World Cultures",
    items: [
      { id: "culture-geisha", label: "Japanese Geisha", image: getImagePath("culture-geisha") },
      { id: "culture-bollywood", label: "Bollywood Star", image: getImagePath("culture-bollywood") },
      { id: "culture-diademuertos", label: "Día de Muertos", image: getImagePath("culture-diademuertos") },
      { id: "culture-hanfu", label: "Chinese Hanfu", image: getImagePath("culture-hanfu") },
      { id: "culture-scottish", label: "Scottish Highland", image: getImagePath("culture-scottish") },
    ]
  },
  {
    name: "🔮 Mythology & Magic",
    items: [
      { id: "myth-goddess", label: "Greek Goddess", image: getImagePath("myth-goddess") },
      { id: "ancient-pharaoh", label: "Egyptian Pharaoh", image: getImagePath("ancient-pharaoh") },
      { id: "myth-nightqueen", label: "Night Queen", image: getImagePath("myth-nightqueen") },
      { id: "myth-athena", label: "Athena Warrior", image: getImagePath("myth-athena") },
      { id: "myth-nature", label: "Nature Goddess", image: getImagePath("myth-nature") },
      { id: "magic-potion", label: "Potion Witch", image: getImagePath("magic-potion") },
      { id: "mystic-fortune", label: "Fortune Teller", image: getImagePath("mystic-fortune") },
    ]
  },
  {
    name: "✨ Fantasy Creatures",
    items: [
      { id: "fantasy-fairy", label: "Magical Fairy", image: getImagePath("fantasy-fairy") },
      { id: "fantasy-unicorn", label: "Unicorn Rider", image: getImagePath("fantasy-unicorn") },
      { id: "fantasy-icequeen", label: "Ice Queen", image: getImagePath("fantasy-icequeen") },
      { id: "fantasy-wizard", label: "Dark Wizard", image: getImagePath("fantasy-wizard") },
    ]
  },
  {
    name: "🎤 Modern Music",
    items: [
      { id: "music-kpop", label: "K-Pop Star", image: getImagePath("music-kpop") },
      { id: "music-hiphop", label: "Hip Hop Artist", image: getImagePath("music-hiphop") },
      { id: "music-jazz", label: "Jazz Singer", image: getImagePath("music-jazz") },
    ]
  },
  {
    name: "🎬 Action & Adventure",
    items: [
      { id: "action-spy", label: "Secret Agent", image: getImagePath("action-spy") },
      { id: "adventure-jungle", label: "Jungle Explorer", image: getImagePath("adventure-jungle") },
      { id: "ancient-gladiator", label: "Gladiator", image: getImagePath("ancient-gladiator") },
      { id: "warrior-dragon", label: "Dragon Warrior", image: getImagePath("warrior-dragon") },
      { id: "warrior-amazon", label: "Amazon Warrior", image: getImagePath("warrior-amazon") },
    ]
  },
  {
    name: "💃 Dance & Performance",
    items: [
      { id: "dance-ballerina", label: "Prima Ballerina", image: getImagePath("dance-ballerina") },
      { id: "dance-flamenco", label: "Flamenco Dancer", image: getImagePath("dance-flamenco") },
    ]
  },
  {
    name: "🎰 Lifestyle & Luxury",
    items: [
      { id: "lifestyle-wine", label: "Wine Tasting", image: getImagePath("lifestyle-wine") },
      { id: "lifestyle-casino", label: "Casino VIP", image: getImagePath("lifestyle-casino") },
      { id: "lifestyle-biker", label: "Road Rider", image: getImagePath("lifestyle-biker") },
      { id: "glamour-masquerade", label: "Masquerade Ball", image: getImagePath("glamour-masquerade") },
    ]
  },
  {
    name: "🏆 Awards & Fame",
    items: [
      { id: "award-oscar", label: "Oscar Winner", image: getImagePath("award-oscar") },
      { id: "fashion-magazine", label: "Magazine Cover", image: getImagePath("fashion-magazine") },
    ]
  },
  {
    name: "🔬 Fun & Quirky",
    items: [
      { id: "fun-scientist", label: "Mad Scientist", image: getImagePath("fun-scientist") },
      { id: "tech-hacker", label: "Neon Hacker", image: getImagePath("tech-hacker") },
      { id: "gaming-esports", label: "Pro Gamer", image: getImagePath("gaming-esports") },
    ]
  },
  {
    name: "📺 Retro Classics",
    items: [
      { id: "retro-filmnoir", label: "Film Noir Star", image: getImagePath("retro-filmnoir") },
      { id: "royal-renaissance", label: "Renaissance Noble", image: getImagePath("royal-renaissance") },
    ]
  },
  {
    name: "🐶 Pet Love",
    items: [
      { id: "pets-puppies", label: "Puppy Party", image: getImagePath("pets-puppies") },
    ]
  },
];

const CREDIT_PACKAGES = [
  { id: "5", credits: 5, price: 3, popular: false },
  { id: "10", credits: 10, price: 6, popular: true },
  { id: "20", credits: 20, price: 15, popular: false },
  { id: "100", credits: 100, price: 55, popular: false, bestValue: true },
];

export const WALL_AI_STUDIO_V2_VERSION = "2026-01-06e";
export const WallAIStudioV2 = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedTransformation, setSelectedTransformation] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const success = searchParams.get("success");
    const credits = searchParams.get("credits");
    
    if (success === "true" && credits) {
      const addCredits = async () => {
        try {
          const { error } = await supabase.functions.invoke("ai-studio-add-credits", {
            body: { credits: parseInt(credits) }
          });
          
          if (error) throw error;
          
          toast({
            title: "Payment Successful!",
            description: `${credits} AI credits have been added to your account.`,
          });
          
          queryClient.invalidateQueries({ queryKey: ["ai-studio-credits"] });
          navigate("/wall/ai-studio", { replace: true });
        } catch (error) {
          console.error("Error adding credits:", error);
        }
      };
      
      addCredits();
    }
  }, [searchParams]);

  const { data: credits, isLoading: creditsLoading } = useQuery({
    queryKey: ["ai-studio-credits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("ai_studio_credits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from("ai_studio_credits")
          .insert({ user_id: user.id, credits_remaining: 0, total_credits_purchased: 0 })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newData;
      }
      
      return data;
    },
  });

  const { data: history = [] } = useQuery({
    queryKey: ["ai-studio-history"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("ai_studio_transformations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(12);

      if (error) throw error;
      return data || [];
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Error", description: "Please select an image file", variant: "destructive" });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageUrl("");
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) throw new Error("No file selected");
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("ai-studio")
      .upload(fileName, imageFile);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from("ai-studio")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleDownload = async (imageUrl: string, fileName: string = "ai-studio-photo.png") => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Error",
        description: "Could not download the image",
        variant: "destructive"
      });
    }
  };

  // Helper function to get the preview image URL for a selected transformation
  const getStylePreviewUrl = (transformationId: string): string | undefined => {
    for (const category of TRANSFORMATION_CATEGORIES) {
      const item = category.items.find(i => i.id === transformationId);
      if (item) {
        return window.location.origin + item.image;
      }
    }
    return undefined;
  };

  const transformMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTransformation) throw new Error("Select a transformation style");
      
      let finalImageUrl = imageUrl;
      
      if (imageFile) {
        setIsUploading(true);
        finalImageUrl = await uploadImage();
        setIsUploading(false);
      }
      
      if (!finalImageUrl) throw new Error("Please provide an image");

      const stylePreviewUrl = getStylePreviewUrl(selectedTransformation);

      const { data, error } = await supabase.functions.invoke("ai-studio-transform", {
        body: { 
          imageUrl: finalImageUrl, 
          transformationType: selectedTransformation,
          stylePreviewUrl: stylePreviewUrl
        }
      });

      if (error) {
        if (data?.error) {
          throw new Error(data.error);
        }
        throw error;
      }
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (data) => {
      setTransformedImage(data.transformedImageUrl);
      toast({ title: "Success!", description: "Your image has been transformed" });
      queryClient.invalidateQueries({ queryKey: ["ai-studio-credits"] });
      queryClient.invalidateQueries({ queryKey: ["ai-studio-history"] });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const purchaseMutation = useMutation({
    mutationFn: async (packageId: string) => {
      const { data, error } = await supabase.functions.invoke("ai-studio-purchase", {
        body: { packageId }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data.url;
    },
    onSuccess: (url) => {
      if (url) {
        window.open(url, "_blank");
      }
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            AI Studio
          </h1>
        </div>
        <p className="text-muted-foreground">Transform your photos with AI magic</p>
        
        <div className="flex justify-center">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <CreditCard className="h-4 w-4 mr-2" />
            {creditsLoading ? "..." : credits?.credits_remaining || 0} Credits Available
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Your Photo
            </h2>
            
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="file">Choose file</Label>
                  <Input 
                    id="file" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                </div>
                
                <div className="text-center text-muted-foreground">or</div>
                
                <div>
                  <Label htmlFor="url">Paste image URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                  />
                </div>
              </div>

              {(imagePreview || imageUrl) && (
                <div className="relative aspect-square max-w-sm mx-auto rounded-xl overflow-hidden border-2 border-dashed border-primary/30">
                  <img 
                    src={imagePreview || imageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Choose Your Style ({TRANSFORMATION_CATEGORIES.reduce((acc, cat) => acc + cat.items.length, 0)} styles)
            </h2>
            
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
              {TRANSFORMATION_CATEGORIES.map((category) => (
                <div key={category.name}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 sticky top-0 bg-card py-1">
                    {category.name}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {category.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedTransformation(item.id)}
                        className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                          selectedTransformation === item.id
                            ? "border-primary ring-2 ring-primary/50"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="aspect-square">
                          <img
                            src={item.image}
                            alt={item.label}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-2">
                          <span className="text-white text-xs font-medium">{item.label}</span>
                        </div>
                        {selectedTransformation === item.id && (
                          <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Button
            onClick={() => transformMutation.mutate()}
            disabled={!selectedTransformation || (!imageUrl && !imageFile) || transformMutation.isPending || isUploading}
            className="w-full"
            size="lg"
          >
            {transformMutation.isPending || isUploading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {isUploading ? "Uploading..." : "Transforming..."}
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Transform Photo (1 Credit)
              </>
            )}
          </Button>

          {transformedImage && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Your Transformed Photo</h2>
              <div className="relative aspect-square max-w-md mx-auto rounded-xl overflow-hidden">
                <img 
                  src={transformedImage} 
                  alt="Transformed" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex justify-center mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleDownload(transformedImage, `transformed-${Date.now()}.png`)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Image
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Buy Credits
            </h2>
            <div className="space-y-3">
              {CREDIT_PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => purchaseMutation.mutate(pkg.id)}
                  disabled={purchaseMutation.isPending}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    pkg.popular
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{pkg.credits} Credits</div>
                      <div className="text-sm text-muted-foreground">€{pkg.price}</div>
                    </div>
                    <div className="flex flex-col items-end">
                      {pkg.popular && (
                        <Badge variant="default" className="mb-1">Popular</Badge>
                      )}
                      {pkg.bestValue && (
                        <Badge variant="secondary">Best Value</Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {history.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Recent Transformations
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {history.slice(0, 4).map((item: any) => (
                  <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden">
                    <img
                      src={item.transformed_image_url}
                      alt="Transformation"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleDownload(item.transformed_image_url, `transformation-${item.id}.png`)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Download className="h-6 w-6 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default WallAIStudioV2;
