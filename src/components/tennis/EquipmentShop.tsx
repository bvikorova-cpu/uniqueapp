import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const SHOP_ITEMS = [
  { name: "Pro Tennis Racket", type: "racket", rarity: "common", serve_boost: 3, speed_boost: 0, stamina_boost: 0, accuracy_boost: 2, price: 300 },
  { name: "Carbon Fiber Racket", type: "racket", rarity: "rare", serve_boost: 5, speed_boost: 0, stamina_boost: 0, accuracy_boost: 3, price: 600 },
  { name: "Court Shoes Pro", type: "shoes", rarity: "rare", serve_boost: 0, speed_boost: 5, stamina_boost: 2, accuracy_boost: 0, price: 500 },
  { name: "Compression Gear", type: "apparel", rarity: "common", serve_boost: 0, speed_boost: 2, stamina_boost: 4, accuracy_boost: 0, price: 400 },
  { name: "Champion Wristbands", type: "accessory", rarity: "epic", serve_boost: 2, speed_boost: 2, stamina_boost: 3, accuracy_boost: 3, price: 1000 },
  { name: "Grand Slam Full Kit", type: "kit", rarity: "legendary", serve_boost: 5, speed_boost: 5, stamina_boost: 4, accuracy_boost: 5, price: 3000 },
];

export function EquipmentShop({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const buyItem = async (item: typeof SHOP_ITEMS[0]) => {
    if (!user) return;
    setLoading(item.name);
    try {
      const { data: coins } = await supabase.from("tennis_coins").select("*").eq("user_id", user.id).single();
      if (!coins || coins.balance < item.price) { toast.error("Not enough coins!"); return; }
      await supabase.from("tennis_coins").update({ balance: coins.balance - item.price, total_spent: coins.total_spent + item.price }).eq("user_id", user.id);
      await supabase.from("tennis_equipment").insert({ user_id: user.id, name: item.name, type: item.type, rarity: item.rarity, serve_boost: item.serve_boost, speed_boost: item.speed_boost, stamina_boost: item.stamina_boost, accuracy_boost: item.accuracy_boost, price: item.price });
      toast.success(`Bought ${item.name}!`);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(null); }
  };

  const rarityColor = (r: string) => r === "legendary" ? "text-amber-400" : r === "epic" ? "text-purple-400" : r === "rare" ? "text-blue-400" : "text-muted-foreground";

  return (
    <><FloatingHowItWorks title="EquipmentShop — How it works" steps={[{title:"Open this section",desc:"Access EquipmentShop from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-primary" />Equipment Shop</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {SHOP_ITEMS.map(item => (
            <div key={item.name} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
              <div>
                <span className={`font-bold text-sm ${rarityColor(item.rarity)}`}>{item.name}</span>
                <span className="text-[10px] ml-2 uppercase text-muted-foreground">{item.rarity}</span>
                <div className="text-xs text-muted-foreground mt-1">
                  {item.serve_boost > 0 && `🎾+${item.serve_boost} `}{item.speed_boost > 0 && `🏃+${item.speed_boost} `}{item.stamina_boost > 0 && `❤️+${item.stamina_boost} `}{item.accuracy_boost > 0 && `🎯+${item.accuracy_boost}`}
                </div>
              </div>
              <Button size="sm" disabled={loading === item.name} onClick={() => buyItem(item)}>{item.price} coins</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </>
  );
}
