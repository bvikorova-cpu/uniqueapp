import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BATTLE_COINS_UPDATED, BATTLE_MODULE_LABELS, type BattleModule } from "@/hooks/useBattleCoins";

type Cosmetic = {
  id: string; code: string; name: string; description: string | null;
  kind: string; price_coins: number; rarity: string; preview: string | null;
};
type Owned = { cosmetic_id: string; is_equipped: boolean };

const RARITY: Record<string, string> = {
  common: "bg-secondary text-secondary-foreground",
  rare: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  epic: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  legendary: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
};
const KINDS: { key: string; label: string }[] = [
  { key: "frame", label: "Frames" },
  { key: "sticker", label: "Stickers" },
  { key: "badge", label: "Badges" },
];

/** Cosmetic-only shop. Battle Coins have no other use, so they never leak back into paid credits. */
export default function BattleCosmeticsShop({ coins, module = "kitchenstars" }: { coins: number; module?: BattleModule }) {
  const { toast } = useToast();
  const [items, setItems] = useState<Cosmetic[]>([]);
  const [owned, setOwned] = useState<Record<string, Owned>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [tab, setTab] = useState("frame");

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const [{ data: cat }, ownedRes] = await Promise.all([
      supabase.from("battle_cosmetics").select("*").eq("is_active", true).order("price_coins", { ascending: true }),
      session
        ? supabase.from("battle_cosmetics_owned").select("cosmetic_id, is_equipped").eq("user_id", session.user.id)
        : Promise.resolve({ data: [] as Owned[] }),
    ]);
    setItems((cat as Cosmetic[]) || []);
    const map: Record<string, Owned> = {};
    ((ownedRes.data as Owned[]) || []).forEach(o => { map[o.cosmetic_id] = o; });
    setOwned(map);
  }, []);

  useEffect(() => { load(); }, [load]);

  const buy = async (item: Cosmetic) => {
    if (coins < item.price_coins) {
      toast({
        title: "Not enough Battle Coins",
        description: `${item.name} costs ${item.price_coins.toLocaleString()} coins — you have ${coins.toLocaleString()} in ${BATTLE_MODULE_LABELS[module]}.`,
        variant: "destructive",
      });
      return;
    }
    setBusy(item.code);
    const { error } = await (supabase as any).rpc("purchase_battle_cosmetic", { _code: item.code, _module: module });
    setBusy(null);
    if (error) {
      toast({
        title: error.message.includes("INSUFFICIENT_COINS") ? "Not enough Battle Coins" : "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: `${item.name} unlocked!`, description: "Equip it to show it on your duel entries." });
    window.dispatchEvent(new Event(BATTLE_COINS_UPDATED));
    load();
  };

  const equip = async (item: Cosmetic, next: boolean) => {
    setBusy(item.code);
    const { error } = await supabase.rpc("equip_battle_cosmetic", { _code: item.code, _equip: next });
    setBusy(null);
    if (error) { toast({ title: "Could not update", description: error.message, variant: "destructive" }); return; }
    load();
  };

  const visible = items.filter(i => i.kind === tab);
  const equipped = items.filter(i => owned[i.id]?.is_equipped);
  const ownedItems = items.filter(i => owned[i.id]);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-primary" /> Battle Coins shop
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Cosmetics only — frames, stickers and badges for your duel profile. Balance: {coins.toLocaleString()} coins.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Locker: everything bought lives here, and whatever is equipped shows up next to your
            name and avatar on the live leaderboard and on your duel entries. */}
        <div className="rounded-xl border border-primary/20 bg-secondary/20 p-3 space-y-1.5">
          <p className="text-xs font-semibold">Your locker ({ownedItems.length} owned)</p>
          {ownedItems.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">
              Nothing bought yet. Anything you buy appears here — equip it and it shows on the leaderboard
              and on your duel entries.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                {ownedItems.map(i => (
                  <Badge key={i.id} variant={owned[i.id]?.is_equipped ? "default" : "outline"} className="gap-1">
                    <span aria-hidden>{i.preview || "✨"}</span>
                    <span className="truncate max-w-[110px]">{i.name}</span>
                  </Badge>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {equipped.length > 0
                  ? `Equipped now: ${equipped.map(i => i.name).join(", ")} — visible next to your name on the leaderboard and on your duel entries.`
                  : "Nothing equipped yet — tap Equip on an item below to show it publicly."}
              </p>
            </>
          )}
        </div>


        <div className="flex gap-2">
          {KINDS.map(k => (
            <Button key={k.key} size="sm" variant={tab === k.key ? "default" : "outline"} onClick={() => setTab(k.key)}>
              {k.label}
            </Button>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {visible.map(item => {
            const own = owned[item.id];
            return (
              <div key={item.id} className="rounded-xl border border-primary/20 bg-secondary/20 p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xl leading-none" aria-hidden>{item.preview || "✨"}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                  <Badge className={`${RARITY[item.rarity] || RARITY.common} shrink-0 capitalize`}>{item.rarity}</Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold flex items-center gap-1">
                    <Coins className="h-3.5 w-3.5 text-primary" />{item.price_coins.toLocaleString()}
                  </span>
                  {own ? (
                    <Button size="sm" variant={own.is_equipped ? "default" : "outline"} disabled={busy === item.code}
                      onClick={() => equip(item, !own.is_equipped)}>
                      {own.is_equipped ? <><Check className="h-3.5 w-3.5 mr-1" /> Equipped</> : "Equip"}
                    </Button>
                  ) : (
                    <Button size="sm" disabled={busy === item.code} onClick={() => buy(item)}>
                      {busy === item.code ? "Buying..." : "Buy"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {visible.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-6">No items in this category yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
