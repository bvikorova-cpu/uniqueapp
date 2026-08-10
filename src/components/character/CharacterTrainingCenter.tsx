import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Heart, Swords, Shield, Zap, Loader2, Coins, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCharacterCredits } from "@/hooks/useCharacterCredits";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const TRAINING_TYPES = [
  { value: "hp", label: "Endurance Training", stat: "hp", icon: "❤️", color: "from-red-500 to-rose-600", Icon: Heart },
  { value: "attack", label: "Combat Drill", stat: "attack", icon: "⚔️", color: "from-orange-500 to-red-600", Icon: Swords },
  { value: "defense", label: "Defense Practice", stat: "defense", icon: "🛡️", color: "from-blue-500 to-cyan-600", Icon: Shield },
  { value: "speed", label: "Speed Drill", stat: "speed", icon: "💨", color: "from-yellow-500 to-amber-600", Icon: Zap },
] as const;

export const CharacterTrainingCenter = () => {
  const { credits, spendCredits, refresh } = useCharacterCredits();
  const queryClient = useQueryClient();
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [training, setTraining] = useState<typeof TRAINING_TYPES[number]["value"] | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: characters } = useQuery({
    queryKey: ["user-characters"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("characters")
        .select("id, name, image_url, hp, attack, defense, speed, level")
        .eq("user_id", user.id)
        .order("level", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleTrain = async () => {
    if (!selectedChar || !training) {
      toast.error("Select a warrior and a training type!");
      return;
    }
    const t = TRAINING_TYPES.find((tt) => tt.value === training)!;
    const cost = 10; // 10 credits per training session (matches useCharacterCredits training cost)

    setLoading(true);
    try {
      const ok = await spendCredits(cost, `Training: ${t.label} (+stat)`);
      if (!ok) return;

      // AI-guided training: higher level = bigger improvement range
      const char = characters?.find((c) => c.id === selectedChar);
      if (!char) return;
      const levelMult = 1 + Math.floor((char.level || 1) / 10);
      const improvement = (1 + Math.floor(Math.random() * 3)) * levelMult;
      const newStat = char[t.stat] + improvement;

      const { error } = await supabase
        .from("characters")
        .update({ [t.stat]: newStat, updated_at: new Date().toISOString() })
        .eq("id", selectedChar);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["user-characters"] });
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      refresh();
      toast.success(`${t.icon} ${char.name}'s ${t.stat} improved by +${improvement}!`);
      setTraining(null);
    } catch (e: any) {
      toast.error(e.message || "Training failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="Training Center — How it works" steps={[
        { title: "Select warrior", desc: "Choose which character to train." },
        { title: "Pick a drill", desc: "Choose HP, Attack, Defense, or Speed training." },
        { title: "Spend 10 credits", desc: "Each session costs 10 AI credits and permanently boosts a stat." },
        { title: "Grow stronger", desc: "Higher-level warriors gain bigger improvements per session." },
      ]} />
      <div className="space-y-6">
        <Card className="relative overflow-hidden border-border/30 bg-card/90 backdrop-blur-xl p-5 sm:p-6">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Training Center</h2>
              <p className="text-muted-foreground text-sm">Train your warriors to boost their stats • 10 credits per session</p>
            </div>
          </div>

          {/* Character selector */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-muted-foreground mb-2">SELECT WARRIOR TO TRAIN</p>
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
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-border/30 bg-card/50 hover:border-emerald-500/40"
                  }`}
                >
                  {char.image_url ? (
                    <img src={char.image_url} alt={char.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs shrink-0">⚔️</div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{char.name}</p>
                    <p className="text-[10px] text-muted-foreground">Lv.{char.level} · {char.hp}HP/{char.attack}ATK</p>
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

          {/* Training options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {TRAINING_TYPES.map((t) => (
              <motion.div
                key={t.value}
                whileHover={{ scale: selectedChar ? 1.03 : 1 }}
                whileTap={{ scale: selectedChar ? 0.97 : 1 }}
                onClick={() => selectedChar && setTraining(t.value)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  training === t.value
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-border/30 bg-card/50 hover:border-emerald-500/40"
                } ${!selectedChar ? "opacity-50 pointer-events-none" : ""}`}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center mx-auto mb-2`}>
                  <t.Icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-bold text-center">{t.label}</p>
                <p className="text-[10px] text-center text-muted-foreground capitalize">+{t.stat}</p>
              </motion.div>
            ))}
          </div>

          {/* Train button */}
          <Button
            disabled={loading || !selectedChar || !training}
            onClick={handleTrain}
            className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
            size="lg"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <TrendingUp className="h-5 w-5" />
            )}
            {training ? `Train (${TRAINING_TYPES.find(t => t.value === training)?.label})` : "Select a training type"} · 10 cr
          </Button>

          {selectedChar && characters && (
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {(["hp", "attack", "defense", "speed"] as const).map((stat) => {
                const Icon = TRAINING_TYPES.find((t) => t.stat === stat)!.Icon;
                return (
                  <div key={stat} className="p-2 rounded-lg bg-card/40 border border-border/20">
                    <Icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-[10px] text-muted-foreground capitalize">{stat}</p>
                    <p className="text-lg font-black">{characters.find(c => c.id === selectedChar)?.[stat]}</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </>
  );
};
