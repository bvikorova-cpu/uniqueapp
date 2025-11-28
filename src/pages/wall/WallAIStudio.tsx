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
  Wand2
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
// Easter & Halloween
import easterBunny from "@/assets/ai-studio/easter-bunny.jpg";
import easterSpring from "@/assets/ai-studio/easter-spring.jpg";
import halloweenVampire from "@/assets/ai-studio/halloween-vampire.jpg";
import halloweenWitch from "@/assets/ai-studio/halloween-witch.jpg";
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
// Portrait
import portraitBusiness from "@/assets/ai-studio/portrait-business.jpg";
import portraitArtistic from "@/assets/ai-studio/portrait-artistic.jpg";
// Star
import starPopstar from "@/assets/ai-studio/star-popstar.jpg";
import starMovie from "@/assets/ai-studio/star-movie.jpg";
// Fantasy
import fantasyElf from "@/assets/ai-studio/fantasy-elf.jpg";
import fantasyMermaid from "@/assets/ai-studio/fantasy-mermaid.jpg";
import fantasyKnight from "@/assets/ai-studio/fantasy-knight.jpg";
// Retro
import retro80s from "@/assets/ai-studio/retro-80s.jpg";
import retro50s from "@/assets/ai-studio/retro-50s.jpg";
// Nature
import natureForest from "@/assets/ai-studio/nature-forest.jpg";
import natureMountain from "@/assets/ai-studio/nature-mountain.jpg";
// Sports
import sportsFitness from "@/assets/ai-studio/sports-fitness.jpg";
import sportsChampion from "@/assets/ai-studio/sports-champion.jpg";
// Art
import artPainting from "@/assets/ai-studio/art-painting.jpg";
import artPopart from "@/assets/ai-studio/art-popart.jpg";
import artAnime from "@/assets/ai-studio/art-anime.jpg";
// Travel
import travelParis from "@/assets/ai-studio/travel-paris.jpg";
import travelSafari from "@/assets/ai-studio/travel-safari.jpg";
// Party
import partyBirthday from "@/assets/ai-studio/party-birthday.jpg";
import partyClub from "@/assets/ai-studio/party-club.jpg";
// Wedding
import weddingBride from "@/assets/ai-studio/wedding-bride.jpg";
import weddingGroom from "@/assets/ai-studio/wedding-groom.jpg";
// Future
import futureCyberpunk from "@/assets/ai-studio/future-cyberpunk.jpg";
import futureSpace from "@/assets/ai-studio/future-space.jpg";
// Super
import superHero from "@/assets/ai-studio/super-hero.jpg";
// Music
import musicDj from "@/assets/ai-studio/music-dj.jpg";
import musicRockstar from "@/assets/ai-studio/music-rockstar.jpg";
// Underwater
import underwaterDiver from "@/assets/ai-studio/underwater-diver.jpg";
// Pets
import petsDog from "@/assets/ai-studio/pets-dog.jpg";
import petsCat from "@/assets/ai-studio/pets-cat.jpg";
// Gothic
import gothicDark from "@/assets/ai-studio/gothic-dark.jpg";
// Steampunk
import steampunkInventor from "@/assets/ai-studio/steampunk-inventor.jpg";
// Viking
import vikingWarrior from "@/assets/ai-studio/viking-warrior.jpg";
// Pirate
import pirateCaptain from "@/assets/ai-studio/pirate-captain.jpg";
// Chef
import chefGourmet from "@/assets/ai-studio/chef-gourmet.jpg";
// Western
import westernCowboy from "@/assets/ai-studio/western-cowboy.jpg";
// Zen
import zenMeditation from "@/assets/ai-studio/zen-meditation.jpg";

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
    ]
  },
  {
    name: "🎃 Halloween",
    items: [
      { id: "halloween-vampire", label: "Vampire", image: halloweenVampire },
      { id: "halloween-witch", label: "Magic Witch", image: halloweenWitch },
    ]
  },
  {
    name: "👑 Luxury & VIP",
    items: [
      { id: "luxury-vip", label: "VIP Lifestyle", image: luxuryVip },
      { id: "luxury-dubai", label: "Dubai Dream", image: luxuryDubai },
      { id: "luxury-royal", label: "Royal Queen", image: luxuryRoyal },
    ]
  },
  {
    name: "📸 Portrait & Professional",
    items: [
      { id: "portrait-business", label: "Business Pro", image: portraitBusiness },
      { id: "portrait-artistic", label: "Artistic", image: portraitArtistic },
      { id: "glamour-hollywood", label: "Hollywood Star", image: glamourHollywood },
    ]
  },
  {
    name: "⭐ Celebrity & Star",
    items: [
      { id: "star-popstar", label: "Pop Star", image: starPopstar },
      { id: "star-movie", label: "Movie Star", image: starMovie },
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
    ]
  },
  {
    name: "📼 Retro & Vintage",
    items: [
      { id: "retro-80s", label: "80s Neon", image: retro80s },
      { id: "retro-50s", label: "50s Classic", image: retro50s },
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
    ]
  },
  {
    name: "🎨 Art & Creative",
    items: [
      { id: "art-painting", label: "Oil Painting", image: artPainting },
      { id: "art-popart", label: "Pop Art", image: artPopart },
      { id: "art-anime", label: "Anime Style", image: artAnime },
    ]
  },
  {
    name: "✈️ Travel & Adventure",
    items: [
      { id: "travel-paris", label: "Paris Dream", image: travelParis },
      { id: "travel-safari", label: "Safari Adventure", image: travelSafari },
    ]
  },
  {
    name: "🎉 Party & Celebration",
    items: [
      { id: "party-birthday", label: "Birthday Party", image: partyBirthday },
      { id: "party-club", label: "VIP Club", image: partyClub },
    ]
  },
  {
    name: "💒 Wedding",
    items: [
      { id: "wedding-bride", label: "Beautiful Bride", image: weddingBride },
      { id: "wedding-groom", label: "Elegant Groom", image: weddingGroom },
    ]
  },
  {
    name: "🚀 Futuristic & Sci-Fi",
    items: [
      { id: "future-cyberpunk", label: "Cyberpunk", image: futureCyberpunk },
      { id: "future-space", label: "Space Explorer", image: futureSpace },
    ]
  },
  {
    name: "🎵 Music & Stage",
    items: [
      { id: "music-dj", label: "Famous DJ", image: musicDj },
      { id: "music-rockstar", label: "Rock Star", image: musicRockstar },
    ]
  },
  {
    name: "🐕 Pets & Animals",
    items: [
      { id: "pets-dog", label: "With Puppy", image: petsDog },
      { id: "pets-cat", label: "Cat Lover", image: petsCat },
    ]
  },
  {
    name: "🦇 Gothic & Dark",
    items: [
      { id: "gothic-dark", label: "Dark Queen", image: gothicDark },
    ]
  },
  {
    name: "⚙️ Steampunk",
    items: [
      { id: "steampunk-inventor", label: "Inventor", image: steampunkInventor },
    ]
  },
  {
    name: "⚔️ Historical Warriors",
    items: [
      { id: "viking-warrior", label: "Viking", image: vikingWarrior },
      { id: "pirate-captain", label: "Pirate Captain", image: pirateCaptain },
    ]
  },
  {
    name: "🤠 Western",
    items: [
      { id: "western-cowboy", label: "Cowboy", image: westernCowboy },
    ]
  },
  {
    name: "👨‍🍳 Culinary",
    items: [
      { id: "chef-gourmet", label: "Gourmet Chef", image: chefGourmet },
    ]
  },
  {
    name: "🧘 Zen & Spiritual",
    items: [
      { id: "zen-meditation", label: "Meditation", image: zenMeditation },
      { id: "underwater-diver", label: "Deep Sea", image: underwaterDiver },
    ]
  },
];

