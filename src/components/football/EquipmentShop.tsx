import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingBag, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const shopItems = [
  { name: "Speed Boots Pro", type: "boots", boost_stat: "pace", boost_value: 3, price: 500, rarity: "common", icon: "👟" },
  { name: "Golden Gloves", type: "gloves", boost_stat: "defending", boost_value: 4, price: 800, rarity: "rare", icon: "🧤" },
  { name: "Elite Shin Guards", type: "shinpads", boost_stat: "physical", boost_value: 3, price: 400, rarity: "common", icon: "🦿" },
  { name: "Champion Jersey", type: "jersey", boost_stat: "shooting", boost_value: 5, price: 1500, rarity: "epic", icon: "👕" },
  { name: "Tactical Headband", type: "accessory", boost_stat: "passing", boost_value: 4, price: 1000, rarity: "rare", icon: "🎽" },
  { name: "Legendary Boots", type: "boots", boost_stat: "pace", boost_value: 8, price: 5000, rarity: "legendary", icon: "⚡" },
];

const rarityColors: Record<string, string> = { common: "bg-gray-500/20 text-gray-400", rare: "bg-blue-500/20 text-blue-400", epic: "bg-purple-500/20 text-purple-400", legendary: "bg-amber-500/20 text-amber-400" };

export const EquipmentShop = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const buyItem = async (item: typeof shopItems[0]) => {
    if (!user) { toast.error("Sign in first"); return; }
    setLoading(item.name);
    try {
      const { data: coins } = await supabase.from("football_coins").select("*").eq("user_id", user.id).single();
      if (!coins || coins.balance < item.price) { toast.error("Not enough coins!"); return; }
      await supabase.from("football_coins").update({ balance: coins.balance - item.price, total_spent: coins.total_spent + item.price }).eq("user_id", user.id);
      await supabase.from("football_equipment").insert({ user_id: user.id, name: item.name, type: item.type, boost_stat: item.boost_stat, boost_value: item.boost_value, price: item.price, rarity: item.rarity });
      toast.success(`Purchased ${item.name}!`);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(null); }
  };

  return (
    <><FloatingHowItWorks title="EquipmentShop — How it works" steps={[{title:"Open this section",desc:"Access EquipmentShop from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <h2 className="text-2xl font-bold">🛒 Equipment Shop</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shopItems.map(item => (
          <Card key={item.name} className="border-emerald-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <Badge className={rarityColors[item.rarity]}>{item.rarity}</Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">+{item.boost_value} {item.boost_stat}</p>
              <Button onClick={() => buyItem(item)} disabled={loading === item.name} className="w-full gap-2">
                <ShoppingBag className="h-4 w-4" /> {item.price.toLocaleString()} coins
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </>
  );
};
