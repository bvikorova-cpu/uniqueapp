import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Image, Video, Package } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ContentPack {
  id: string;
  title: string;
  description: string | null;
  content_count: number;
  content_type: string;
  price: number;
  preview_urls: string[] | null;
}

interface CreatorContentPacksProps {
  creatorId: string;
  canPurchase: boolean;
}

export function CreatorContentPacks({ creatorId, canPurchase }: CreatorContentPacksProps) {
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPacks();
  }, [creatorId]);

  const loadPacks = async () => {
    try {
      const { data, error } = await supabase
        .from('creator_content_packs')
        .select('*')
        .eq('creator_id', creatorId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPacks(data || []);
    } catch (error: any) {
      console.error('Error loading packs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packId: string) => {
    setPurchasing(packId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to purchase content",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('purchase-content-pack', {
        body: { packId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Error purchasing pack:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start purchase",
      });
    } finally {
      setPurchasing(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'photos': return <Image className="h-5 w-5" />;
      case 'videos': return <Video className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading content packs...</div>;
  }

  if (packs.length === 0) {
    return null;
  }

  return (
    <>
      <FloatingHowItWorks title={"Creator Content Packs - How it works"} steps={[{ title: 'Open', desc: 'Access the Creator Content Packs section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Creator Content Packs.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <h3 className="text-2xl font-bold">Content Packs</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packs.map((pack) => (
          <Card key={pack.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getIcon(pack.content_type)}
                  {pack.title}
                </CardTitle>
                <Badge variant="secondary">
                  €{pack.price.toFixed(2)}
                </Badge>
              </div>
              <CardDescription>
                {pack.content_count} {pack.content_type}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pack.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {pack.description}
                </p>
              )}
              <Button
                onClick={() => handlePurchase(pack.id)}
                disabled={!canPurchase || purchasing === pack.id}
                className="w-full"
              >
                {purchasing === pack.id ? (
                  "Processing..."
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Purchase
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </>
  );
}
