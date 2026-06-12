import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { GlamourHero } from "@/components/glamour-world/GlamourHero";
import { GlamourEngagement } from "@/components/glamour-world/GlamourEngagement";
import { GlamourToolCard } from "@/components/glamour-world/GlamourToolCard";
import { DreamHouseBuilder } from "@/components/glamour-world/DreamHouseBuilder";
import { FashionCloset } from "@/components/glamour-world/FashionCloset";
import { AccessoryDesigner } from "@/components/glamour-world/AccessoryDesigner";
import { PetSalon } from "@/components/glamour-world/PetSalon";
import { MakeupStudio } from "@/components/glamour-world/MakeupStudio";
import { StoryCreator } from "@/components/glamour-world/StoryCreator";
import { NailArtStudio } from "@/components/glamour-world/NailArtStudio";
import { RoomDecorator } from "@/components/glamour-world/RoomDecorator";
import { BraceletMaker } from "@/components/glamour-world/BraceletMaker";
import { TeaPartyPlanner } from "@/components/glamour-world/TeaPartyPlanner";
import { PrincessAcademy } from "@/components/glamour-world/PrincessAcademy";
import { DanceStudio } from "@/components/glamour-world/DanceStudio";
import { GardenDesigner } from "@/components/glamour-world/GardenDesigner";
import { PhotoBooth } from "@/components/glamour-world/PhotoBooth";
import { DiaryJournal } from "@/components/glamour-world/DiaryJournal";
import { RecipeBaker } from "@/components/glamour-world/RecipeBaker";
import { TalentShow } from "@/components/glamour-world/TalentShow";
import { MusicBox } from "@/components/glamour-world/MusicBox";
import { TreasureHunt } from "@/components/glamour-world/TreasureHunt";
import { HairStylist } from "@/components/glamour-world/HairStylist";
import { CoinShop } from "@/components/glamour-world/CoinShop";
import { GlamourCoinsBadge } from "@/components/glamour-world/GlamourCoinsBadge";
import { BarbieCreator3D } from "@/components/glamour-world/BarbieCreator3D";
import { GlamourPokiGame } from "@/components/glamour-world/GlamourPokiGame";
import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import {
  Home, Shirt, Gem, PawPrint, Sparkles, BookOpen, Scissors,
  Palette, Crown, Music, Camera, Flower, PartyPopper, GraduationCap,
  Coins, Map, NotebookPen, CakeSlice, Mic2, Star, User, Gamepad2
} from "lucide-react";

type ViewType = "hub" | "dream-house" | "fashion" | "accessories" | "pet-salon" | "makeup" | "stories" | "nails" | "room" | "bracelets" | "party" | "academy" | "dance" | "garden" | "photo" | "diary" | "recipes" | "talent" | "music" | "treasure" | "hair" | "coins" | "barbie-creator" | "poki-fashion" | "poki-makeup" | "poki-cooking" | "poki-princess";

