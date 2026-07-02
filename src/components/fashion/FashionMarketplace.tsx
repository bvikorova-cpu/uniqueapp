import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Store, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export default function FashionMarketplace() {
  const queryClient = useQueryClient();
  const [selectedDesign, setSelectedDesign] = useState<any>(null);
  const [productType, setProductType] = useState<"digital" | "print">("digital");
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  const { data: myDesigns } = useQuery({
    queryKey: ['my-marketplace-designs'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('fashion_designs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    }
  });

  const { data: marketplaceListings, isLoading } = useQuery({
    queryKey: ['fashion-marketplace'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fashion_designs')
        .select(`*,fashion_categories(name),fashion_styles(name)`)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    }
  });

  const purchaseMutation = useMutation({
    mutationFn: async ({ designId, title, type }: { designId: string; title: string; type: string }) => {
      const { data, error } = await supabase.functions.invoke('create-fashion-marketplace-payment', {
        body: { productType: type, designId, designTitle: title }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
        setShowPurchaseDialog(false);
        toast.success("Redirecting to checkout...");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Error creating payment");
    }
  });

  const handlePurchase = () => {
    if (!selectedDesign) return;
    purchaseMutation.mutate({
      designId: selectedDesign.id,
      title: selectedDesign.title,
      type: productType
    });
  };

  return (
    <>
      <FloatingHowItWorks title="How Fashion Marketplace works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center space-y-2">
            <Store className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-semibold">Your Designs</h3>
            <p className="text-2xl font-bold">{myDesigns?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Available for sale</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center space-y-2">
            <TrendingUp className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-semibold">Marketplace</h3>
            <p className="text-2xl font-bold">{marketplaceListings?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Designs available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center space-y-2">
            <ShoppingBag className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-semibold">Pricing</h3>
            <div className="space-y-1">
              <p className="text-sm font-medium">Digital: €9.90</p>
              <p className="text-sm font-medium">Print: €19.90</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Browse Marketplace
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading designs...</div>
          ) : marketplaceListings && marketplaceListings.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketplaceListings.map((design) => (
                <Card key={design.id} className="group hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square overflow-hidden rounded-t-lg">
                    {design.image_url ? (
                      <img src={design.image_url} alt={design.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold truncate">{design.title}</h3>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{design.fashion_categories?.name}</Badge>
                      <Badge variant="outline">{design.fashion_styles?.name}</Badge>
                    </div>
                    <Dialog open={showPurchaseDialog && selectedDesign?.id === design.id} onOpenChange={(open) => {
                      setShowPurchaseDialog(open);
                      if (!open) setSelectedDesign(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button className="w-full" size="sm" onClick={() => setSelectedDesign(design)}>
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Purchase
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Purchase Design</DialogTitle>
                          <DialogDescription>Choose the format you want to purchase</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Product Type</Label>
                            <Select value={productType} onValueChange={(v: any) => setProductType(v)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="digital">Digital Download (€9.90)</SelectItem>
                                <SelectItem value="print">Print Ready (€19.90)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={handlePurchase} className="w-full" disabled={purchaseMutation.isPending}>
                            {purchaseMutation.isPending ? "Processing..." : "Proceed to Checkout"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No designs available yet</p>
              <p className="text-sm text-muted-foreground mt-2">Create and publish designs to see them here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
    );
}
