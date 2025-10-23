import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Gavel } from "lucide-react";

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
          <Card className="p-12 text-center">
            <Gavel className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Auction system coming soon!
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="trades">
          <Card className="p-12 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Trading system coming soon!
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}