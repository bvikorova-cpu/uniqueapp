import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Handshake, Search, Plus, ArrowRightLeft } from "lucide-react";
import { useCollectibles } from "@/hooks/useCollectibles";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { userId: string; }

export default function CollectibleTradingHub({ userId }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const { myCollectibles } = useCollectibles(userId);

  return (
    <>
      <FloatingHowItWorks title={"Collectible Trading Hub - How it works"} steps={[{ title: 'Open', desc: 'Access the Collectible Trading Hub section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Collectible Trading Hub.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Handshake className="h-8 w-8 text-emerald-400" />
          <div>
            <h2 className="text-2xl font-bold">Trading Hub</h2>
            <p className="text-sm text-muted-foreground">Peer-to-peer trading with offer/counter-offer negotiation</p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse" className="gap-2 text-xs sm:text-sm"><Search className="h-3 w-3 sm:h-4 sm:w-4" /> Browse</TabsTrigger>
          <TabsTrigger value="my-trades" className="gap-2 text-xs sm:text-sm"><ArrowRightLeft className="h-3 w-3 sm:h-4 sm:w-4" /> My Trades</TabsTrigger>
          <TabsTrigger value="create" className="gap-2 text-xs sm:text-sm"><Plus className="h-3 w-3 sm:h-4 sm:w-4" /> Create</TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <div className="space-y-4">
            <Input placeholder="Search trades..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <Card className="p-8 text-center">
              <ArrowRightLeft className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No active trade offers yet. Be the first to create one!</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="my-trades">
          <Card className="p-8 text-center">
            <Handshake className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">You have no active trades</p>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-lg">Create Trade Offer</h3>
            <p className="text-sm text-muted-foreground">Select items from your collection to offer for trade</p>
            
            {myCollectibles && myCollectibles.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {myCollectibles.slice(0, 6).map(item => (
                  <Card key={item.id} className="p-3 cursor-pointer hover:border-primary transition-colors">
                    <p className="text-xs font-medium truncate">{item.collectible_type || "Collectible"}</p>
                    <Badge variant="outline" className="text-[10px] mt-1">{item.collectible_type || "Item"}</Badge>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No items in collection to trade</p>
            )}

            <Button className="w-full" disabled>Create Trade Offer</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}
