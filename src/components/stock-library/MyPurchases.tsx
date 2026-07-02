import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Purchase {
  id: string;
  download_url: string;
  created_at: string;
  price_paid_eur: number;
  resolution?: string;
  license_type?: string;
  stock_content_items: {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    file_url: string;
    content_type: string;
    category: string;
    resolutions?: Record<string, { url?: string; width?: number }> | null;
  };
}

export const MyPurchases = () => {
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-my-stock-purchases');
      
      if (error) throw error;
      setPurchases(data.purchases || []);
    } catch (error: any) {
      console.error("Error loading purchases:", error);
      toast({
        title: "Error",
        description: "Failed to load your purchases",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url: string, title: string) => {
    window.open(url, '_blank');
    toast({
      title: "Download Started",
      description: `Downloading ${title}`,
    });
  };

  if (loading) {
    return (
    <>
      <FloatingHowItWorks title={"My Purchases - How it works"} steps={[{ title: 'Open', desc: 'Access the My Purchases section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in My Purchases.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    </>
  );
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-12">
        <Download className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">You haven't purchased any content yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Browse the library and purchase content to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {purchases.map((purchase) => (
        <Card key={purchase.id} className="overflow-hidden">
          <div className="relative h-40 bg-secondary/20">
            {purchase.stock_content_items?.thumbnail_url ? (
              <img
                src={purchase.stock_content_items.thumbnail_url}
                alt={purchase.stock_content_items.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Badge variant="secondary">{purchase.stock_content_items?.content_type}</Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-1">{purchase.stock_content_items?.title}</h3>
            <p className="text-sm text-muted-foreground mb-1">
              Purchased: {new Date(purchase.created_at).toLocaleDateString()}
            </p>
            <div className="flex gap-1 mb-2 flex-wrap">
              {purchase.license_type && <Badge variant="outline" className="text-[10px] capitalize">{purchase.license_type}</Badge>}
              {purchase.resolution && <Badge variant="outline" className="text-[10px] capitalize">{purchase.resolution}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Paid: €{purchase.price_paid_eur?.toFixed(2)}
            </p>
            <Button
              className="w-full"
              onClick={() => {
                const res = purchase.resolution || 'original';
                const resUrl = purchase.stock_content_items?.resolutions?.[res]?.url;
                const url = purchase.download_url || resUrl || purchase.stock_content_items?.file_url;
                handleDownload(url, purchase.stock_content_items?.title);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Download {purchase.resolution ? `(${purchase.resolution})` : ''}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
