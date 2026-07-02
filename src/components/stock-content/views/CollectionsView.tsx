import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FolderOpen, ImageIcon, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface CollectionsViewProps {
  onBack: () => void;
}

interface Pack {
  id: string;
  title: string;
  description: string | null;
  content_count: number;
  content_type: string | null;
  price: number;
}

export function CollectionsView({ onBack }: CollectionsViewProps) {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sb: any = supabase;
      const { data } = await sb
        .from("creator_content_packs")
        .select("id, title, description, content_count, content_type, price")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(30);
      if (!cancelled) {
        setPacks(((data || []) as any[]).map((p: any) => ({
          id: p.id,
          title: p.title || "Untitled pack",
          description: p.description,
          content_count: Number(p.content_count) || 0,
          content_type: p.content_type,
          price: Number(p.price) || 0,
        })));
        setLoading(false);
      }
    })();
    return (
    <>
      <FloatingHowItWorks title={"Collections View - How it works"} steps={[{ title: 'Open', desc: 'Access the Collections View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Collections View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => {
      cancelled = true;
    };
  }, []);

  const buy = async (pack: Pack) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please log in first"); return; }
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { product_type: "stock_bundle", name: pack.title, amount: pack.price, bundle_id: pack.id },
      });
      if (error) throw error;
      if ((data as any)?.url) window.open((data as any).url, "_blank");
    } catch (e: any) {
      toast.error(e.message || "Checkout failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FolderOpen className="w-6 h-6 text-amber-500" /> Collections & Bundles
        </h2>
      </div>

      <Card className="p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <div className="flex items-center gap-3">
          <Package className="w-10 h-10 text-amber-500" />
          <div>
            <h3 className="text-lg font-bold">Save with Bundles</h3>
            <p className="text-sm text-muted-foreground">
              Curated collections of premium content at discounted prices.
            </p>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : packs.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          No bundles available yet. Check back soon!
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packs.map((p) => (
            <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="h-32 bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                <FolderOpen className="w-16 h-16 text-amber-500/50" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 truncate">{p.title}</h3>
                {p.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{p.description}</p>
                )}
                <div className="flex items-center gap-2 mb-3">
                  {p.content_type && <Badge variant="outline">{p.content_type}</Badge>}
                  <span className="text-sm text-muted-foreground flex items-center gap-0.5">
                    <ImageIcon className="w-3 h-3" /> {p.content_count} items
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black">€{p.price.toFixed(2)}</span>
                  <Button size="sm" onClick={() => buy(p)}>Buy Bundle</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
