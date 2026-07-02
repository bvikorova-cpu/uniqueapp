import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCollectibles } from "@/hooks/useCollectibles";
import { useAICredits } from "@/hooks/useAICredits";
import { Loader2, Gift, Star, Crown, Sparkles, Diamond, Gem, Zap, Trophy, Flame } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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

  // Different icon and gradient for each box tier based on price
  const getBoxStyle = (price: number) => {
    if (price <= 100) {
      return {
        icon: Gift,
        gradient: "from-blue-500/20 to-blue-600/5",
        iconColor: "text-blue-500",
        borderColor: "border-blue-500/30"
      };
    } else if (price <= 250) {
      return {
        icon: Star,
        gradient: "from-purple-500/20 to-purple-600/5",
        iconColor: "text-purple-500",
        borderColor: "border-purple-500/30"
      };
    } else if (price <= 500) {
      return {
        icon: Crown,
        gradient: "from-amber-500/20 to-amber-600/5",
        iconColor: "text-amber-500",
        borderColor: "border-amber-500/30"
      };
    } else if (price <= 700) {
      return {
        icon: Trophy,
        gradient: "from-emerald-500/20 to-emerald-600/5",
        iconColor: "text-emerald-500",
        borderColor: "border-emerald-500/30"
      };
    } else if (price <= 1000) {
      return {
        icon: Diamond,
        gradient: "from-cyan-500/20 to-cyan-600/5",
        iconColor: "text-cyan-500",
        borderColor: "border-cyan-500/30"
      };
    } else if (price <= 1500) {
      return {
        icon: Crown,
        gradient: "from-rose-500/20 to-rose-600/5",
        iconColor: "text-rose-500",
        borderColor: "border-rose-500/30"
      };
    } else if (price <= 2500) {
      return {
        icon: Sparkles,
        gradient: "from-indigo-500/20 to-indigo-600/5",
        iconColor: "text-indigo-500",
        borderColor: "border-indigo-500/30"
      };
    } else if (price <= 4000) {
      return {
        icon: Gem,
        gradient: "from-fuchsia-500/20 to-fuchsia-600/5",
        iconColor: "text-fuchsia-500",
        borderColor: "border-fuchsia-500/30"
      };
    } else if (price <= 5500) {
      return {
        icon: Zap,
        gradient: "from-orange-500/20 to-orange-600/5",
        iconColor: "text-orange-500",
        borderColor: "border-orange-500/30"
      };
    } else {
      return {
        icon: Flame,
        gradient: "from-gradient-start/30 via-gradient-middle/20 to-gradient-end/10",
        iconColor: "text-primary",
        borderColor: "border-primary/50"
      };
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Mystery Boxes - How it works"} steps={[{ title: 'Open', desc: 'Access the Mystery Boxes section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Mystery Boxes.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="bg-gradient-subtle p-4 sm:p-6 rounded-lg">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Mystery Boxes</h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-3">
          Open a mystery box to receive a random collectible! Each box has different rarity odds - higher price means better chances for rare items.
        </p>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span>Click "Open" on any box to try your luck!</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {mysteryBoxes?.map((box) => {
          const boxPrice = box.price;
          const canAfford = credits && credits.credits_remaining >= boxPrice;
          const isOpening = selectedBox?.id === box.id;
          const { icon: BoxIcon, gradient, iconColor, borderColor } = getBoxStyle(boxPrice);

          return (
            <Card key={box.id} className={`overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 ${borderColor}`}>
              <div className={`aspect-square relative bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <BoxIcon className={`h-12 w-12 sm:h-16 sm:w-16 lg:h-24 lg:w-24 ${iconColor} animate-pulse`} />
                {boxPrice >= 2500 && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-[10px] sm:text-xs bg-primary/20 text-primary">
                      Premium
                    </Badge>
                  </div>
                )}
              </div>

              <div className="p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3">
                <div>
                  <h3 className="font-bold text-xs sm:text-sm lg:text-lg leading-tight">{box.name}</h3>
                  <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground line-clamp-2">{box.description}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-bold text-sm sm:text-base lg:text-lg">{boxPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground text-right">credits</p>
                </div>

                <Button
                  onClick={() => handleOpenBox(box)}
                  disabled={!canAfford || isOpening}
                  className="w-full gap-1 sm:gap-2 text-xs sm:text-sm"
                  size="sm"
                >
                  {isOpening ? (
                    <>
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      <span className="hidden sm:inline">Opening...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : !canAfford ? (
                    <span className="text-[10px] sm:text-xs">Not enough credits</span>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
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
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl sm:text-2xl">Congratulations! 🎉</DialogTitle>
          </DialogHeader>
          
          {reward && (
            <div className="space-y-4">
              <div className="aspect-square relative rounded-lg overflow-hidden max-w-[250px] mx-auto">
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
                <h3 className="font-bold text-lg sm:text-xl mb-2">
                  {reward.userCollectible?.collectibles?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
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

      <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
        <p className="text-sm sm:text-base font-medium">
          Your Credits: <span className="text-lg sm:text-xl font-bold text-primary">{credits?.credits_remaining?.toLocaleString() || 0}</span>
        </p>
      </div>
    </div>
    </>
  );
}