const tools: { id: ViewType; icon: any; title: string; description: string; badge?: string; credits?: number; gradient: string }[] = [
  { id: "barbie-creator", icon: User, title: "3D Doll Creator", description: "Create your perfect doll in stunning 3D", badge: "3D", gradient: "from-pink-500/10 to-fuchsia-500/5" },
  { id: "dream-house", icon: Home, title: "Dream House Builder", description: "Design your perfect dream house room by room", badge: "AI", credits: 5, gradient: "from-pink-500/10 to-purple-500/5" },
  { id: "fashion", icon: Shirt, title: "Fashion Closet", description: "Get AI-designed outfits for every occasion", badge: "AI", credits: 4, gradient: "from-fuchsia-500/10 to-pink-500/5" },
  { id: "accessories", icon: Gem, title: "Accessory Designer", description: "Create stunning tiaras, necklaces & more", badge: "AI", credits: 3, gradient: "from-rose-500/10 to-pink-500/5" },
  { id: "pet-salon", icon: PawPrint, title: "Pet Salon", description: "Adopt and groom your virtual pets", badge: "AI", credits: 4, gradient: "from-pink-500/10 to-rose-500/5" },
  { id: "makeup", icon: Sparkles, title: "Makeup Studio", description: "Magical makeup tutorials & looks", badge: "AI", credits: 4, gradient: "from-rose-500/10 to-fuchsia-500/5" },
  { id: "stories", icon: BookOpen, title: "Story Creator", description: "Write enchanting fairy tales", badge: "AI", credits: 5, gradient: "from-purple-500/10 to-pink-500/5" },
  { id: "nails", icon: Scissors, title: "Nail Art Studio", description: "Get stunning nail art designs", badge: "AI", credits: 3, gradient: "from-rose-500/10 to-pink-500/5" },
  { id: "room", icon: Palette, title: "Room Decorator", description: "Design your dream bedroom", badge: "AI", credits: 4, gradient: "from-purple-500/10 to-violet-500/5" },
  { id: "hair", icon: Crown, title: "Hair Stylist", description: "Beautiful hairstyle tutorials", badge: "AI", credits: 3, gradient: "from-pink-500/10 to-purple-500/5" },
  { id: "dance", icon: Music, title: "Dance Studio", description: "Learn amazing choreographies", badge: "AI", credits: 4, gradient: "from-fuchsia-500/10 to-pink-500/5" },
  { id: "bracelets", icon: Star, title: "Bracelet Maker", description: "Create friendship bracelets & jewelry", badge: "AI", credits: 3, gradient: "from-pink-500/10 to-amber-500/5" },
  { id: "party", icon: PartyPopper, title: "Party Planner", description: "Plan the most magical parties", badge: "AI", credits: 4, gradient: "from-pink-500/10 to-purple-500/5" },
  { id: "academy", icon: GraduationCap, title: "Princess Academy", description: "Learn the arts of royalty", badge: "AI", credits: 4, gradient: "from-purple-500/10 to-pink-500/5" },
  { id: "garden", icon: Flower, title: "Garden Designer", description: "Create magical fairy gardens", badge: "AI", credits: 3, gradient: "from-pink-500/10 to-green-500/5" },
  { id: "photo", icon: Camera, title: "Photo Booth", description: "Magical photo shoot concepts", badge: "AI", credits: 3, gradient: "from-pink-500/10 to-purple-500/5" },
  { id: "diary", icon: NotebookPen, title: "Magic Diary", description: "AI best friend diary companion", badge: "AI", credits: 3, gradient: "from-pink-500/10 to-purple-500/5" },
  { id: "recipes", icon: CakeSlice, title: "Recipe Baker", description: "Create magical sweet recipes", badge: "AI", credits: 3, gradient: "from-pink-500/10 to-orange-500/5" },
  { id: "talent", icon: Mic2, title: "Talent Show", description: "Plan amazing performances", badge: "AI", credits: 4, gradient: "from-purple-500/10 to-pink-500/5" },
  { id: "music", icon: Music, title: "Music Box", description: "Write your own magical songs", badge: "AI", credits: 4, gradient: "from-pink-500/10 to-violet-500/5" },
  { id: "treasure", icon: Map, title: "Treasure Hunt", description: "Create treasure hunts with riddles", badge: "AI", credits: 4, gradient: "from-amber-500/10 to-pink-500/5" },
  { id: "coins", icon: Coins, title: "Coin Shop", description: "Buy coins to unlock all features", gradient: "from-yellow-500/10 to-pink-500/5" },
  { id: "poki-fashion", icon: Gamepad2, title: "👗 Fashion Battle ↗", description: "Play Fashion Battle on Poki.com", badge: "POKI", gradient: "from-purple-500/10 to-pink-500/5" },
  { id: "poki-makeup", icon: Gamepad2, title: "💄 Makeup Salon ↗", description: "Play Makeup Salon on Poki.com", badge: "POKI", gradient: "from-pink-500/10 to-rose-500/5" },
  { id: "poki-cooking", icon: Gamepad2, title: "🧁 Cooking Games ↗", description: "Play cooking games on Poki.com", badge: "POKI", gradient: "from-orange-500/10 to-pink-500/5" },
  { id: "poki-princess", icon: Gamepad2, title: "👑 Princess Maker ↗", description: "Play princess games on Poki.com", badge: "POKI", gradient: "from-fuchsia-500/10 to-purple-500/5" },
];

