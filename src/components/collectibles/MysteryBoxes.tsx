import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCollectibles } from "@/hooks/useCollectibles";
import { useAICredits } from "@/hooks/useAICredits";
import { Loader2, Package, Sparkles } from "lucide-react";

interface MysteryBoxesProps {
  userId: string;
}

export default function MysteryBoxes({ userId }: MysteryBoxesProps) {
  const [selectedBox, setSelectedBox] = useState<any>(null);
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [reward, setReward] = useState<any>(null);
  
  const { mysteryBoxes, openMysteryBox } = useCollectibles(userId);
  const { credits } = useAICredits();

  const handleOpenBox = async (box: any) => {
    setSelectedBox(box);
    
    try {
      const result = await openMysteryBox.mutateAsync(box.id);
      setReward(result);
      setShowRewardDialog(true);
    } catch (error) {
      console.error('Failed to open box:', error);
    } finally {
      setSelectedBox(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-subtle p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Mystery Boxes</h2>
        <p className="text-muted-foreground mb-3">
          Open a mystery box to receive a random collectible! Each box has different rarity odds - higher price means better chances for rare items.
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span>Click "Open" on any box to try your luck!</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mysteryBoxes?.map((box) => {
          const boxPrice = box.price;
          const canAfford = credits && credits.credits_remaining >= boxPrice;
          const isOpening = selectedBox?.id === box.id;

          return (
            <Card key={box.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Package className="h-24 w-24 text-primary" />
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-lg">{box.name}</h3>
                  <p className="text-sm text-muted-foreground">{box.description}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-semibold">{boxPrice} credits</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleOpenBox(box)}
                  disabled={!canAfford || isOpening}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isOpening ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Opening...
                    </>
                  ) : !canAfford ? (
                    <>
                      Not enough credits
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Open Box
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Congratulations! 🎉</DialogTitle>
          </DialogHeader>
          
          {reward && (
            <div className="space-y-4">
              <div className="aspect-square relative rounded-lg overflow-hidden">
                <img
                  src={reward.userCollectible?.collectibles?.image_url}
                  alt={reward.userCollectible?.collectibles?.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge
                    style={{
                      backgroundColor: reward.rarity?.color,
                      color: '#fff'
                    }}
                  >
                    {reward.rarity?.name}
                  </Badge>
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-bold text-xl mb-2">
                  {reward.userCollectible?.collectibles?.name}
                </h3>
                <p className="text-muted-foreground">
                  {reward.userCollectible?.collectibles?.description}
                </p>
              </div>

              <Button onClick={() => setShowRewardDialog(false)} className="w-full">
                Awesome!
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <p className="text-center text-sm text-muted-foreground">
        Available credits: {credits?.credits_remaining || 0}
      </p>
    </div>
  );
}