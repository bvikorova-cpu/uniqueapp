import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Check, X, Loader2, Sparkles, Library, Coins, Heart, Swords, Shield, Zap, Crown, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const DRAW_COST = 1;
const TOTAL_CARDS = 200;
const UNITAS_COST = 10000;

interface UnitasStatus {
  complete: boolean;
  uniqueOwned: number;
  total: number;
  cost: number;
  claimed: boolean;
  character: { id: string; name: string; image_url: string | null } | null;
}

interface HeroCard {
  id: string;
  code: string;
  name: string;
  archetype: string;
  faction: string;
  rarity: string;
  lore: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  emoji: string;
  gradient: string;
  image_url: string | null;
}

const RARITY_LABEL: Record<string, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

const StatRow = ({ icon: Icon, label, value }: { icon: typeof Heart; label: string; value: number }) => (
  <div className="flex items-center gap-2 text-xs">
    <Icon className="h-3.5 w-3.5 text-primary" />
    <span className="text-muted-foreground">{label}</span>
    <span className="ml-auto font-bold">{value}</span>
  </div>
);

export const HeroCardCollection = () => {
  const queryClient = useQueryClient();
  const [drawing, setDrawing] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [current, setCurrent] = useState<HeroCard | null>(null);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);

  const { data: catalogue = [], isLoading: loadingCatalogue } = useQuery({
    queryKey: ["hero-collectibles-catalogue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_collectibles")
        .select("*")
        .order("code", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as HeroCard[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: ownedCounts = {}, isLoading } = useQuery({
    queryKey: ["hero-collection"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {} as Record<string, number>;
      const { data, error } = await supabase
        .from("hero_collection_cards")
        .select("collectible_id")
        .eq("user_id", user.id);
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const r of (data ?? []) as { collectible_id: string }[]) {
        counts[r.collectible_id] = (counts[r.collectible_id] ?? 0) + 1;
      }
      return counts;
    },
  });

  // Free background artwork backfill so the album shows real hero images.
  const [artMissing, setArtMissing] = useState(0);
  useEffect(() => {
    let stop = false;
    const run = async () => {
      while (!stop) {
        const { data, error } = await supabase.functions.invoke("hero-card-draw", {
          body: { action: "backfill_art", limit: 3 },
        });
        if (error || !data || data.error) return;
        setArtMissing(data.missing ?? 0);
        queryClient.invalidateQueries({ queryKey: ["hero-collectibles-catalogue"] });
        if (!data.missing || !data.generated) return;
      }
    };
    run();
    return () => { stop = true; };
  }, [queryClient]);




  const draw = async () => {
    setDrawing(true);
    setCurrent(null);
    try {
      const { data, error } = await supabase.functions.invoke("hero-card-draw", { body: { action: "draw" } });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setCurrent(data.card as HeroCard);
      window.dispatchEvent(new Event("ai-credits-updated"));
      queryClient.invalidateQueries({ queryKey: ["character-credits"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "The draw failed, please try again.");
    } finally {
      setDrawing(false);
    }
  };

  const decide = async (keep: boolean) => {
    if (!current) return;
    setExitDir(keep ? "right" : "left");
    if (!keep) {
      setTimeout(() => { setCurrent(null); setExitDir(null); }, 250);
      toast("Card released — it stays in the pool.", { icon: "🗑️" });
      return;
    }
    setDeciding(true);
    try {
      const { data, error } = await supabase.functions.invoke("hero-card-draw", {
        body: { action: "keep", collectibleId: current.id },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setExitDir(null);
        return;
      }
      toast.success(`${current.name} added to your collection!`);
      queryClient.invalidateQueries({ queryKey: ["hero-collection"] });
      setTimeout(() => { setCurrent(null); setExitDir(null); }, 250);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save the card.");
      setExitDir(null);
    } finally {
      setDeciding(false);
    }
  };

  const uniqueOwned = Object.keys(ownedCounts).length;
  const totalOwned = Object.values(ownedCounts).reduce((a, b) => a + b, 0);
  const progress = Math.round((uniqueOwned / TOTAL_CARDS) * 100);

  const { data: unitas } = useQuery({
    queryKey: ["hero-unitas-status", uniqueOwned],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("hero-card-draw", { body: { action: "unitas_status" } });
      if (error) throw error;
      return data as UnitasStatus;
    },
  });
  const unitasClaimed = !!unitas?.claimed;
  const unitasUnlocked = !!unitas?.complete;

  const claimUnitas = async () => {
    setClaiming(true);
    try {
      const { data, error } = await supabase.functions.invoke("hero-card-draw", { body: { action: "claim_unitas" } });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      toast.success("Unitas has been forged and joined your warriors!");
      window.dispatchEvent(new Event("ai-credits-updated"));
      queryClient.invalidateQueries({ queryKey: ["hero-unitas-status"] });
      queryClient.invalidateQueries({ queryKey: ["character-credits"] });
      queryClient.invalidateQueries({ queryKey: ["characters"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unitas could not be forged, please try again.");
    } finally {
      setClaiming(false);
    }
  };


  return (
    <div className="space-y-6">
      <FloatingHowItWorks
        title="Hero Card Collection — How it works"
        steps={[
          { title: "Draw a card", desc: `Each draw costs ${DRAW_COST} AI credit${DRAW_COST === 1 ? "" : "s"} and reveals one of the 200 fixed hero cards — you can also draw heroes you already own.` },
          { title: "Decide ✓ or ✗", desc: "Tap ✓ to add the hero to your collection (duplicates stack up), or ✗ to release it back into the pool." },
          { title: "Chase rarities", desc: "Cards come as Common, Rare, Epic and Legendary — legendary heroes have the strongest stats." },
          { title: "Light up the album", desc: "All 200 cards are visible from the start. They stay pale until you own at least one copy, then they light up in full colour with your copy count." },
          { title: "Complete it for Unitas", desc: `Own at least one copy of every card to unlock the golden card — Unitas, the mega hero, costs ${UNITAS_COST.toLocaleString("en-US")} credits and joins your warriors with 500 HP and 250 attack.` },
        ]}
      />

      <Card className="p-4 sm:p-6 border-border/30 bg-card/90 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Library className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-black">Hero Card Collection</h2>
            <p className="text-xs text-muted-foreground">200 fixed hero cards — draw, keep or release. Duplicates allowed.</p>
          </div>
          <Badge variant="outline" className="ml-auto gap-1 border-border/40">
            <Coins className="h-3 w-3" /> {DRAW_COST} cr / draw
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={progress} className="h-2 flex-1" />
          <span className="text-xs font-bold whitespace-nowrap">{uniqueOwned}/{TOTAL_CARDS}</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">{totalOwned} card{totalOwned === 1 ? "" : "s"} collected in total (including duplicates)</p>
      </Card>

      {/* ── Golden completion reward: Unitas ─────────────────────────────── */}
      <Card className={`relative overflow-hidden p-4 sm:p-6 border-2 ${unitasUnlocked ? "border-amber-400/70 bg-gradient-to-br from-amber-500/15 via-yellow-400/10 to-amber-600/15" : "border-border/30 bg-card/70"}`}>
        <div className="flex flex-wrap items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${unitasUnlocked ? "bg-gradient-to-br from-amber-400 to-yellow-600" : "bg-muted"}`}>
            {unitasUnlocked ? <Crown className="h-6 w-6 text-white" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-black bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
              Unitas — the golden mega hero
            </h3>
            <p className="text-xs text-muted-foreground">
              Collect all {TOTAL_CARDS} cards (at least one copy each) to unlock the golden card.
            </p>
          </div>
          <Badge variant="outline" className="ml-auto gap-1 border-amber-400/50 text-amber-500">
            <Coins className="h-3 w-3" /> {UNITAS_COST.toLocaleString("en-US")} cr
          </Badge>
        </div>

        {unitasClaimed ? (
          <div className="mt-4 flex flex-col sm:flex-row gap-4 items-center">
            {unitas?.character?.image_url && (
              <img
                src={unitas.character.image_url}
                alt="Unitas — the golden mega hero card"
                className="w-32 rounded-xl border-2 border-amber-400/60 shadow-[0_0_30px_rgba(251,191,36,0.35)]"
                loading="lazy"
              />
            )}
            <div className="text-center sm:text-left">
              <p className="font-black text-amber-500">Unitas has joined your warriors!</p>
              <p className="text-xs text-muted-foreground mt-1">
                500 HP · 250 ATK · 240 DEF · 220 SPD — find him among your characters and take him into battle.
              </p>
            </div>
          </div>
        ) : unitasUnlocked ? (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-3">
              Your album is complete. Forge Unitas for {UNITAS_COST.toLocaleString("en-US")} credits — he is generated as a
              unique golden hero and added to your warriors.
            </p>
            <Button
              onClick={claimUnitas}
              disabled={claiming}
              className="gap-2 bg-gradient-to-r from-amber-400 to-yellow-600 text-white"
            >
              {claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
              {claiming ? "Forging Unitas…" : `Unlock Unitas (${UNITAS_COST.toLocaleString("en-US")} cr)`}
            </Button>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-3">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-xs font-bold whitespace-nowrap">{uniqueOwned}/{TOTAL_CARDS}</span>
          </div>
        )}
      </Card>


      <Tabs defaultValue="draw">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="draw" className="gap-2"><Sparkles className="h-4 w-4" /> Draw</TabsTrigger>
          <TabsTrigger value="mine" className="gap-2"><Library className="h-4 w-4" /> My Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="pt-4">
          <div className="max-w-md mx-auto">
            <AnimatePresence mode="wait">
              {current ? (
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    x: exitDir === "right" ? 320 : exitDir === "left" ? -320 : 0,
                    rotate: exitDir === "right" ? 12 : exitDir === "left" ? -12 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 220, damping: 22 }}
                >
                  <Card className="overflow-hidden border-border/30 bg-card/95 backdrop-blur-xl">
                    <div className={`relative aspect-[4/5] bg-gradient-to-br ${current.gradient}`}>
                      {current.image_url ? (
                        <img
                          src={current.image_url}
                          alt={`${current.name} — ${current.archetype} hero collectible card`}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-7xl">{current.emoji}</div>
                      )}
                      <Badge className="absolute top-3 left-3 bg-background/80 text-foreground backdrop-blur">
                        {RARITY_LABEL[current.rarity] ?? current.rarity}
                      </Badge>
                      <Badge variant="outline" className="absolute top-3 right-3 bg-background/80 backdrop-blur">
                        {current.code}
                      </Badge>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-lg font-black leading-tight">{current.name}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{current.archetype} · {current.faction}</p>
                        <p className="text-[11px] font-bold mt-1 text-emerald-500">
                          {(ownedCounts[current.id] ?? 0) > 0
                            ? `Already in your collection ×${ownedCounts[current.id]} — keep it to stack a duplicate`
                            : "New hero — not in your collection yet!"}
                        </p>
                      </div>

                      <p className="text-xs text-muted-foreground">{current.lore}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                        <StatRow icon={Heart} label="HP" value={current.hp} />
                        <StatRow icon={Swords} label="Attack" value={current.attack} />
                        <StatRow icon={Shield} label="Defense" value={current.defense} />
                        <StatRow icon={Zap} label="Speed" value={current.speed} />
                      </div>
                    </div>
                  </Card>

                  <div className="flex items-center justify-center gap-6 mt-5">
                    <Button
                      size="icon"
                      variant="outline"
                      disabled={deciding}
                      onClick={() => decide(false)}
                      className="h-16 w-16 rounded-full border-destructive/40 hover:bg-destructive/10"
                      aria-label="Release this hero card"
                    >
                      <X className="h-7 w-7 text-destructive" />
                    </Button>
                    <Button
                      size="icon"
                      disabled={deciding}
                      onClick={() => decide(true)}
                      className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600"
                      aria-label="Add this hero card to your collection"
                    >
                      {deciding ? <Loader2 className="h-7 w-7 animate-spin" /> : <Check className="h-7 w-7" />}
                    </Button>
                  </div>
                  <p className="text-center text-[11px] text-muted-foreground mt-3">
                    ✓ keeps the hero · ✗ releases it back into the pool
                  </p>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="p-8 text-center border-dashed border-border/40 bg-card/70">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-black mb-1">Draw a hero card</h3>
                    <p className="text-xs text-muted-foreground mb-5">
                      {DRAW_COST} AI credit{DRAW_COST === 1 ? "" : "s"} per draw — any of the 200 heroes can appear, including ones you already own.
                    </p>
                    <Button onClick={draw} disabled={drawing} className="gap-2">
                      {drawing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {drawing ? "Drawing…" : `Draw for ${DRAW_COST} credit${DRAW_COST === 1 ? "" : "s"}`}
                    </Button>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="mine" className="pt-4">
          {artMissing > 0 && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-border/40 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Painting hero artwork… {TOTAL_CARDS - artMissing}/{TOTAL_CARDS} cards ready (free, keeps running while you browse)
            </div>
          )}
          {isLoading || loadingCatalogue ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {catalogue.map((c, i) => {
                const count = ownedCounts[c.id] ?? 0;
                const owned = count > 0;
                return (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 40) * 0.015 }}>
                    <Card className="overflow-hidden border-border/30 bg-card/90 transition-all">
                      <div className={`relative aspect-[4/5] bg-gradient-to-br ${c.gradient}`}>
                        {c.image_url ? (
                          <img
                            src={c.image_url}
                            alt={`${c.name} hero card`}
                            className={`absolute inset-0 w-full h-full object-cover transition-all ${owned ? "" : "opacity-70 saturate-[0.6]"}`}
                            loading="lazy"
                          />
                        ) : (
                          <div className={`absolute inset-0 flex items-center justify-center text-4xl ${owned ? "" : "opacity-70"}`}>{c.emoji}</div>
                        )}

                        <Badge className="absolute top-2 left-2 text-[9px] bg-background/80 text-foreground backdrop-blur">
                          {RARITY_LABEL[c.rarity] ?? c.rarity}
                        </Badge>
                        {owned && (
                          <Badge className="absolute top-2 right-2 text-[9px] bg-emerald-500 text-white">×{count}</Badge>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-bold truncate">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate capitalize">{c.archetype}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {c.hp} HP · {c.attack} ATK · {c.defense} DEF
                        </p>
                        <p className={`text-[10px] font-bold mt-1 ${owned ? "text-emerald-500" : "text-muted-foreground"}`}>
                          {owned ? `Collected ×${count}` : "Not collected yet"}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
};
