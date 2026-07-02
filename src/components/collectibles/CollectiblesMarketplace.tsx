import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Gavel, Store } from "lucide-react";
import AuctionsList from "./AuctionsList";
import TradesList from "./TradesList";
import BrowseListings from "./BrowseListings";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CollectiblesMarketplaceProps {
  userId: string;
}

export default function CollectiblesMarketplace({ userId }: CollectiblesMarketplaceProps) {
  return (
    <>
      <FloatingHowItWorks title={"Collectibles Marketplace - How it works"} steps={[{ title: 'Open', desc: 'Access the Collectibles Marketplace section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Collectibles Marketplace.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="bg-gradient-subtle p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Marketplace</h2>
        <p className="text-muted-foreground">
          Trade with other players or auction rare items
        </p>
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse" className="gap-2">
            <Store className="h-4 w-4" />
            Browse
          </TabsTrigger>
          <TabsTrigger value="auctions" className="gap-2">
            <Gavel className="h-4 w-4" />
            Auctions
          </TabsTrigger>
          <TabsTrigger value="trades" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Trades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <BrowseListings userId={userId} />
        </TabsContent>

        <TabsContent value="auctions">
          <AuctionsList userId={userId} />
        </TabsContent>

        <TabsContent value="trades">
          <TradesList userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}