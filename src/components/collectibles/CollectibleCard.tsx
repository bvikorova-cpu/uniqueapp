import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Cat, Dog, Compass, Wand2, Image, Trophy, Palette, Film, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CollectibleCardProps {
  collectible: any;
}

const typeIcons = {
  pet: Cat,
  artifact: Compass,
  card: Image,
  badge: Trophy
};

const categoryIcons: Record<string, any> = {
  "Pets - Dogs": Dog,
  "Pets - Cats": Cat,
  "Pets - Exotic": Sparkles,
  "Artifacts - Historical": Compass,
  "Artifacts - Sci-Fi": Sparkles,
  "Artifacts - Magical": Wand2,
  "Cards - Sports Stars": Trophy,
  "Cards - Fantasy": Wand2,
  "Cards - Art": Palette,
  "Cards - Pop Culture": Film
};

export default function CollectibleCard({ collectible }: CollectibleCardProps) {
  const TypeIcon = typeIcons[collectible.collectible_type as keyof typeof typeIcons] || Image;
  const CategoryIcon = categoryIcons[collectible.category_name] || Image;

  const getRarityColor = (rarity?: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Collectible Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Collectible Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Collectible Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {collectible.image_url ? (
        <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
          <img 
            src={collectible.image_url} 
            alt={collectible.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-square bg-gradient-subtle flex items-center justify-center">
          <CategoryIcon className="h-24 w-24 text-muted-foreground" />
        </div>
      )}

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{collectible.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{collectible.category_name}</p>
          </div>
          <TypeIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {collectible.rarity_name && (
            <Badge className={`${getRarityColor(collectible.rarity_name)} text-white text-xs`}>
              {collectible.rarity_name}
            </Badge>
          )}
          {collectible.is_evolved && (
            <Badge variant="outline" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Evolved
            </Badge>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          <div>Acquired {formatDistanceToNow(new Date(collectible.acquired_at), { addSuffix: true })}</div>
          {collectible.acquisition_method && (
            <div className="capitalize">via {collectible.acquisition_method.replace('_', ' ')}</div>
          )}
        </div>
      </div>
    </Card>
    </>
  );
}