const CREDIT_PACKAGES = [
  { id: "5", credits: 5, price: 3, popular: false },
  { id: "10", credits: 10, price: 6, popular: true },
  { id: "20", credits: 20, price: 15, popular: false, bestValue: true },
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
                        className={`relative rounded-xl overflow-hidden transition-all duration-200 border-2 group ${
                          selectedTransformation === item.id
                            ? "border-primary scale-105 shadow-lg ring-2 ring-primary/50"
                            : "border-border hover:border-primary/50 hover:scale-[1.02]"
                        }`}
                      >
                        <div className="aspect-square relative">
                          <img 
                            src={item.image} 
                            alt={item.label}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          <span className="absolute bottom-2 left-2 right-2 text-xs font-medium text-white text-center">
                            {item.label}
                          </span>
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

            <div className="mt-6 pt-4 border-t">
              <Button
                onClick={() => transformMutation.mutate()}
                disabled={
                  transformMutation.isPending || 
                  isUploading || 
                  !selectedTransformation || 
                  (!imageUrl && !imageFile) ||
                  (credits?.credits_remaining || 0) < 1
                }
                className="w-full h-12 text-lg bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
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
              
              {(credits?.credits_remaining || 0) < 1 && (
                <p className="text-sm text-destructive text-center mt-2">
                  You need at least 1 credit to transform photos
                </p>
              )}
            </div>
          </Card>

          {transformedImage && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Your Transformed Photo
              </h2>
              <div className="relative aspect-square max-w-lg mx-auto rounded-xl overflow-hidden shadow-2xl">
                <img 
                  src={transformedImage} 
                  alt="Transformed" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2 justify-center mt-4">
                <Button asChild>
                  <a href={transformedImage} download target="_blank" rel="noopener noreferrer">
                    Download Image
                  </a>
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-purple-500/5">
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
                  className={`w-full p-4 rounded-xl border-2 transition-all hover:scale-[1.02] hover:shadow-lg ${
                    pkg.popular 
                      ? "border-primary bg-primary/10" 
                      : pkg.bestValue 
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <div className="font-bold text-lg">{pkg.credits} Credits</div>
                      <div className="text-2xl font-bold">€{pkg.price}</div>
                    </div>
                    <div className="text-right">
                      {pkg.popular && (
                        <Badge className="bg-primary">Most Popular</Badge>
                      )}
                      {pkg.bestValue && (
                        <Badge className="bg-amber-500">Best Value</Badge>
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
                {history.slice(0, 6).map((item: any) => (
                  <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden">
                    <img 
                      src={item.transformed_image_url || item.original_image_url} 
                      alt="Transformation" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute bottom-1 left-1 text-xs text-white/80 capitalize">
                      {item.transformation_type?.replace(/-/g, " ")}
                    </span>
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
