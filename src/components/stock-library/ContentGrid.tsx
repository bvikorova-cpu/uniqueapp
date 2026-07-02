import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Euro, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price_eur: number;
  content_type: string;
  category: string;
  total_downloads: number;
  tags: string[] | null;
  creator_id: string;
}

interface ContentGridProps {
  items: ContentItem[];
  onPurchase?: (itemId: string) => void;
}

export const ContentGrid = ({ items, onPurchase }: ContentGridProps) => {
  const { toast } = useToast();

  const handlePurchase = async (itemId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('purchase-stock-content', {
        body: { contentId: itemId }
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate purchase",
        variant: "destructive"
      });
    }
  };

  if (items.length === 0) {
    return (
    <>
      <FloatingHowItWorks title={"Content Grid - How it works"} steps={[{ title: 'Open', desc: 'Access the Content Grid section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Content Grid.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="text-center py-12">
        <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No content available yet</p>
      </div>
    </>
  );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative h-48 bg-secondary/20">
            {item.thumbnail_url ? (
              <img
                src={item.thumbnail_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            {/* Watermark overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="transform rotate-[-25deg] opacity-40">
                <span className="text-4xl font-bold text-foreground tracking-widest select-none"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                  UNIQUE
                </span>
              </div>
            </div>
            <div className="absolute top-2 right-2">
              <Badge variant="secondary">{item.content_type}</Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-1 line-clamp-1">{item.title}</h3>
            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {item.description}
              </p>
            )}
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline">{item.category}</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Download className="w-3 h-3" />
                {item.total_downloads}
              </div>
            </div>
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="text-xs bg-secondary/50 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="p-4 pt-0 flex items-center justify-between">
            <div className="flex items-center gap-1 font-bold text-lg">
              <Euro className="w-4 h-4" />
              {item.price_eur.toFixed(2)}
            </div>
            <Button onClick={() => onPurchase ? onPurchase(item.id) : handlePurchase(item.id)}>
              <Download className="w-4 h-4 mr-2" />
              Purchase
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};