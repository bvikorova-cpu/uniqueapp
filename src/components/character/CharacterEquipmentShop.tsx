import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Heart, Swords, Shield, Zap, Loader2, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCharacterCredits } from "@/hooks/useCharacterCredits";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ShopItem {
  name: string;
  slot: string;
  boost_stat: "hp" | "attack" | "defense" | "speed";
  boost_value: number;
  cost: number;
  /** DB-safe rarity value */
  rarity: "common" | "rare" | "epic" | "legendary";
  /** Display tier (visual only) */
  tier?: "mythic" | "divine" | "cosmic" | "omega";
  icon: string;
  desc?: string;
}

const SHOP_ITEMS: ShopItem[] = [
  // Weapons (attack)
  { name: "Iron Blade", slot: "weapon", boost_stat: "attack", boost_value: 5, cost: 5, rarity: "common", icon: "🗡️" },
  { name: "Steel War Axe", slot: "weapon", boost_stat: "attack", boost_value: 10, cost: 10, rarity: "rare", icon: "🪓" },
  { name: "Dragon Slayer Sword", slot: "weapon", boost_stat: "attack", boost_value: 20, cost: 20, rarity: "epic", icon: "⚔️" },
  { name: "Mythic Excalibur", slot: "weapon", boost_stat: "attack", boost_value: 35, cost: 35, rarity: "legendary", icon: "✨" },
  // Armor (defense)
  { name: "Leather Armor", slot: "armor", boost_stat: "defense", boost_value: 5, cost: 5, rarity: "common", icon: "🦺" },
  { name: "Knight's Plate", slot: "armor", boost_stat: "defense", boost_value: 10, cost: 10, rarity: "rare", icon: "🛡️" },
  { name: "Dragon Scale Mail", slot: "armor", boost_stat: "defense", boost_value: 20, cost: 20, rarity: "epic", icon: "🐉" },
  { name: "Aegis of Eternity", slot: "armor", boost_stat: "defense", boost_value: 35, cost: 35, rarity: "legendary", icon: "🔰" },
  // Vitality (hp)
  { name: "Health Potion", slot: "vitality", boost_stat: "hp", boost_value: 15, cost: 5, rarity: "common", icon: "🧪" },
  { name: "Greater Elixir", slot: "vitality", boost_stat: "hp", boost_value: 30, cost: 10, rarity: "rare", icon: "⚗️" },
  { name: "Phoenix Tear", slot: "vitality", boost_stat: "hp", boost_value: 60, cost: 20, rarity: "epic", icon: "🔥" },
  { name: "Ambrosia of Gods", slot: "vitality", boost_stat: "hp", boost_value: 100, cost: 35, rarity: "legendary", icon: "🌟" },
  // Boots (speed)
  { name: "Swift Boots", slot: "boots", boost_stat: "speed", boost_value: 5, cost: 5, rarity: "common", icon: "👢" },
  { name: "Wind Walker Boots", slot: "boots", boost_stat: "speed", boost_value: 10, cost: 10, rarity: "rare", icon: "💨" },
  { name: "Lightning Greaves", slot: "boots", boost_stat: "speed", boost_value: 20, cost: 20, rarity: "epic", icon: "⚡" },
  { name: "Hermes' Sandals", slot: "boots", boost_stat: "speed", boost_value: 35, cost: 35, rarity: "legendary", icon: "👟" },

  // ===== MYTHIC TIER (~€30–60 in credits) =====
  { name: "Voidfang Greatsword", slot: "weapon", boost_stat: "attack", boost_value: 90, cost: 150, rarity: "legendary", tier: "mythic", icon: "🗡️", desc: "Forged in a collapsing star." },
  { name: "Bulwark of the Titan", slot: "armor", boost_stat: "defense", boost_value: 90, cost: 150, rarity: "legendary", tier: "mythic", icon: "🛡️", desc: "Titan bone plating." },
  { name: "Heart of the Hydra", slot: "vitality", boost_stat: "hp", boost_value: 300, cost: 200, rarity: "legendary", tier: "mythic", icon: "💚", desc: "Regenerates endlessly." },
  { name: "Stormstep Talaria", slot: "boots", boost_stat: "speed", boost_value: 90, cost: 150, rarity: "legendary", tier: "mythic", icon: "🌪️", desc: "Outrun the thunder." },

  // ===== DIVINE TIER (~€100–200 in credits) =====
  { name: "Sunforge Warhammer", slot: "weapon", boost_stat: "attack", boost_value: 220, cost: 600, rarity: "legendary", tier: "divine", icon: "🔨", desc: "Each swing detonates like a solar flare." },
  { name: "Celestial Aegis Plate", slot: "armor", boost_stat: "defense", boost_value: 220, cost: 600, rarity: "legendary", tier: "divine", icon: "🕊️", desc: "Blessed by an unknown pantheon." },
  { name: "Immortal Core", slot: "vitality", boost_stat: "hp", boost_value: 750, cost: 750, rarity: "legendary", tier: "divine", icon: "❤️‍🔥", desc: "A heart that refuses to stop." },

  // ===== COSMIC TIER (~€300–500 in credits) =====
  { name: "Singularity Lance", slot: "weapon", boost_stat: "attack", boost_value: 500, cost: 1500, rarity: "legendary", tier: "cosmic", icon: "🌌", desc: "Pierces reality itself." },
  { name: "Eventide Bastion", slot: "armor", boost_stat: "defense", boost_value: 500, cost: 1500, rarity: "legendary", tier: "cosmic", icon: "🌑", desc: "Absorbs the end of worlds." },
  { name: "Quantum Slipstream Boots", slot: "boots", boost_stat: "speed", boost_value: 500, cost: 2500, rarity: "legendary", tier: "cosmic", icon: "🛸", desc: "Moves before time notices." },

  // ===== OMEGA — the single strongest item on the platform (~€950 in credits) =====
  { name: "Omega Crown of Infinity", slot: "artifact", boost_stat: "attack", boost_value: 2000, cost: 4800, rarity: "legendary", tier: "omega", icon: "👑", desc: "THE ULTIMATE RELIC — +2000 Attack. Only true legends wear it." },
];

