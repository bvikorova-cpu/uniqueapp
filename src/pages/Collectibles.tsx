import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Box, Store, Users, Coins, Info, Star, Zap, CheckCircle } from "lucide-react";
import GenerateCollectible from "@/components/collectibles/GenerateCollectible";
import MyCollection from "@/components/collectibles/MyCollection";
import MysteryBoxes from "@/components/collectibles/MysteryBoxes";
import CollectiblesMarketplace from "@/components/collectibles/CollectiblesMarketplace";
import VipSubscription from "@/components/collectibles/VipSubscription";
import PurchaseHistory from "@/components/collectibles/PurchaseHistory";
import BuyCreditsDialog from "@/components/collectibles/BuyCreditsDialog";

export default function Collectibles() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showBuyDialog, setShowBuyDialog] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate("/auth");
      } else {
        setUser(data.user);
      }
    });
  }, [navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-8">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" />
              Collectibles
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Collect unique AI-generated items, open mystery boxes and trade with others
            </p>
          </div>
          <Button onClick={() => setShowBuyDialog(true)} size="lg" className="gap-2">
            <Coins className="h-5 w-5" />
            Buy Credits
          </Button>
        </div>

        <Card className="p-4 sm:p-6 mb-6 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border-purple-500/20">
          <div className="flex items-start gap-3 mb-4">
            <Info className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">What is Collectibles?</h3>
              <p className="text-sm text-muted-foreground">
                Collectibles is your AI-powered digital collectibles platform. Generate unique items using AI, open mystery boxes for rare finds, trade with other collectors, and build your exclusive collection of one-of-a-kind digital treasures.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                How to Use
              </h4>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                <li>• <strong>Generate:</strong> Create unique AI items (10 credits)</li>
                <li>• <strong>My Collection:</strong> View and manage your items</li>
                <li>• <strong>Mystery Boxes:</strong> Open boxes for random rewards</li>
                <li>• <strong>Marketplace:</strong> Buy/sell items with others</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-500" />
                Key Features
              </h4>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> AI-generated unique collectibles</li>
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Mystery boxes with rare items</li>
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Trade marketplace for collectors</li>
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> VIP membership for exclusive perks</li>
              </ul>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-background/50 rounded-lg p-3">
            <strong>Tip:</strong> Start by generating your first collectible, then explore mystery boxes for surprise items. VIP members get exclusive bonuses and discounts!
          </div>
        </Card>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-1 h-auto p-1">
            <TabsTrigger value="generate" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-2">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="collection" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-2">
              <Box className="h-3 w-3 sm:h-4 sm:w-4" />
              Collection
            </TabsTrigger>
            <TabsTrigger value="mystery" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-2">
              <Store className="h-3 w-3 sm:h-4 sm:w-4" />
              Mystery
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-2">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              Market
            </TabsTrigger>
            <TabsTrigger value="vip" className="gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-2">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              VIP
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <GenerateCollectible userId={user.id} />
          </TabsContent>

          <TabsContent value="collection">
            <MyCollection userId={user.id} />
          </TabsContent>

          <TabsContent value="mystery">
            <MysteryBoxes userId={user.id} />
          </TabsContent>

          <TabsContent value="marketplace">
            <CollectiblesMarketplace userId={user.id} />
          </TabsContent>

          <TabsContent value="vip">
            <div className="grid gap-6 md:grid-cols-2">
              <VipSubscription />
              <PurchaseHistory userId={user.id} />
            </div>
          </TabsContent>
        </Tabs>

        <BuyCreditsDialog open={showBuyDialog} onOpenChange={setShowBuyDialog} />
      </div>
    </div>
  );
}