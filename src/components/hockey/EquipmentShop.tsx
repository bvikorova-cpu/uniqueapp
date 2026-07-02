import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { spendSportCoins } from "@/lib/sportCoins";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const SHOP_ITEMS = [
  { name: "Pro Hockey Skates", type: "skates", rarity: "common", skating_boost: 3, shooting_boost: 0, defense_boost: 0, speed_boost: 2, price: 300 },
  { name: "Carbon Fiber Stick", type: "stick", rarity: "rare", skating_boost: 0, shooting_boost: 5, defense_boost: 0, speed_boost: 0, price: 500 },
  { name: "Elite Shoulder Pads", type: "pads", rarity: "rare", skating_boost: 0, shooting_boost: 0, defense_boost: 4, speed_boost: 1, price: 600 },
  { name: "Pro Goalie Mask", type: "helmet", rarity: "epic", skating_boost: 0, shooting_boost: 0, defense_boost: 5, speed_boost: 0, price: 800 },
  { name: "Championship Gloves", type: "gloves", rarity: "epic", skating_boost: 2, shooting_boost: 3, defense_boost: 2, speed_boost: 2, price: 1000 },
  { name: "Legend's Full Kit", type: "kit", rarity: "legendary", skating_boost: 5, shooting_boost: 4, defense_boost: 4, speed_boost: 5, price: 3000 },
];

export function EquipmentShop({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const buyItem = async (item: typeof SHOP_ITEMS[0]) => {
    if (!user) return;
    setLoading(item.name);
    try {
      const { data: coins } = await supabase.from("hockey_coins").select("*").eq("user_id", user.id).single();
      if (!coins || coins.balance < item.price) { toast.error("Not enough coins!"); return; }
      await supabase.from("hockey_coins").update({ balance: coins.balance - item.price, total_spent: coins.total_spent + item.price }).eq("user_id", user.id);
      await supabase.from("hockey_equipment").insert({ user_id: user.id, name: item.name, type: item.type, rarity: item.rarity, skating_boost: item.skating_boost, shooting_boost: item.shooting_boost, defense_boost: item.defense_boost, speed_boost: item.speed_boost, price: item.price });
      toast.success(`Bought ${item.name}!`);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(null); }
  };

  const rarityColor = (r: string) => r === "legendary" ? "text-amber-400" : r === "epic" ? "text-purple-400" : r === "rare" ? "text-blue-400" : "text-muted-foreground";

  return (
    <>
      <FloatingHowItWorks title={"Equipment Shop - How it works"} steps={[{ title: 'Open', desc: 'Access the Equipment Shop section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Equipment Shop.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
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
                  {item.skating_boost > 0 && `⛸️+${item.skating_boost} `}{item.shooting_boost > 0 && `🏒+${item.shooting_boost} `}{item.defense_boost > 0 && `🛡️+${item.defense_boost} `}{item.speed_boost > 0 && `🏃+${item.speed_boost}`}
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
