import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sparkles, Box, Store, Users } from "lucide-react";
import GenerateCollectible from "@/components/collectibles/GenerateCollectible";
import MyCollection from "@/components/collectibles/MyCollection";
import MysteryBoxes from "@/components/collectibles/MysteryBoxes";
import CollectiblesMarketplace from "@/components/collectibles/CollectiblesMarketplace";

export default function Collectibles() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

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
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="h-8 w-8" />
              Collectibles
            </h1>
            <p className="text-muted-foreground mt-2">
              Collect unique AI-generated items, open mystery boxes and trade with others
            </p>
          </div>
        </div>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="generate" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="collection" className="gap-2">
              <Box className="h-4 w-4" />
              My Collection
            </TabsTrigger>
            <TabsTrigger value="mystery" className="gap-2">
              <Store className="h-4 w-4" />
              Mystery Boxes
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="gap-2">
              <Users className="h-4 w-4" />
              Marketplace
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
        </Tabs>
      </div>
    </div>
  );
}