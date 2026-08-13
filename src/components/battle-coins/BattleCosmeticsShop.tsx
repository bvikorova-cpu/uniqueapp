import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, Coins, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BATTLE_COINS_UPDATED, BATTLE_MODULE_LABELS, type BattleModule } from "@/hooks/useBattleCoins";
import EquippedCosmeticPreview from "./EquippedCosmeticPreview";

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
    toast({
      title: next ? `${item.name} equipped` : `${item.name} unequipped`,
      description: next ? "It now shows on your preview card, the leaderboard and your duel entries." : "Removed from your public profile.",
    });
    // Refreshes the public cosmetics lookup used by the preview card and leaderboards.
    window.dispatchEvent(new Event(BATTLE_COINS_UPDATED));
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
          <EquippedCosmeticPreview />
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
                  ? `Equipped now: ${equipped.map(i => `${i.kind}: ${i.name}`).join(", ")} — visible next to your name on the leaderboard and on your duel entries.`
                  : "Nothing equipped yet — tap Equip on an item below to show it publicly."}
              </p>
            </>
          )}
        </div>



        {/* Loadout slots: one item per kind, switchable from everything you own, with an explicit
            Unequip so a slot can be cleared without hunting for the item in the catalogue below. */}
        <div className="rounded-xl border border-primary/20 bg-secondary/20 p-3 space-y-2">
          <p className="text-xs font-semibold">Loadout slots</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {KINDS.map(k => {
              const slotItems = ownedItems.filter(i => i.kind === k.key);
              const current = slotItems.find(i => owned[i.id]?.is_equipped);
              return (
                <div key={k.key} className="rounded-lg border border-primary/15 bg-background/60 p-2 space-y-1.5">
                  <p className="text-[11px] font-semibold text-muted-foreground">{k.label.replace(/s$/, "")} slot</p>
                  {slotItems.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground">Nothing owned yet — buy one below.</p>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-1">
                        {slotItems.map(i => (
                          <Button
                            key={i.id}
                            size="sm"
                            variant={owned[i.id]?.is_equipped ? "default" : "outline"}
                            className="h-7 px-2 text-[11px] gap-1"
                            disabled={busy === i.code}
                            onClick={() => equip(i, !owned[i.id]?.is_equipped)}
                          >
                            <span aria-hidden>{i.preview || "✨"}</span>
                            <span className="truncate max-w-[70px]">{i.name}</span>
                          </Button>
                        ))}
                      </div>
                      {current ? (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] w-full"
                          disabled={busy === current.code} onClick={() => equip(current, false)}>
                          <X className="h-3 w-3 mr-1" /> Unequip
                        </Button>
                      ) : (
                        <p className="text-[11px] text-muted-foreground">Slot empty — tap an item to wear it.</p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
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
                      {own.is_equipped ? <><X className="h-3.5 w-3.5 mr-1" /> Unequip</> : "Equip"}
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
