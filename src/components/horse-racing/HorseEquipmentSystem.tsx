import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Zap, Heart, Flame, Star, Wrench, ChevronDown, Lock } from "lucide-react";
import { useUserHorses, useHorseCurrency } from "@/hooks/useHorseRacing";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface EquipmentItem {
  id: string;
  name: string;
  slot: "saddle" | "horseshoes" | "bridle" | "blanket";
  rarity: "common" | "rare" | "epic" | "legendary";
  stats: { speed?: number; stamina?: number; acceleration?: number; temperament?: number };
  costCoins: number;
  icon: string;
  description: string;
}

const EQUIPMENT: EquipmentItem[] = [
  // Saddles
  { id: "saddle_leather", name: "Leather Racing Saddle", slot: "saddle", rarity: "common", stats: { speed: 3, stamina: 2 }, costCoins: 150, icon: "🪑", description: "Standard racing saddle with good grip" },
  { id: "saddle_carbon", name: "Carbon Fiber Saddle", slot: "saddle", rarity: "rare", stats: { speed: 6, acceleration: 4 }, costCoins: 400, icon: "🪑", description: "Lightweight carbon frame for maximum speed" },
  { id: "saddle_champion", name: "Champion's Throne", slot: "saddle", rarity: "epic", stats: { speed: 10, stamina: 5, acceleration: 5 }, costCoins: 900, icon: "🪑", description: "Elite saddle used by champion jockeys" },
  { id: "saddle_legendary", name: "Pegasus Wing Saddle", slot: "saddle", rarity: "legendary", stats: { speed: 15, stamina: 8, acceleration: 8, temperament: 5 }, costCoins: 2000, icon: "🪑", description: "Legendary saddle that makes horses feel like they're flying" },

  // Horseshoes
  { id: "shoe_iron", name: "Iron Horseshoes", slot: "horseshoes", rarity: "common", stats: { speed: 2, acceleration: 3 }, costCoins: 100, icon: "🧲", description: "Standard racing horseshoes" },
  { id: "shoe_titanium", name: "Titanium Horseshoes", slot: "horseshoes", rarity: "rare", stats: { speed: 5, acceleration: 6 }, costCoins: 350, icon: "🧲", description: "Ultra-light titanium for fast tracks" },
  { id: "shoe_diamond", name: "Diamond-Tipped Shoes", slot: "horseshoes", rarity: "epic", stats: { speed: 8, acceleration: 10 }, costCoins: 800, icon: "🧲", description: "Diamond-reinforced for all track conditions" },
  { id: "shoe_mythic", name: "Windrunner Shoes", slot: "horseshoes", rarity: "legendary", stats: { speed: 12, acceleration: 15, stamina: 3 }, costCoins: 1800, icon: "🧲", description: "Mythical shoes that harness the wind" },

  // Bridles
  { id: "bridle_basic", name: "Racing Bridle", slot: "bridle", rarity: "common", stats: { temperament: 5 }, costCoins: 80, icon: "⛓️", description: "Comfortable bridle for better control" },
  { id: "bridle_pro", name: "Pro Racing Bridle", slot: "bridle", rarity: "rare", stats: { temperament: 10, speed: 2 }, costCoins: 300, icon: "⛓️", description: "Professional-grade with enhanced control" },
  { id: "bridle_master", name: "Master's Bridle", slot: "bridle", rarity: "epic", stats: { temperament: 15, speed: 5, stamina: 3 }, costCoins: 700, icon: "⛓️", description: "Master crafted for perfect horse-rider sync" },

  // Blankets
  { id: "blanket_wool", name: "Wool Racing Blanket", slot: "blanket", rarity: "common", stats: { stamina: 5 }, costCoins: 120, icon: "🛡️", description: "Warm blanket that boosts stamina recovery" },
  { id: "blanket_silk", name: "Silk Performance Blanket", slot: "blanket", rarity: "rare", stats: { stamina: 8, temperament: 4 }, costCoins: 350, icon: "🛡️", description: "Premium silk keeps horse comfortable" },
  { id: "blanket_champion", name: "Champion's Cloak", slot: "blanket", rarity: "epic", stats: { stamina: 12, temperament: 8, speed: 3 }, costCoins: 800, icon: "🛡️", description: "The cloak of racing champions" },
];

