import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";

export default function FashionMarketplace() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Fashion Marketplace
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Marketplace funkcia bude dostupná čoskoro. Budete môcť predávať svoje dizajny!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}