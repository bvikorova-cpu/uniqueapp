import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Gavel } from "lucide-react";
import AuctionsList from "./AuctionsList";
import TradesList from "./TradesList";

interface CollectiblesMarketplaceProps {
  userId: string;
}

export default function CollectiblesMarketplace({ userId }: CollectiblesMarketplaceProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-subtle p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Marketplace</h2>
        <p className="text-muted-foreground">
          Trade with other players or auction rare items
        </p>
      </div>

      <Tabs defaultValue="auctions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="auctions" className="gap-2">
            <Gavel className="h-4 w-4" />
            Auctions
          </TabsTrigger>
          <TabsTrigger value="trades" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Trades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="auctions">
          <AuctionsList userId={userId} />
        </TabsContent>

        <TabsContent value="trades">
          <TradesList userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}