import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { spendSportCoins } from "@/lib/sportCoins";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const SHOP_ITEMS = [
  { name: "Pro Basketball Shoes", type: "shoes", rarity: "common", shooting_boost: 2, speed_boost: 3, defense_boost: 0, stamina_boost: 1, price: 300 },
  { name: "Elite Shooting Sleeve", type: "accessory", rarity: "rare", shooting_boost: 5, speed_boost: 0, defense_boost: 0, stamina_boost: 0, price: 500 },
  { name: "Carbon Fiber Knee Pad", type: "gear", rarity: "rare", shooting_boost: 0, speed_boost: 1, defense_boost: 4, stamina_boost: 3, price: 600 },
  { name: "Championship Headband", type: "accessory", rarity: "epic", shooting_boost: 3, speed_boost: 2, defense_boost: 2, stamina_boost: 3, price: 1000 },
  { name: "Legendary Air Max", type: "shoes", rarity: "legendary", shooting_boost: 4, speed_boost: 6, defense_boost: 2, stamina_boost: 4, price: 2000 },
  { name: "Hall of Fame Jersey", type: "jersey", rarity: "legendary", shooting_boost: 5, speed_boost: 3, defense_boost: 5, stamina_boost: 5, price: 3000 },
];

export function EquipmentShop({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const buyItem = async (item: typeof SHOP_ITEMS[0]) => {
    if (!user) return;
    setLoading(item.name);
    try {
      const spendRes = await spendSportCoins("basketball_coins", item.price);
      if (!spendRes.ok) { toast.error("Not enough coins!"); return; }
      await supabase.from("basketball_equipment").insert({ user_id: user.id, name: item.name, type: item.type, rarity: item.rarity, shooting_boost: item.shooting_boost, speed_boost: item.speed_boost, defense_boost: item.defense_boost, stamina_boost: item.stamina_boost, price: item.price });
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
                  {item.shooting_boost > 0 && `🎯+${item.shooting_boost} `}{item.speed_boost > 0 && `🏃+${item.speed_boost} `}{item.defense_boost > 0 && `🛡️+${item.defense_boost} `}{item.stamina_boost > 0 && `💪+${item.stamina_boost}`}
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
