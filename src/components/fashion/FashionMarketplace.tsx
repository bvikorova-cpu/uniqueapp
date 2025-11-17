import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Store, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function FashionMarketplace() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Fashion Marketplace
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center space-y-2">
              <Store className="h-8 w-8 mx-auto text-primary" />
              <h3 className="font-semibold">Sell Your Designs</h3>
              <p className="text-sm text-muted-foreground">
                Turn your AI-generated designs into products
              </p>
              <Button variant="outline" className="w-full">
                Open Store
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center space-y-2">
              <TrendingUp className="h-8 w-8 mx-auto text-primary" />
              <h3 className="font-semibold">Track Sales</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your earnings and popular items
              </p>
              <Badge variant="secondary">0 Sales</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center space-y-2">
              <ShoppingBag className="h-8 w-8 mx-auto text-primary" />
              <h3 className="font-semibold">Browse Designs</h3>
              <p className="text-sm text-muted-foreground">
                Discover designs from other creators
              </p>
              <Button variant="outline" className="w-full">
                Explore
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center py-8 border-t">
          <p className="text-muted-foreground mb-4">
            Start selling your fashion designs to a global audience
          </p>
          <Button size="lg">
            Set Up Your Marketplace
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}