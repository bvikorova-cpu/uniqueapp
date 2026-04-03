import { useState } from "react";
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
import {
  Home, Shirt, Gem, PawPrint, Sparkles, BookOpen, Scissors,
  Palette, Crown, Music, Camera, Flower, PartyPopper, GraduationCap,
  Coins, Map, NotebookPen, CakeSlice, Mic2, Star
} from "lucide-react";

type ViewType = "hub" | "dream-house" | "fashion" | "accessories" | "pet-salon" | "makeup" | "stories" | "nails" | "room" | "bracelets" | "party" | "academy" | "dance" | "garden" | "photo" | "diary" | "recipes" | "talent" | "music" | "treasure" | "hair" | "coins";

const tools: { id: ViewType; icon: any; title: string; description: string; badge?: string; credits?: number; gradient: string }[] = [
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
];

const GlamourWorld = () => {
  const [activeView, setActiveView] = useState<ViewType>("hub");

  const viewMap: Record<string, JSX.Element> = {
    "dream-house": <DreamHouseBuilder onBack={() => setActiveView("hub")} />,
    "fashion": <FashionCloset onBack={() => setActiveView("hub")} />,
    "accessories": <AccessoryDesigner onBack={() => setActiveView("hub")} />,
    "pet-salon": <PetSalon onBack={() => setActiveView("hub")} />,
    "makeup": <MakeupStudio onBack={() => setActiveView("hub")} />,
    "stories": <StoryCreator onBack={() => setActiveView("hub")} />,
    "nails": <NailArtStudio onBack={() => setActiveView("hub")} />,
    "room": <RoomDecorator onBack={() => setActiveView("hub")} />,
    "bracelets": <BraceletMaker onBack={() => setActiveView("hub")} />,
    "party": <TeaPartyPlanner onBack={() => setActiveView("hub")} />,
    "academy": <PrincessAcademy onBack={() => setActiveView("hub")} />,
    "dance": <DanceStudio onBack={() => setActiveView("hub")} />,
    "garden": <GardenDesigner onBack={() => setActiveView("hub")} />,
    "photo": <PhotoBooth onBack={() => setActiveView("hub")} />,
    "diary": <DiaryJournal onBack={() => setActiveView("hub")} />,
    "recipes": <RecipeBaker onBack={() => setActiveView("hub")} />,
    "talent": <TalentShow onBack={() => setActiveView("hub")} />,
    "music": <MusicBox onBack={() => setActiveView("hub")} />,
    "treasure": <TreasureHunt onBack={() => setActiveView("hub")} />,
    "hair": <HairStylist onBack={() => setActiveView("hub")} />,
    "coins": <CoinShop onBack={() => setActiveView("hub")} />,
  };

  if (activeView !== "hub" && viewMap[activeView]) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {viewMap[activeView]}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <GlamourHero />
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