const rarityColors: Record<string, string> = {
  common: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  rare: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  epic: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  legendary: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  mythic: "bg-rose-500/20 text-rose-400 border-rose-500/40",
  divine: "bg-sky-500/20 text-sky-300 border-sky-400/40",
  cosmic: "bg-indigo-500/20 text-indigo-300 border-indigo-400/40",
  omega: "bg-gradient-to-r from-amber-500/30 to-fuchsia-500/30 text-amber-200 border-amber-400/50",
};

const tierBar: Record<string, string> = {
  common: "from-gray-500 to-gray-400",
  rare: "from-blue-500 to-blue-400",
  epic: "from-purple-500 to-pink-400",
  legendary: "from-amber-500 to-yellow-400",
  mythic: "from-rose-500 to-orange-400",
  divine: "from-sky-400 to-cyan-300",
  cosmic: "from-indigo-500 to-fuchsia-400",
  omega: "from-amber-400 via-fuchsia-500 to-cyan-400",
};


const statIcons: Record<string, typeof Heart> = {
  hp: Heart,
  attack: Swords,
  defense: Shield,
  speed: Zap,
};

export const CharacterEquipmentShop = () => {
  const { credits, spendCredits, refresh } = useCharacterCredits();
  const queryClient = useQueryClient();
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [buying, setBuying] = useState<string | null>(null);

  const { data: characters } = useQuery({
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

  const { data: ownedItems } = useQuery({
    queryKey: ["character-equipment-owned"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("character_equipment")
        .select("character_id, name, icon, boost_stat, boost_value")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
  });

  const handleBuy = async (item: ShopItem) => {
    if (!selectedChar) {
      toast.error("Select a warrior first!");
      return;
    }
    setBuying(item.name);
    try {
      const ok = await spendCredits(item.cost, `Bought ${item.name} (+${item.boost_value} ${item.boost_stat})`);
      if (!ok) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save the equipment record
      const { error: eqError } = await supabase.from("character_equipment").insert({
        user_id: user.id,
        character_id: selectedChar,
        name: item.name,
        slot: item.slot,
        boost_stat: item.boost_stat,
        boost_value: item.boost_value,
        rarity: item.rarity,
        icon: item.icon,
        credits_cost: item.cost,
      });
      if (eqError) throw eqError;

      // Apply the boost permanently to the character
      const char = characters?.find((c) => c.id === selectedChar);
      if (!char) return;
      const newStat = char[item.boost_stat] + item.boost_value;
      const { error: charError } = await supabase
        .from("characters")
        .update({ [item.boost_stat]: newStat, updated_at: new Date().toISOString() } as any)
        .eq("id", selectedChar);
      if (charError) throw charError;

      queryClient.invalidateQueries({ queryKey: ["user-characters"] });
      queryClient.invalidateQueries({ queryKey: ["character-equipment-owned"] });
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      refresh();
      toast.success(`${item.icon} ${item.name} equipped! +${item.boost_value} ${item.boost_stat}`);
    } catch (e: any) {
      toast.error(e.message || "Purchase failed");
    } finally {
      setBuying(null);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="Equipment Shop — How it works" steps={[
        { title: "Select warrior", desc: "Choose which character will receive the gear." },
        { title: "Browse items", desc: "Weapons, armor, vitality and boots from Common up to Mythic, Divine, Cosmic and the single Omega relic." },
        { title: "Buy with credits", desc: "Cheap starter gear costs 5 credits; end-game relics cost thousands — the boost is applied permanently." },
        { title: "Battle stronger", desc: "Your warrior's stats are immediately increased for battles." },
      ]} />
      <div className="space-y-6">
        <Card className="relative overflow-hidden border-border/30 bg-card/90 backdrop-blur-xl p-5 sm:p-6">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Equipment Shop</h2>
              <p className="text-muted-foreground text-sm">Gear from 5 credits up to the 4,800-credit Omega relic — the strongest item in the arena</p>
            </div>
          </div>


          {/* Character selector */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-muted-foreground mb-2">SELECT WARRIOR TO EQUIP</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {characters?.length === 0 && (
                <p className="col-span-full text-center text-sm text-muted-foreground py-4">No warriors yet. Forge one first!</p>
              )}
              {characters?.map((char) => (
                <motion.button
                  key={char.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedChar(char.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl border transition-all text-left ${
                    selectedChar === char.id
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-border/30 bg-card/50 hover:border-amber-500/40"
                  }`}
                >
                  {char.image_url ? (
                    <img src={char.image_url} alt={char.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs shrink-0">⚔️</div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{char.name}</p>
                    <p className="text-[10px] text-muted-foreground">Lv.{char.level} · {char.attack}ATK/{char.defense}DEF</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Credit balance */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Coins className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-black text-amber-400">{credits?.credits_remaining || 0}</span>
              <span className="text-xs text-muted-foreground">credits</span>
            </div>
          </div>

          {/* Shop grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SHOP_ITEMS.map((item) => {
              const StatIcon = statIcons[item.boost_stat];
              const tier = item.tier ?? item.rarity;
              const isOmega = item.tier === "omega";
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative rounded-xl border bg-card/60 backdrop-blur-sm overflow-hidden ${
                    isOmega ? "sm:col-span-2 lg:col-span-3 ring-2 ring-amber-400/40" : ""
                  } ${
                    selectedChar ? "border-border/30 hover:border-amber-500/40 cursor-pointer" : "border-border/20 opacity-60"
                  }`}
                  onClick={() => selectedChar && handleBuy(item)}
                >
                  <div className={`h-0.5 bg-gradient-to-r ${tierBar[tier]}`} />
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={isOmega ? "text-4xl" : "text-2xl"}>{item.icon}</span>
                        <div>
                          <p className={`font-black ${isOmega ? "text-base sm:text-lg" : "text-sm"}`}>{item.name}</p>
                          <Badge className={`text-[9px] border ${rarityColors[tier]}`}>{tier}</Badge>
                        </div>
                      </div>
                    </div>
                    {item.desc && (
                      <p className="text-[11px] text-muted-foreground mb-2 leading-snug">{item.desc}</p>
                    )}
                    <div className="flex items-center gap-1.5 mb-3">
                      <StatIcon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold text-primary">+{item.boost_value}</span>
                      <span className="text-xs text-muted-foreground capitalize">{item.boost_stat}</span>
                    </div>
                    <Button
                      size="sm"
                      disabled={!selectedChar || buying === item.name}
                      className={`w-full gap-1.5 ${
                        isOmega
                          ? "bg-gradient-to-r from-amber-500 via-fuchsia-600 to-cyan-500 hover:opacity-90"
                          : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                      }`}
                    >
                      {buying === item.name ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Coins className="h-3.5 w-3.5" />
                      )}
                      {item.cost.toLocaleString()} cr
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>


          {selectedChar && ownedItems && ownedItems.length > 0 && (
            <div className="mt-5 pt-4 border-t border-border/20">
              <p className="text-xs font-semibold text-muted-foreground mb-2">EQUIPPED GEAR</p>
              <div className="flex flex-wrap gap-2">
                {ownedItems.filter((o) => o.character_id === selectedChar).map((item, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] border-amber-500/30 gap-1">
                    {item.icon || "⚙️"} {item.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
};
