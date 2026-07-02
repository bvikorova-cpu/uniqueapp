import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { HowItWorksButton } from "@/components/common/HowItWorksButton";


const RARITY: Record<string, string> = {
  common: "border-slate-400 bg-slate-500/10",
  rare: "border-blue-400 bg-blue-500/10",
  epic: "border-purple-400 bg-purple-500/10",
  legendary: "border-amber-400 bg-amber-500/10",
  mythic: "border-pink-400 bg-pink-500/10",
};

export default function RewardsCosmetics() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [owned, setOwned] = useState<Record<string, any>>({});
  const [tab, setTab] = useState("avatar_frame");
  const [busyId, setBusyId] = useState<string | null>(null);

  const CATS = useMemo(() => [
    { id: "avatar_frame", label: "Frames" },
    { id: "profile_theme", label: "Themes" },
    { id: "animated_border", label: "Borders" },
    { id: "name_color", label: "Name color" },
  ], []);

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

  // After Stripe redirects back: verify session and grant ownership.
  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("cosmetic") !== "success") return;
    const sessionId = params.get("session_id");
    const itemId = params.get("item");
    if (!sessionId || !itemId) return;
    (async () => {
      const { data, error } = await supabase.functions.invoke("verify-cosmetic-purchase", {
        body: { sessionId, itemId },
      });
      if (error || !(data as any)?.ok) {
        toast.error((data as any)?.error ?? error?.message ?? "Acquire failed");
      } else {
        toast.success(`Acquired ${""}!`);
        load();
      }
      // Clean URL.
      const url = new URL(window.location.href);
      ["cosmetic", "session_id", "item"].forEach(k => url.searchParams.delete(k));
      window.history.replaceState({}, "", url.toString());
    })();
  }, [user?.id]);

  const acquire = async (item: any) => {
    if (!user || busyId) return;
    setBusyId(item.id);
    try {
      if (item.price_eur && Number(item.price_eur) > 0) {
        const successPath = `/rewards?cosmetic=success&item=${encodeURIComponent(item.id)}`;
        const { data, error } = await supabase.functions.invoke("create-one-off-payment", {
          body: {
            productKey: "cosmetic_purchase",
            amount: Math.round(Number(item.price_eur) * 100),
            name: item.name,
            description: `${item.category} • ${item.rarity}`,
            metadata: { itemId: item.id },
            successPath,
          },
        });
        if (error || !(data as any)?.url) {
          toast.error(error?.message ?? "Checkout failed");
          return;
        }
        window.location.href = (data as any).url;
        return;
      }
      const { data, error } = await supabase.rpc("acquire_cosmetic_item", { _item_id: item.id });
      if (error) { toast.error(error.message); return; }
      const res = data as any;
      if (!res?.ok) { toast.error(res?.error ?? "Acquire failed"); return; }
      toast.success(`Acquired ${item.name}!`);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const equip = async (item: any) => {
    if (!user || busyId) return;
    const rec = owned[item.id];
    if (!rec) return;
    setBusyId(item.id);
    try {
      const sameCatIds = items
        .filter(i => i.category === item.category)
        .map(i => owned[i.id])
        .filter(Boolean)
        .map((r: any) => r.id);
      if (sameCatIds.length > 0) {
        await supabase.from("user_rewards_cosmetics").update({ is_equipped: false }).in("id", sameCatIds);
      }
      await supabase.from("user_rewards_cosmetics").update({ is_equipped: true }).eq("id", rec.id);
      toast.success(`Equipped ${item.name}`);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <span className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> {"Cosmetics catalog"}</span>
          <HowItWorksButton title="Cosmetics" intro="Customize how your profile looks with avatars, frames, banners and effects." steps={[
            { title: "Browse by tab", desc: "Switch between avatars, frames, banners and effects using the tabs." },
            { title: "Rarity matters", desc: "Colored borders show rarity (common → legendary). Rare items are harder to obtain but stand out more." },
            { title: "Equip owned items", desc: "Items you own show a Check mark. Tap Equip to apply — only one item per slot can be active." },
            { title: "Where to get more", desc: "Earn cosmetics from Battle Pass, Marketplace, seasonal events and the Lucky Wheel." },
          ]} />
        </CardTitle>
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
                            <Badge className="w-full justify-center"><Check className="h-3 w-3 mr-1" /> {"Equipped"}</Badge>
                          ) : (
                            <Button size="sm" variant="outline" className="w-full" disabled={busyId === i.id} onClick={() => equip(i)}>{busyId === i.id ? "…" : "Equip"}</Button>
                          )
                        ) : (
                          <Button size="sm" className="w-full text-xs" disabled={busyId === i.id} onClick={() => acquire(i)}>
                            {busyId === i.id ? "…" : (i.price_xp ? `${i.price_xp} XP` : i.price_eur ? `€${i.price_eur}` : "Get")}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {items.filter(i => i.category === c.id).length === 0 && (
                  <p className="col-span-full text-sm text-muted-foreground text-center py-6">{"No items in this category yet."}</p>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
