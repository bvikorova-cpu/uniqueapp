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

// Import preview images - Christmas
import christmasPolar from "@/assets/ai-studio/christmas-polar.jpg";
import christmasTree from "@/assets/ai-studio/christmas-tree.jpg";
import christmasElf from "@/assets/ai-studio/christmas-elf.jpg";
import christmasCozy from "@/assets/ai-studio/christmas-cozy.jpg";
// Valentine
import valentineRoses from "@/assets/ai-studio/valentine-roses.jpg";
import valentineCupid from "@/assets/ai-studio/valentine-cupid.jpg";
import valentineDinner from "@/assets/ai-studio/valentine-dinner.jpg";
import valentineGarden from "@/assets/ai-studio/valentine-garden.jpg";
// Easter
import easterBunny from "@/assets/ai-studio/easter-bunny.jpg";
import easterSpring from "@/assets/ai-studio/easter-spring.jpg";
import easterChick from "@/assets/ai-studio/easter-chick.jpg";
import easterBasket from "@/assets/ai-studio/easter-basket.jpg";
// Halloween
import halloweenVampire from "@/assets/ai-studio/halloween-vampire.jpg";
import halloweenWitch from "@/assets/ai-studio/halloween-witch.jpg";
import halloweenZombie from "@/assets/ai-studio/halloween-zombie.jpg";
import halloweenGhost from "@/assets/ai-studio/halloween-ghost.jpg";
// Seasons
import summerBeach from "@/assets/ai-studio/summer-beach.jpg";
import winterSnow from "@/assets/ai-studio/winter-snow.jpg";
// Glamour & Portrait
import glamourHollywood from "@/assets/ai-studio/glamour-hollywood.jpg";
import fairytalePrincess from "@/assets/ai-studio/fairytale-princess.jpg";
// Luxury
import luxuryVip from "@/assets/ai-studio/luxury-vip.jpg";
import luxuryDubai from "@/assets/ai-studio/luxury-dubai.jpg";
import luxuryRoyal from "@/assets/ai-studio/luxury-royal.jpg";
import luxuryYacht from "@/assets/ai-studio/luxury-yacht.jpg";
// Portrait
import portraitBusiness from "@/assets/ai-studio/portrait-business.jpg";
import portraitArtistic from "@/assets/ai-studio/portrait-artistic.jpg";
import portraitFashion from "@/assets/ai-studio/portrait-fashion.jpg";
// Star
import starPopstar from "@/assets/ai-studio/star-popstar.jpg";
import starMovie from "@/assets/ai-studio/star-movie.jpg";
import starGrammy from "@/assets/ai-studio/star-grammy.jpg";
import starRunway from "@/assets/ai-studio/star-runway.jpg";
// Fantasy
import fantasyElf from "@/assets/ai-studio/fantasy-elf.jpg";
import fantasyMermaid from "@/assets/ai-studio/fantasy-mermaid.jpg";
import fantasyKnight from "@/assets/ai-studio/fantasy-knight.jpg";
// Retro
import retro80s from "@/assets/ai-studio/retro-80s.jpg";
import retro50s from "@/assets/ai-studio/retro-50s.jpg";
import retro70s from "@/assets/ai-studio/retro-70s.jpg";
import retroGatsby from "@/assets/ai-studio/retro-gatsby.jpg";
// Nature
import natureForest from "@/assets/ai-studio/nature-forest.jpg";
import natureMountain from "@/assets/ai-studio/nature-mountain.jpg";
// Sports
import sportsFitness from "@/assets/ai-studio/sports-fitness.jpg";
import sportsChampion from "@/assets/ai-studio/sports-champion.jpg";
import sportsBasketball from "@/assets/ai-studio/sports-basketball.jpg";
import sportsYoga from "@/assets/ai-studio/sports-yoga.jpg";
// Art
import artPainting from "@/assets/ai-studio/art-painting.jpg";
import artPopart from "@/assets/ai-studio/art-popart.jpg";
import artAnime from "@/assets/ai-studio/art-anime.jpg";
import artWatercolor from "@/assets/ai-studio/art-watercolor.jpg";
// Travel
import travelParis from "@/assets/ai-studio/travel-paris.jpg";
import travelSafari from "@/assets/ai-studio/travel-safari.jpg";
import travelNewyork from "@/assets/ai-studio/travel-newyork.jpg";
import travelMaldives from "@/assets/ai-studio/travel-maldives.jpg";
// Party
import partyBirthday from "@/assets/ai-studio/party-birthday.jpg";
import partyClub from "@/assets/ai-studio/party-club.jpg";
import partyNewyear from "@/assets/ai-studio/party-newyear.jpg";
import partyCarnival from "@/assets/ai-studio/party-carnival.jpg";
// Wedding
import weddingBride from "@/assets/ai-studio/wedding-bride.jpg";
import weddingGroom from "@/assets/ai-studio/wedding-groom.jpg";
import weddingBridesmaid from "@/assets/ai-studio/wedding-bridesmaid.jpg";
import weddingDance from "@/assets/ai-studio/wedding-dance.jpg";
// Future
import futureCyberpunk from "@/assets/ai-studio/future-cyberpunk.jpg";
import futureSpace from "@/assets/ai-studio/future-space.jpg";
import futureRobot from "@/assets/ai-studio/future-robot.jpg";
import futureMatrix from "@/assets/ai-studio/future-matrix.jpg";
// Super
import superHero from "@/assets/ai-studio/super-hero.jpg";
import superHeroine from "@/assets/ai-studio/super-heroine.jpg";
import superVillain from "@/assets/ai-studio/super-villain.jpg";
import superComic from "@/assets/ai-studio/super-comic.jpg";
// Music
import musicDj from "@/assets/ai-studio/music-dj.jpg";
import musicRockstar from "@/assets/ai-studio/music-rockstar.jpg";
import musicCountry from "@/assets/ai-studio/music-country.jpg";
import musicOrchestra from "@/assets/ai-studio/music-orchestra.jpg";
// Pets
import petsDog from "@/assets/ai-studio/pets-dog.jpg";
import petsCat from "@/assets/ai-studio/pets-cat.jpg";
import petsBunny from "@/assets/ai-studio/pets-bunny.jpg";
import petsHorse from "@/assets/ai-studio/pets-horse.jpg";
// Gothic
import gothicDark from "@/assets/ai-studio/gothic-dark.jpg";
import gothicAngel from "@/assets/ai-studio/gothic-angel.jpg";
import gothicRomantic from "@/assets/ai-studio/gothic-romantic.jpg";
import gothicVampire from "@/assets/ai-studio/gothic-vampire.jpg";
// Steampunk
import steampunkInventor from "@/assets/ai-studio/steampunk-inventor.jpg";
import steampunkPilot from "@/assets/ai-studio/steampunk-pilot.jpg";
import steampunkLady from "@/assets/ai-studio/steampunk-lady.jpg";
import steampunkExplorer from "@/assets/ai-studio/steampunk-explorer.jpg";
// Warriors
import vikingWarrior from "@/assets/ai-studio/viking-warrior.jpg";
import pirateCaptain from "@/assets/ai-studio/pirate-captain.jpg";
import warriorSpartan from "@/assets/ai-studio/warrior-spartan.jpg";
import warriorSamurai from "@/assets/ai-studio/warrior-samurai.jpg";
// Western
import westernCowboy from "@/assets/ai-studio/western-cowboy.jpg";
import westernSheriff from "@/assets/ai-studio/western-sheriff.jpg";
import westernRodeo from "@/assets/ai-studio/western-rodeo.jpg";
import westernSaloon from "@/assets/ai-studio/western-saloon.jpg";
// Chef
import chefGourmet from "@/assets/ai-studio/chef-gourmet.jpg";
import chefPastry from "@/assets/ai-studio/chef-pastry.jpg";
import chefSushi from "@/assets/ai-studio/chef-sushi.jpg";
import chefBbq from "@/assets/ai-studio/chef-bbq.jpg";
// Zen
import zenMeditation from "@/assets/ai-studio/zen-meditation.jpg";
import underwaterDiver from "@/assets/ai-studio/underwater-diver.jpg";
import zenTaichi from "@/assets/ai-studio/zen-taichi.jpg";
import zenMonk from "@/assets/ai-studio/zen-monk.jpg";