const GlamourWorld = () => {
  const [activeView, setActiveView] = useState<ViewType>("hub");
  const back = () => setActiveView("hub");
  const { toast } = useToast();
  const qc = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (payment === "success") {
      toast({ title: "💰 Payment successful", description: "Your coins will appear in a few seconds." });
      setActiveView("coins");
      // Refresh balance after webhook fulfilment
      const t1 = setTimeout(() => qc.invalidateQueries({ queryKey: ["glamour-coins"] }), 2500);
      const t2 = setTimeout(() => qc.invalidateQueries({ queryKey: ["glamour-coins"] }), 6000);
      window.history.replaceState({}, "", "/glamour-world");
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    if (payment === "canceled") {
      toast({ title: "Payment canceled", variant: "destructive" });
      window.history.replaceState({}, "", "/glamour-world");
    }
  }, [toast, qc]);

  const viewMap: Record<string, JSX.Element> = {
    "dream-house": <DreamHouseBuilder onBack={back} />,
    "fashion": <FashionCloset onBack={back} />,
    "accessories": <AccessoryDesigner onBack={back} />,
    "pet-salon": <PetSalon onBack={back} />,
    "makeup": <MakeupStudio onBack={back} />,
    "stories": <StoryCreator onBack={back} />,
    "nails": <NailArtStudio onBack={back} />,
    "room": <RoomDecorator onBack={back} />,
    "bracelets": <BraceletMaker onBack={back} />,
    "party": <TeaPartyPlanner onBack={back} />,
    "academy": <PrincessAcademy onBack={back} />,
    "dance": <DanceStudio onBack={back} />,
    "garden": <GardenDesigner onBack={back} />,
    "photo": <PhotoBooth onBack={back} />,
    "diary": <DiaryJournal onBack={back} />,
    "recipes": <RecipeBaker onBack={back} />,
    "talent": <TalentShow onBack={back} />,
    "music": <MusicBox onBack={back} />,
    "treasure": <TreasureHunt onBack={back} />,
    "hair": <HairStylist onBack={back} />,
    "coins": <CoinShop onBack={back} />,
    "barbie-creator": <BarbieCreator3D onBack={back} />,
    "poki-fashion": <GlamourPokiGame onBack={back} slug="fashion-battle-dress-up" />,
    "poki-makeup": <GlamourPokiGame onBack={back} slug="makeup-salon" />,
    "poki-cooking": <GlamourPokiGame onBack={back} slug="cooking-fever" />,
    "poki-princess": <GlamourPokiGame onBack={back} slug="princess-maker" />,
  };

  if (activeView !== "hub" && viewMap[activeView]) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-28 md:pb-12 max-w-4xl">
        <div className="flex justify-end mb-4">
          <GlamourCoinsBadge onBuyClick={() => setActiveView("coins")} />
        </div>
        {viewMap[activeView]}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-28 md:pb-12 max-w-7xl">
      <div className="flex justify-end mb-4">
        <GlamourCoinsBadge onBuyClick={() => setActiveView("coins")} />
      </div>
      <GlamourHero />
      <HeroRewardedAd sectionKey="page_glamourworld" />

      <GlamourEngagement />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <GlamourToolCard
            key={tool.id}
            {...tool}
            onClick={() => setActiveView(tool.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default GlamourWorld;
