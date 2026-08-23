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
import CosmeticVisualPreview from "@/components/rewards/CosmeticVisualPreview";


const RARITY: Record<string, string> = { common: "border-slate-400 bg-slate-500/10",
  rare: "border-blue-400 bg-blue-500/10",
  epic: "border-purple-400 bg-purple-500/10",
  legendary: "border-amber-400 bg-amber-500/10",
  mythic: "border-pink-400 bg-pink-500/10" };

export default function RewardsCosmetics() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [owned, setOwned] = useState<Record<string, any>>({});
  const [tab, setTab] = useState("avatar_frame");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ username: string | null; full_name: string | null; avatar_url: string | null } | null>(null);

  useEffect(() => {
    if (!user) { setProfile(null); return; }
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username, full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (alive) setProfile((data as any) || null);
    })();
    return () => { alive = false; };
  }, [user?.id]);

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

  const acquire = async (item: any, payWith: "xp" | "credits") => {
    if (!user || busyId) return;
    setBusyId(item.id);
    try {
      const { data, error } = await supabase.rpc("acquire_cosmetic_item" as any, {
        _item_id: item.id,
        _pay_with: payWith,
      });
      if (error) { toast.error(error.message); return; }
      const res = data as any;
      if (!res?.ok) {
        const map: Record<string, string> = {
          insufficient_xp: "Not enough XP (locked challenge XP cannot be used).",
          insufficient_credits: "Not enough AI credits.",
          already_owned: "You already own this item.",
        };
        toast.error(map[res?.error] ?? res?.error ?? "Acquire failed");
        return;
      }
      toast.success(`Acquired ${item.name}!`);
      window.dispatchEvent(new Event("ai-credits-updated"));
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
      window.dispatchEvent(new Event(REWARDS_COSMETICS_UPDATED));
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
                    <div key={i.id} className={`p-3 rounded-lg border-2 flex flex-col ${RARITY[i.rarity]}`}>
                      <CosmeticVisualPreview
                        slug={i.slug}
                        category={i.category}
                        name={i.name}
                        emoji={i.preview_url}
                        avatarUrl={profile?.avatar_url}
                        displayName={profile?.username || profile?.full_name}
                      />
                      <p className="font-semibold text-sm truncate">{i.name}</p>
                      <Badge variant="outline" className="text-[10px] capitalize w-fit">{i.rarity}</Badge>
                      <div className="mt-2 space-y-1.5">
                        {isOwned ? (
                          isEquipped ? (
                            <Badge className="w-full justify-center"><Check className="h-3 w-3 mr-1" /> {"Equipped"}</Badge>
                          ) : (
                            <Button size="sm" variant="outline" className="w-full" disabled={busyId === i.id} onClick={() => equip(i)}>{busyId === i.id ? "…" : "Equip"}</Button>
                          )
                        ) : (
                          <>
                            {i.price_xp > 0 && (
                              <Button size="sm" className="w-full text-xs" disabled={busyId === i.id} onClick={() => acquire(i, "xp")}>
                                {busyId === i.id ? "…" : `${i.price_xp} XP`}
                              </Button>
                            )}
                            {i.price_credits > 0 && (
                              <Button size="sm" variant="outline" className="w-full text-xs" disabled={busyId === i.id} onClick={() => acquire(i, "credits")}>
                                {busyId === i.id ? "…" : `${i.price_credits} credits`}
                              </Button>
                            )}
                            {!i.price_xp && !i.price_credits && (
                              <Button size="sm" className="w-full text-xs" disabled={busyId === i.id} onClick={() => acquire(i, "xp")}>{busyId === i.id ? "…" : "Get"}</Button>
                            )}
                            <p className="text-[10px] text-muted-foreground text-center">{"Choose one payment"}</p>
                          </>
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
