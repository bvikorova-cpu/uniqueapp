import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingBag, Shirt, Disc3, Headphones } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const MerchStore = ({ onBack }: Props) => {
  const items = [
    { icon: Shirt, name: "Artist Tour T-Shirt", price: 34.99, category: "Clothing" },
    { icon: Disc3, name: "Limited Edition Vinyl", price: 49.99, category: "Music" },
    { icon: Headphones, name: "Branded Headphones", price: 79.99, category: "Gear" },
    { icon: ShoppingBag, name: "Concert Tote Bag", price: 19.99, category: "Accessories" },
  ];

  return (
    <>
      <FloatingHowItWorks title="How Merch Store works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>
      <div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Artist Merch Store</h2>
        <p className="text-muted-foreground text-sm mt-1">Exclusive merchandise from your favorite artists</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <Card key={item.name} className="group hover:shadow-xl transition-all border hover:border-primary">
            <CardContent className="p-5 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <item.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-sm mb-1">{item.name}</h3>
              <Badge variant="secondary" className="text-xs mb-2">{item.category}</Badge>
              <p className="text-lg font-black text-primary">€{item.price.toFixed(2)}</p>
              <Button size="sm" className="w-full mt-3" onClick={async () => {
                try {
                  const { supabase } = await import("@/integrations/supabase/client");
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) { toast.error("Login first"); return; }
                  const { data, error } = await supabase.functions.invoke("create-checkout", {
                    body: { product_type: "concert_merch", name: item.name, amount: item.price, category: item.category }
                  });
                  if (error) throw error;
                  if (data?.url) window.open(data.url, "_blank");
                } catch (e: any) { toast.error(e.message || "Checkout zlyhal"); }
              }}>
                <ShoppingBag className="h-4 w-4 mr-1" />Buy
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">More merchandise will be available as artists add their products. Artists earn 80% of every sale!</p>
        </CardContent>
      </Card>
    </div>
    </>
    );
};
