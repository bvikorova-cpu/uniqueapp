import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const SHOP_ITEMS = [
  { name: "Pro Helmet", type: "helmet", rarity: "common", throwing_boost: 0, rushing_boost: 0, blocking_boost: 2, speed_boost: 0, stamina_boost: 3, price: 300 },
  { name: "Elite Cleats", type: "cleats", rarity: "rare", throwing_boost: 0, rushing_boost: 3, blocking_boost: 0, speed_boost: 5, stamina_boost: 0, price: 500 },
  { name: "Padded Gloves", type: "gloves", rarity: "common", throwing_boost: 3, rushing_boost: 0, blocking_boost: 0, speed_boost: 0, stamina_boost: 0, price: 250 },
  { name: "Receiver Gloves", type: "gloves", rarity: "rare", throwing_boost: 0, rushing_boost: 0, blocking_boost: 0, speed_boost: 2, stamina_boost: 0, price: 400 },
  { name: "Shoulder Pads Pro", type: "pads", rarity: "epic", throwing_boost: 0, rushing_boost: 2, blocking_boost: 5, speed_boost: 0, stamina_boost: 3, price: 1000 },
  { name: "Championship Full Kit", type: "kit", rarity: "legendary", throwing_boost: 4, rushing_boost: 4, blocking_boost: 4, speed_boost: 4, stamina_boost: 4, price: 3000 },
];

export function EquipmentShop({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const buyItem = async (item: typeof SHOP_ITEMS[0]) => {
    if (!user) return;
    setLoading(item.name);
    try {
      const { data: coins } = await supabase.from("american_football_coins").select("*").eq("user_id", user.id).single();
      if (!coins || coins.balance < item.price) { toast.error("Not enough coins!"); return; }
      await supabase.from("american_football_coins").update({ balance: coins.balance - item.price, total_spent: coins.total_spent + item.price }).eq("user_id", user.id);
      await supabase.from("american_football_equipment").insert({ user_id: user.id, name: item.name, type: item.type, rarity: item.rarity, throwing_boost: item.throwing_boost, rushing_boost: item.rushing_boost, blocking_boost: item.blocking_boost, speed_boost: item.speed_boost, stamina_boost: item.stamina_boost, price: item.price });
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
                  {item.throwing_boost > 0 && `🏈+${item.throwing_boost} `}{item.rushing_boost > 0 && `🏃+${item.rushing_boost} `}{item.blocking_boost > 0 && `🛡️+${item.blocking_boost} `}{item.speed_boost > 0 && `⚡+${item.speed_boost} `}{item.stamina_boost > 0 && `❤️+${item.stamina_boost}`}
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
