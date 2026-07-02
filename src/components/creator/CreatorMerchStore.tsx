import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, Package, Download, Loader2 } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface MerchItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  stock_quantity: number | null;
  is_digital: boolean;
}

interface CreatorMerchStoreProps {
  creatorId: string;
}

export function CreatorMerchStore({ creatorId }: CreatorMerchStoreProps) {
  const { toast } = useToast();
  const [merch, setMerch] = useState<MerchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    loadMerch();
  }, [creatorId]);

  const loadMerch = async () => {
    try {
      const { data, error } = await supabase
        .from("creator_merch")
        .select("*")
        .eq("creator_id", creatorId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMerch(data || []);
    } catch (error) {
      console.error("Error loading merch:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (item: MerchItem) => {
    setPurchasingId(item.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Sign In Required",
          description: "Please sign in to purchase merch",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-merch-checkout", {
        body: { merchId: item.id },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPurchasingId(null);
    }
  };

  if (loading) {
    return (
    <>
      <FloatingHowItWorks title={"Creator Merch Store - How it works"} steps={[{ title: 'Open', desc: 'Access the Creator Merch Store section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Creator Merch Store.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
  }

  if (merch.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          Merch Store
        </CardTitle>
        <CardDescription>Support the creator with exclusive merchandise</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {merch.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              {item.image_url ? (
                <div className="aspect-square relative">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {item.is_digital && (
                    <Badge className="absolute top-2 right-2" variant="secondary">
                      <Download className="h-3 w-3 mr-1" />
                      Digital
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <CardContent className="p-4">
                <h3 className="font-semibold truncate">{item.name}</h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-lg">€{item.price}</span>
                  {item.stock_quantity !== null && item.stock_quantity <= 5 && (
                    <Badge variant="destructive" className="text-xs">
                      Only {item.stock_quantity} left
                    </Badge>
                  )}
                </div>
                <Button
                  onClick={() => handlePurchase(item)}
                  disabled={purchasingId === item.id || (item.stock_quantity !== null && item.stock_quantity === 0)}
                  className="w-full mt-3"
                  size="sm"
                >
                  {purchasingId === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : item.stock_quantity === 0 ? (
                    "Sold Out"
                  ) : (
                    "Buy Now"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