const TRANSFORMATION_CATEGORIES = [
  {
    name: "🎄 Christmas Magic",
    items: [
      { id: "christmas-polar", label: "Polar Bear Hug", image: christmasPolar },
      { id: "christmas-tree", label: "Christmas Tree", image: christmasTree },
      { id: "christmas-elf", label: "Santa's Helper", image: christmasElf },
      { id: "christmas-cozy", label: "Cozy Winter", image: christmasCozy },
    ]
  },
  {
    name: "💕 Valentine's Day",
    items: [
      { id: "valentine-roses", label: "Red Roses", image: valentineRoses },
      { id: "valentine-cupid", label: "Cupid Angel", image: valentineCupid },
      { id: "valentine-dinner", label: "Romantic Dinner", image: valentineDinner },
      { id: "valentine-garden", label: "Love Garden", image: valentineGarden },
    ]
  },
  {
    name: "🐣 Easter & Spring",
    items: [
      { id: "easter-bunny", label: "Easter Bunny", image: easterBunny },
      { id: "easter-spring", label: "Spring Flowers", image: easterSpring },
      { id: "easter-chick", label: "Easter Chick", image: easterChick },
      { id: "easter-basket", label: "Easter Basket", image: easterBasket },
    ]
  },
  {
    name: "🎃 Halloween",
    items: [
      { id: "halloween-vampire", label: "Vampire", image: halloweenVampire },
      { id: "halloween-witch", label: "Magic Witch", image: halloweenWitch },
      { id: "halloween-zombie", label: "Zombie", image: halloweenZombie },
      { id: "halloween-ghost", label: "Ghost", image: halloweenGhost },
    ]
  },
  {
    name: "👑 Luxury & VIP",
    items: [
      { id: "luxury-vip", label: "VIP Lifestyle", image: luxuryVip },
      { id: "luxury-dubai", label: "Dubai Dream", image: luxuryDubai },
      { id: "luxury-royal", label: "Royal Queen", image: luxuryRoyal },
      { id: "luxury-yacht", label: "Yacht Life", image: luxuryYacht },
    ]
  },
  {
    name: "📸 Portrait & Professional",
    items: [
      { id: "portrait-business", label: "Business Pro", image: portraitBusiness },
      { id: "portrait-artistic", label: "Artistic", image: portraitArtistic },
      { id: "glamour-hollywood", label: "Hollywood Star", image: glamourHollywood },
      { id: "portrait-fashion", label: "Fashion", image: portraitFashion },
    ]
  },
  {
    name: "⭐ Celebrity & Star",
    items: [
      { id: "star-popstar", label: "Pop Star", image: starPopstar },
      { id: "star-movie", label: "Movie Star", image: starMovie },
      { id: "star-grammy", label: "Grammy Winner", image: starGrammy },
      { id: "star-runway", label: "Runway Model", image: starRunway },
    ]
  },
  {
    name: "🧚 Fantasy & Magic",
    items: [
      { id: "fairytale-princess", label: "Princess", image: fairytalePrincess },
      { id: "fantasy-elf", label: "Mystical Elf", image: fantasyElf },
      { id: "fantasy-mermaid", label: "Mermaid", image: fantasyMermaid },
      { id: "fantasy-knight", label: "Knight", image: fantasyKnight },
    ]
  },
  {
    name: "🦸 Superhero",
    items: [
      { id: "super-hero", label: "Superhero", image: superHero },
      { id: "super-heroine", label: "Superheroine", image: superHeroine },
      { id: "super-villain", label: "Villain", image: superVillain },
      { id: "super-comic", label: "Comic Style", image: superComic },
    ]
  },
  {
    name: "📼 Retro & Vintage",
    items: [
      { id: "retro-80s", label: "80s Neon", image: retro80s },
      { id: "retro-50s", label: "50s Classic", image: retro50s },
      { id: "retro-70s", label: "70s Disco", image: retro70s },
      { id: "retro-gatsby", label: "Gatsby 20s", image: retroGatsby },
    ]
  },
  {
    name: "🌲 Nature & Outdoor",
    items: [
      { id: "nature-forest", label: "Enchanted Forest", image: natureForest },
      { id: "nature-mountain", label: "Mountain Peak", image: natureMountain },
      { id: "summer-beach", label: "Summer Beach", image: summerBeach },
      { id: "winter-snow", label: "Winter Snow", image: winterSnow },
    ]
  },
  {
    name: "🏆 Sports & Fitness",
    items: [
      { id: "sports-fitness", label: "Fitness Pro", image: sportsFitness },
      { id: "sports-champion", label: "Champion", image: sportsChampion },
      { id: "sports-basketball", label: "Basketball", image: sportsBasketball },
      { id: "sports-yoga", label: "Yoga Master", image: sportsYoga },
    ]
  },
  {
    name: "🎨 Art & Creative",
    items: [
      { id: "art-painting", label: "Oil Painting", image: artPainting },
      { id: "art-popart", label: "Pop Art", image: artPopart },
      { id: "art-anime", label: "Anime Style", image: artAnime },
      { id: "art-watercolor", label: "Watercolor", image: artWatercolor },
    ]
  },
  {
    name: "✈️ Travel & Adventure",
    items: [
      { id: "travel-paris", label: "Paris Dream", image: travelParis },
      { id: "travel-safari", label: "Safari Adventure", image: travelSafari },
      { id: "travel-newyork", label: "New York", image: travelNewyork },
      { id: "travel-maldives", label: "Maldives", image: travelMaldives },
    ]
  },
  {
    name: "🎉 Party & Celebration",
    items: [
      { id: "party-birthday", label: "Birthday Party", image: partyBirthday },
      { id: "party-club", label: "VIP Club", image: partyClub },
      { id: "party-newyear", label: "New Year", image: partyNewyear },
      { id: "party-carnival", label: "Carnival", image: partyCarnival },
    ]
  },
  {
    name: "💒 Wedding",
    items: [
      { id: "wedding-bride", label: "Beautiful Bride", image: weddingBride },
      { id: "wedding-groom", label: "Elegant Groom", image: weddingGroom },
      { id: "wedding-bridesmaid", label: "Bridesmaid", image: weddingBridesmaid },
      { id: "wedding-dance", label: "First Dance", image: weddingDance },
    ]
  },
  {
    name: "🚀 Futuristic & Sci-Fi",
    items: [
      { id: "future-cyberpunk", label: "Cyberpunk", image: futureCyberpunk },
      { id: "future-space", label: "Space Explorer", image: futureSpace },
      { id: "future-robot", label: "Robot", image: futureRobot },
      { id: "future-matrix", label: "Matrix", image: futureMatrix },
    ]
  },
  {
    name: "🎵 Music & Stage",
    items: [
      { id: "music-dj", label: "Famous DJ", image: musicDj },
      { id: "music-rockstar", label: "Rock Star", image: musicRockstar },
      { id: "music-country", label: "Country Star", image: musicCountry },
      { id: "music-orchestra", label: "Conductor", image: musicOrchestra },
    ]
  },
  {
    name: "🐕 Pets & Animals",
    items: [
      { id: "pets-dog", label: "With Puppy", image: petsDog },
      { id: "pets-cat", label: "Cat Lover", image: petsCat },
      { id: "pets-bunny", label: "Bunny", image: petsBunny },
      { id: "pets-horse", label: "Horse Riding", image: petsHorse },
    ]
  },
  {
    name: "🦇 Gothic & Dark",
    items: [
      { id: "gothic-dark", label: "Dark Queen", image: gothicDark },
      { id: "gothic-angel", label: "Dark Angel", image: gothicAngel },
      { id: "gothic-romantic", label: "Romantic Gothic", image: gothicRomantic },
      { id: "gothic-vampire", label: "Vampire Lord", image: gothicVampire },
    ]
  },
  {
    name: "⚙️ Steampunk",
    items: [
      { id: "steampunk-inventor", label: "Inventor", image: steampunkInventor },
      { id: "steampunk-pilot", label: "Airship Pilot", image: steampunkPilot },
      { id: "steampunk-lady", label: "Victorian Lady", image: steampunkLady },
      { id: "steampunk-explorer", label: "Explorer", image: steampunkExplorer },
    ]
  },
  {
    name: "⚔️ Historical Warriors",
    items: [
      { id: "viking-warrior", label: "Viking", image: vikingWarrior },
      { id: "pirate-captain", label: "Pirate Captain", image: pirateCaptain },
      { id: "warrior-spartan", label: "Spartan", image: warriorSpartan },
      { id: "warrior-samurai", label: "Samurai", image: warriorSamurai },
    ]
  },
  {
    name: "🤠 Western",
    items: [
      { id: "western-cowboy", label: "Cowboy", image: westernCowboy },
      { id: "western-sheriff", label: "Sheriff", image: westernSheriff },
      { id: "western-rodeo", label: "Rodeo", image: westernRodeo },
      { id: "western-saloon", label: "Saloon", image: westernSaloon },
    ]
  },
  {
    name: "👨‍🍳 Culinary",
    items: [
      { id: "chef-gourmet", label: "Gourmet Chef", image: chefGourmet },
      { id: "chef-pastry", label: "Pastry Chef", image: chefPastry },
      { id: "chef-sushi", label: "Sushi Chef", image: chefSushi },
      { id: "chef-bbq", label: "BBQ Master", image: chefBbq },
    ]
  },
  {
    name: "🧘 Zen & Spiritual",
    items: [
      { id: "zen-meditation", label: "Meditation", image: zenMeditation },
      { id: "underwater-diver", label: "Deep Sea", image: underwaterDiver },
      { id: "zen-taichi", label: "Tai Chi", image: zenTaichi },
      { id: "zen-monk", label: "Monk", image: zenMonk },
    ]
  },
];

const CREDIT_PACKAGES = [
  { id: "5", credits: 5, price: 3, popular: false },
  { id: "10", credits: 10, price: 6, popular: true },
  { id: "20", credits: 20, price: 15, popular: false },
  { id: "100", credits: 100, price: 55, popular: false, bestValue: true },
];

export default function WallAIStudio() {
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

      const { data, error } = await supabase.functions.invoke("ai-studio-transform", {
        body: { imageUrl: finalImageUrl, transformationType: selectedTransformation }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
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
}