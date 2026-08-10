import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Backpack, Heart, Swords, Shield, Zap, Coins, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const rarityColors: Record<string, string> = {
  common: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  rare: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  epic: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  legendary: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const statIcons: Record<string, typeof Heart> = {
  hp: Heart,
  attack: Swords,
  defense: Shield,
  speed: Zap,
};

export const CharacterInventory = () => {
  const [selectedChar, setSelectedChar] = useState<string | null>(null);

  const { data: characters, isLoading: charsLoading } = useQuery({
    queryKey: ["user-characters"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("characters")
        .select("id, name, image_url, hp, attack, defense, speed, level")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ["character-equipment-inventory"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("character_equipment")
        .select("id, character_id, name, slot, icon, rarity, boost_stat, boost_value, credits_cost, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const perCharacter = useMemo(() => {
    const map = new Map<string, typeof items>();
    (items ?? []).forEach((it) => {
      const list = map.get(it.character_id) ?? [];
      list.push(it);
      map.set(it.character_id, list as any);
    });
    return map;
  }, [items]);

  const totals = useMemo(() => {
    const list = items ?? [];
    return {
      count: list.length,
      credits: list.reduce((s, i) => s + (i.credits_cost || 0), 0),
      hp: list.filter((i) => i.boost_stat === "hp").reduce((s, i) => s + i.boost_value, 0),
      attack: list.filter((i) => i.boost_stat === "attack").reduce((s, i) => s + i.boost_value, 0),
      defense: list.filter((i) => i.boost_stat === "defense").reduce((s, i) => s + i.boost_value, 0),
      speed: list.filter((i) => i.boost_stat === "speed").reduce((s, i) => s + i.boost_value, 0),
    };
  }, [items]);

  const visibleChars = selectedChar
    ? (characters ?? []).filter((c) => c.id === selectedChar)
    : (characters ?? []);

  return (
    <>
      <FloatingHowItWorks title="My Inventory — How it works" steps={[
        { title: "Open inventory", desc: "See every warrior you own and the gear attached to them." },
        { title: "Check the boosts", desc: "Each item shows which stat it boosts and by how much." },
        { title: "Count & spend", desc: "Totals show how many items you own and how many credits you invested." },
        { title: "Buy more", desc: "Head to the Equipment Shop or Training Center to grow stronger." },
      ]} />
      <div className="space-y-6">
        <Card className="relative overflow-hidden border-border/30 bg-card/90 backdrop-blur-xl p-5 sm:p-6">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Backpack className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">My Inventory</h1>
              <p className="text-muted-foreground text-sm">All gear your heroes own, with stat bonuses and totals</p>
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-5">
            <div className="rounded-xl border border-border/30 bg-card/60 p-3 text-center">
              <Package className="h-4 w-4 mx-auto mb-1 text-emerald-400" />
              <p className="text-xl font-black">{totals.count}</p>
              <p className="text-[10px] text-muted-foreground">Items owned</p>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/60 p-3 text-center">
              <Coins className="h-4 w-4 mx-auto mb-1 text-amber-400" />
              <p className="text-xl font-black">{totals.credits.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Credits invested</p>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/60 p-3 text-center">
              <Swords className="h-4 w-4 mx-auto mb-1 text-red-400" />
              <p className="text-xl font-black">+{totals.attack}</p>
              <p className="text-[10px] text-muted-foreground">Attack</p>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/60 p-3 text-center">
              <Shield className="h-4 w-4 mx-auto mb-1 text-blue-400" />
              <p className="text-xl font-black">+{totals.defense}</p>
              <p className="text-[10px] text-muted-foreground">Defense</p>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/60 p-3 text-center">
              <Heart className="h-4 w-4 mx-auto mb-1 text-rose-400" />
              <p className="text-xl font-black">+{totals.hp}</p>
              <p className="text-[10px] text-muted-foreground">HP</p>
            </div>
            <div className="rounded-xl border border-border/30 bg-card/60 p-3 text-center">
              <Zap className="h-4 w-4 mx-auto mb-1 text-yellow-400" />
              <p className="text-xl font-black">+{totals.speed}</p>
              <p className="text-[10px] text-muted-foreground">Speed</p>
            </div>
          </div>

          {/* Filter by warrior */}
          {(characters?.length ?? 0) > 1 && (
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                onClick={() => setSelectedChar(null)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  selectedChar === null ? "border-emerald-500 bg-emerald-500/10" : "border-border/30 bg-card/50"
                }`}
              >
                All heroes
              </button>
              {characters?.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedChar(c.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    selectedChar === c.id ? "border-emerald-500 bg-emerald-500/10" : "border-border/30 bg-card/50"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {(charsLoading || itemsLoading) && (
            <div className="space-y-3">
              {[0, 1].map((i) => <div key={i} className="h-24 rounded-xl bg-card/50 animate-pulse" />)}
            </div>
          )}

          {!charsLoading && (characters?.length ?? 0) === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No heroes yet — forge one in the arena first.</p>
          )}

          <div className="space-y-4">
            {visibleChars.map((char) => {
              const gear = (perCharacter.get(char.id) ?? []) as NonNullable<typeof items>;
              const sum = (stat: string) => gear.filter((g) => g.boost_stat === stat).reduce((s, g) => s + g.boost_value, 0);
              return (
                <motion.div
                  key={char.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border/30 bg-card/60 p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {char.image_url ? (
                      <img src={char.image_url} alt={`${char.name} portrait`} className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">⚔️</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-sm truncate">{char.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Lv.{char.level} · {char.hp} HP · {char.attack} ATK · {char.defense} DEF · {char.speed} SPD
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-emerald-500/30 shrink-0">
                      {gear.length} item{gear.length === 1 ? "" : "s"}
                    </Badge>
                  </div>

                  {gear.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No gear bought for this hero yet.</p>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2 mb-3 text-[10px]">
                        {(["attack", "defense", "hp", "speed"] as const).map((s) =>
                          sum(s) > 0 ? (
                            <Badge key={s} variant="outline" className="border-border/30 text-[10px] capitalize">
                              +{sum(s)} {s}
                            </Badge>
                          ) : null
                        )}
                        <Badge variant="outline" className="border-amber-500/30 text-[10px] gap-1">
                          <Coins className="h-3 w-3" />
                          {gear.reduce((s, g) => s + (g.credits_cost || 0), 0).toLocaleString()} cr spent
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {gear.map((item) => {
                          const StatIcon = statIcons[item.boost_stat] ?? Swords;
                          return (
                            <div key={item.id} className="flex items-center gap-2 rounded-lg border border-border/30 bg-card/70 p-2.5">
                              <span className="text-xl shrink-0">{item.icon || "⚙️"}</span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold truncate">{item.name}</p>
                                <div className="flex items-center gap-1.5">
                                  <StatIcon className="h-3 w-3 text-primary" />
                                  <span className="text-[11px] font-bold text-primary">+{item.boost_value}</span>
                                  <span className="text-[10px] text-muted-foreground capitalize">{item.boost_stat}</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <Badge className={`text-[9px] border ${rarityColors[item.rarity] ?? rarityColors.common}`}>{item.rarity}</Badge>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{(item.credits_cost || 0).toLocaleString()} cr</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
};