const RARITY_STYLES = {
  common: { border: "border-gray-500/30", bg: "bg-gray-500/10", text: "text-gray-300", badge: "bg-gray-600" },
  rare: { border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-300", badge: "bg-blue-600" },
  epic: { border: "border-purple-500/30", bg: "bg-purple-500/10", text: "text-purple-300", badge: "bg-purple-600" },
  legendary: { border: "border-amber-500/30", bg: "bg-amber-500/10", text: "text-amber-300", badge: "bg-amber-600" },
};

const SLOT_LABELS = { saddle: "Saddle", horseshoes: "Horseshoes", bridle: "Bridle", blanket: "Blanket" };

export const HorseEquipmentSystem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { horses } = useUserHorses();
  const { currency } = useHorseCurrency();
  const [selectedSlot, setSelectedSlot] = useState<string>("saddle");
  const [selectedHorse, setSelectedHorse] = useState("");

  const purchaseEquipment = useMutation({
    mutationFn: async ({ itemId, horseId }: { itemId: string; horseId: string }) => {
      const { data, error } = await supabase.functions.invoke("horse-purchase-equipment", {
        body: { itemId, horseId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Equipment purchased and equipped!");
      queryClient.invalidateQueries({ queryKey: ["user-horses"] });
      queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filteredItems = EQUIPMENT.filter(e => e.slot === selectedSlot);

  return (
    <>
      <FloatingHowItWorks title={"Horse Equipment System - How it works"} steps={[{ title: 'Open', desc: 'Access the Horse Equipment System section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Horse Equipment System.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black font-mono flex items-center gap-2 text-white">
          <Wrench className="h-6 w-6 text-amber-400" /> Horse Equipment
        </h2>
        <p className="text-amber-400/50 font-mono text-sm">Equip saddles, horseshoes, and gear to boost performance</p>
      </div>

      {/* Horse selector */}
      <Card className="p-4 bg-slate-900/60 border-amber-500/15">
        <div className="flex items-center gap-4">
          <label className="text-xs font-mono text-amber-400/60 uppercase tracking-wider">Equip To:</label>
          <Select value={selectedHorse} onValueChange={setSelectedHorse}>
            <SelectTrigger className="flex-1 bg-slate-800/60 border-amber-500/20 font-mono text-sm">
              <SelectValue placeholder="Select a horse..." />
            </SelectTrigger>
            <SelectContent>
              {horses?.map(h => (
                <SelectItem key={h.id} value={h.id}>{h.name} (Lvl {h.level})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Slot tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Object.entries(SLOT_LABELS).map(([slot, label]) => (
          <Button key={slot} size="sm" variant={selectedSlot === slot ? "default" : "outline"}
            onClick={() => setSelectedSlot(slot)}
            className={selectedSlot === slot
              ? "bg-gradient-to-r from-amber-600 to-red-600 text-white font-mono text-xs"
              : "bg-slate-800/40 border-amber-500/20 text-amber-400 font-mono text-xs"}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredItems.map((item, i) => {
          const style = RARITY_STYLES[item.rarity];
          const canAfford = currency && currency.coins >= item.costCoins;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`p-4 ${style.border} ${style.bg} backdrop-blur-sm hover:scale-[1.02] transition-all`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h3 className={`font-bold font-mono text-sm ${style.text}`}>{item.name}</h3>
                      <Badge className={`${style.badge} text-white text-[10px]`}>{item.rarity}</Badge>
                    </div>
                  </div>
                  <span className="text-amber-400 font-mono font-bold text-sm">{item.costCoins} 🪙</span>
                </div>

                <p className="text-xs text-amber-400/40 font-mono mb-3">{item.description}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {item.stats.speed && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded">
                      <Zap className="h-3 w-3" /> +{item.stats.speed} SPD
                    </span>
                  )}
                  {item.stats.stamina && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                      <Shield className="h-3 w-3" /> +{item.stats.stamina} STA
                    </span>
                  )}
                  {item.stats.acceleration && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                      <Flame className="h-3 w-3" /> +{item.stats.acceleration} ACC
                    </span>
                  )}
                  {item.stats.temperament && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded">
                      <Heart className="h-3 w-3" /> +{item.stats.temperament} TMP
                    </span>
                  )}
                </div>

                <Button size="sm" className="w-full font-mono text-xs"
                  disabled={!selectedHorse || !canAfford || purchaseEquipment.isPending}
                  onClick={() => {
                    if (!user) { navigate("/auth"); return; }
                    if (!selectedHorse) { toast.error("Select a horse first"); return; }
                    purchaseEquipment.mutate({ itemId: item.id, horseId: selectedHorse });
                  }}
                >
                  {!selectedHorse ? "Select Horse First" : !canAfford ? "Not Enough Coins" : purchaseEquipment.isPending ? "..." : "Purchase & Equip"}
                </Button>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
    </>
  );
};
