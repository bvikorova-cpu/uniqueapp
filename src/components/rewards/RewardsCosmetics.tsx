import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

const RARITY: Record<string, string> = {
  common: "border-slate-400 bg-slate-500/10",
  rare: "border-blue-400 bg-blue-500/10",
  epic: "border-purple-400 bg-purple-500/10",
  legendary: "border-amber-400 bg-amber-500/10",
  mythic: "border-pink-400 bg-pink-500/10",
};

const CATS = [
  { id: "avatar_frame", label: "Frames" },
  { id: "profile_theme", label: "Themes" },
  { id: "animated_border", label: "Borders" },
  { id: "name_color", label: "Name color" },
];

export default function RewardsCosmetics() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [owned, setOwned] = useState<Record<string, any>>({});
  const [tab, setTab] = useState("avatar_frame");

  const load = async () => {
    const { data: cat } = await supabase.from("rewards_cosmetic_items").select("*").order("rarity");
    setItems(cat || []);
    if (user) {
      const { data: own } = await supabase.from("user_rewards_cosmetics").select("*").eq("user_id", user.id);
      const map: Record<string, any> = {};
      (own || []).forEach((o: any) => { map[o.item_id] = o; });
      setOwned(map);
    }
  };

  useEffect(() => { load(); }, [user?.id]);

  const acquire = async (item: any) => {
    if (!user) return;
    const { error } = await supabase.from("user_rewards_cosmetics").insert({ user_id: user.id, item_id: item.id });
    if (error) return toast.error(error.message);
    toast.success(`Acquired ${item.name}!`);
    load();
  };

  const equip = async (item: any) => {
    if (!user) return;
    const rec = owned[item.id];
    if (!rec) return;
    // unequip others in same category
    const sameCatOwned = items.filter(i => i.category === item.category).map(i => owned[i.id]).filter(Boolean);
    for (const r of sameCatOwned) {
      await supabase.from("user_rewards_cosmetics").update({ is_equipped: false }).eq("id", r.id);
    }
    await supabase.from("user_rewards_cosmetics").update({ is_equipped: true }).eq("id", rec.id);
    toast.success(`Equipped ${item.name}`);
    load();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Cosmetics catalog</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-4">
            {CATS.map(c => <TabsTrigger key={c.id} value={c.id}>{c.label}</TabsTrigger>)}
          </TabsList>
          {CATS.map(c => (
            <TabsContent key={c.id} value={c.id} className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {items.filter(i => i.category === c.id).map(i => {
                  const isOwned = !!owned[i.id];
                  const isEquipped = owned[i.id]?.is_equipped;
                  return (
                    <div key={i.id} className={`p-3 rounded-lg border-2 ${RARITY[i.rarity]}`}>
                      <div className="aspect-square bg-muted/30 rounded flex items-center justify-center text-3xl mb-2">
                        {i.preview_url ? <img src={i.preview_url} alt={i.name} className="w-full h-full object-cover rounded" /> : "✨"}
                      </div>
                      <p className="font-semibold text-sm truncate">{i.name}</p>
                      <Badge variant="outline" className="text-[10px] capitalize">{i.rarity}</Badge>
                      <div className="mt-2">
                        {isOwned ? (
                          isEquipped ? (
                            <Badge className="w-full justify-center"><Check className="h-3 w-3 mr-1" /> Equipped</Badge>
                          ) : (
                            <Button size="sm" variant="outline" className="w-full" onClick={() => equip(i)}>Equip</Button>
                          )
                        ) : (
                          <Button size="sm" className="w-full text-xs" onClick={() => acquire(i)}>
                            {i.price_xp ? `${i.price_xp} XP` : i.price_eur ? `€${i.price_eur}` : "Get"}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {items.filter(i => i.category === c.id).length === 0 && (
                  <p className="col-span-full text-sm text-muted-foreground text-center py-6">No items in this category yet.</p>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
