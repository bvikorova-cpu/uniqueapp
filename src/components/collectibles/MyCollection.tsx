import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCollectibles } from "@/hooks/useCollectibles";
import { Loader2 } from "lucide-react";

interface MyCollectionProps {
  userId: string;
}

export default function MyCollection({ userId }: MyCollectionProps) {
  const { myCollectibles, isLoadingMy } = useCollectibles(userId);

  if (isLoadingMy) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!myCollectibles || myCollectibles.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          Zatiaľ nemáš žiadne collectibles. Začni generovaním alebo otvorením mystery boxu!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Moja Kolekcia</h2>
        <p className="text-muted-foreground">
          {myCollectibles.length} {myCollectibles.length === 1 ? 'predmet' : 'predmetov'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myCollectibles.map((item: any) => {
          const collectible = item.collectibles;
          const rarity = collectible?.collectible_rarities;
          
          return (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative">
                <img
                  src={collectible?.image_url || '/placeholder.svg'}
                  alt={collectible?.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge 
                    style={{ 
                      backgroundColor: rarity?.color,
                      color: '#fff'
                    }}
                  >
                    {rarity?.name}
                  </Badge>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold mb-1">{collectible?.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {collectible?.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {collectible?.collectible_categories?.icon} {collectible?.collectible_categories?.name}
                  </span>
                  <span>
                    {new Date(item.acquired_at).toLocaleDateString('sk-SK')}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}