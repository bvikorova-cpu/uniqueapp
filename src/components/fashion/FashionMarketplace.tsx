import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Store, TrendingUp, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function FashionMarketplace() {
  const navigate = useNavigate();
  const [showStoreDialog, setShowStoreDialog] = useState(false);

  const handleOpenStore = () => {
    setShowStoreDialog(true);
  };

  const handleBrowse = () => {
    toast.info("Browse feature coming soon!", {
      description: "Discover amazing fashion designs from creators worldwide"
    });
  };

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
              <Button variant="outline" className="w-full" onClick={handleOpenStore}>
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
              <Button variant="outline" className="w-full" onClick={handleBrowse}>
                Explore
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center py-8 border-t">
          <p className="text-muted-foreground mb-4">
            Start selling your fashion designs to a global audience
          </p>
          <Button size="lg" onClick={handleOpenStore}>
            Set Up Your Marketplace
          </Button>
        </div>
      </CardContent>

      <Dialog open={showStoreDialog} onOpenChange={setShowStoreDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Set Up Your Fashion Store</DialogTitle>
            <DialogDescription>
              Start selling your AI-generated fashion designs
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Package className="h-8 w-8 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">Create Product Listings</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload your fashion designs and set prices. We handle printing and shipping.
                      </p>
                      <Button variant="outline" size="sm">
                        Create Listing
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Store className="h-8 w-8 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">Customize Your Storefront</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Personalize your store with a unique URL and branding.
                      </p>
                      <Button variant="outline" size="sm" disabled>
                        Coming Soon
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <TrendingUp className="h-8 w-8 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">Earn Revenue</h3>
                      <p className="text-sm text-muted-foreground">
                        Get paid for every sale. We handle everything else.
                      </p>
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span>Your Earnings:</span>
                          <span className="font-semibold">70%</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span>Platform Fee:</span>
                          <span>30%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => {
                toast.success("Store setup in progress!");
                setShowStoreDialog(false);
              }}>
                Get Started
              </Button>
              <Button variant="outline" onClick={() => setShowStoreDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
