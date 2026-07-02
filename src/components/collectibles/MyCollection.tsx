import { Card } from "@/components/ui/card";
import { useCollectibles } from "@/hooks/useCollectibles";
import { Loader2 } from "lucide-react";
import CollectibleCard from "./CollectibleCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface MyCollectionProps {
  userId: string;
}

export default function MyCollection({ userId }: MyCollectionProps) {
  const { myCollectibles, isLoadingMy } = useCollectibles(userId);

  if (isLoadingMy) {
    return (
    <>
      <FloatingHowItWorks title={"My Collection - How it works"} steps={[{ title: 'Open', desc: 'Access the My Collection section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in My Collection.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </>
  );
  }

  if (!myCollectibles || myCollectibles.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          No collectibles yet. Start by generating your first one!
        </p>
      </Card>
    );
  }

  const filterByType = (type?: string) => {
    if (!type) return myCollectibles;
    return myCollectibles.filter(c => c.collectible_type === type);
  };

  const allItems = myCollectibles;
  const pets = filterByType('pet');
  const artifacts = filterByType('artifact');
  const cards = filterByType('card');
  const badges = filterByType('badge');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">My Collection</h2>
        <p className="text-muted-foreground">
          {myCollectibles.length} unique items
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({allItems.length})</TabsTrigger>
          <TabsTrigger value="pets">Pets ({pets.length})</TabsTrigger>
          <TabsTrigger value="artifacts">Artifacts ({artifacts.length})</TabsTrigger>
          <TabsTrigger value="cards">Cards ({cards.length})</TabsTrigger>
          <TabsTrigger value="badges">Badges ({badges.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {allItems.map((collectible) => (
              <CollectibleCard key={collectible.id} collectible={collectible} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pets" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pets.length > 0 ? (
              pets.map((collectible) => (
                <CollectibleCard key={collectible.id} collectible={collectible} />
              ))
            ) : (
              <Card className="col-span-full p-12 text-center">
                <p className="text-muted-foreground">No pets collected yet</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="artifacts" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {artifacts.length > 0 ? (
              artifacts.map((collectible) => (
                <CollectibleCard key={collectible.id} collectible={collectible} />
              ))
            ) : (
              <Card className="col-span-full p-12 text-center">
                <p className="text-muted-foreground">No artifacts collected yet</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="cards" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cards.length > 0 ? (
              cards.map((collectible) => (
                <CollectibleCard key={collectible.id} collectible={collectible} />
              ))
            ) : (
              <Card className="col-span-full p-12 text-center">
                <p className="text-muted-foreground">No cards collected yet</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="badges" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {badges.length > 0 ? (
              badges.map((collectible) => (
                <CollectibleCard key={collectible.id} collectible={collectible} />
              ))
            ) : (
              <Card className="col-span-full p-12 text-center">
                <p className="text-muted-foreground">No badges earned yet</p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}