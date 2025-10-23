import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCollectibles } from "@/hooks/useCollectibles";
import { Loader2, Package } from "lucide-react";

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
          You don't have any collectibles yet. Start by generating or opening a mystery box!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Collection</h2>
        <p className="text-muted-foreground">
          {myCollectibles.length} {myCollectibles.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myCollectibles.map((item: any) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square relative bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Package className="h-16 w-16 text-primary" />
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold mb-1">Collectible Item</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {item.acquired_method}
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <Badge variant="outline">
                  {item.acquired_method}
                </Badge>
                <span>
                  {new Date(item.acquired_at).toLocaleDateString('sk-SK')}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}