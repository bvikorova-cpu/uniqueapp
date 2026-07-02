import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Skull, Shield, Swords, Crown, Flame, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const DUNGEONS = [
  { id: "goblin_cave", name: "Goblin Cave", difficulty: "Easy", icon: "🏚️", cost: 5, reward: "50-100 XP", color: "from-green-500 to-emerald-600" },
  { id: "dragon_lair", name: "Dragon's Lair", difficulty: "Hard", icon: "🐉", cost: 10, reward: "200-500 XP", color: "from-red-500 to-orange-600" },
  { id: "shadow_realm", name: "Shadow Realm", difficulty: "Nightmare", icon: "👻", cost: 15, reward: "500-1500 XP", color: "from-purple-500 to-violet-600" },
  { id: "titans_forge", name: "Titan's Forge", difficulty: "Legendary", icon: "⚡", cost: 25, reward: "1000-5000 XP", color: "from-amber-500 to-yellow-600" },
];

export const AIDungeonRaids = () => {
  const [selectedDungeon, setSelectedDungeon] = useState<string | null>(null);
  const [selectedParty, setSelectedParty] = useState<string[]>([]);
  const [raidResult, setRaidResult] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: characters } = useQuery({
    queryKey: ["user-characters"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.from("characters").select("*").eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
  });

  const raidMutation = useMutation({
    mutationFn: async ({ dungeonId, partyIds }: { dungeonId: string; partyIds: string[] }) => {
      const { data, error } = await supabase.functions.invoke("dungeon-raid", {
        body: { dungeonId, characterIds: partyIds },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (result) => {
      setRaidResult(result);
      toast.success(result.victory ? "Raid Victory! 🏆" : "Raid Failed... 💀");
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      queryClient.invalidateQueries({ queryKey: ["character-credits"] });
    },
    onError: (error: Error) => toast.error(error.message || "Raid failed to start"),
  });

  const togglePartyMember = (id: string) => {
    setSelectedParty((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : prev.length < 4 ? [...prev, id] : prev);
  };

  const dungeon = DUNGEONS.find((d) => d.id === selectedDungeon);

  return (
    <>
      <FloatingHowItWorks title={"A I Dungeon Raids - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Dungeon Raids section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Dungeon Raids.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="relative overflow-hidden border-border/30 bg-card/90 backdrop-blur-xl p-6">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-red-500 to-amber-500" />
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Skull className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">AI Dungeon Raids</h2>
            <p className="text-muted-foreground text-sm">Send your party to battle AI bosses for epic rewards</p>
          </div>
        </div>

        {/* Dungeon Selection */}
        <h3 className="font-bold text-sm mb-3 text-amber-400">🏰 Select Dungeon</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {DUNGEONS.map((d) => (
            <motion.div
              key={d.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedDungeon(d.id)}
              className={`relative p-4 rounded-xl cursor-pointer border text-center transition-all ${
                selectedDungeon === d.id ? `border-primary bg-primary/10 shadow-lg shadow-primary/20` : "border-border/30 bg-card/50 hover:border-primary/40"
              }`}
            >
              <div className="text-3xl mb-2">{d.icon}</div>
              <p className="font-bold text-sm">{d.name}</p>
              <Badge className={`bg-gradient-to-r ${d.color} text-white text-[10px] mt-1`}>{d.difficulty}</Badge>
              <p className="text-[10px] text-muted-foreground mt-1">{d.cost} credits</p>
              <p className="text-[10px] text-amber-400">{d.reward}</p>
            </motion.div>
          ))}
        </div>

        {/* Party Selection */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-amber-400">⚔️ Select Party (max 4)</h3>
          <Badge variant="outline" className="border-amber-500/30 text-amber-400">{selectedParty.length}/4</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {characters?.map((c) => {
            const isSelected = selectedParty.includes(c.id);
            return (
              <motion.div
                key={c.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => togglePartyMember(c.id)}
                className={`p-3 rounded-xl cursor-pointer border transition-all ${
                  isSelected ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20" : "border-border/30 bg-card/50 hover:border-emerald-500/40"
                }`}
              >
                {c.image_url && <img src={c.image_url} alt={c.name} className="w-full h-16 rounded-lg object-cover mb-2" />}
                <p className="font-bold text-xs truncate">{c.name}</p>
                <p className="text-[10px] text-muted-foreground">Lv.{c.level} • {c.attack} ATK</p>
              </motion.div>
            );
          })}
        </div>

        <Button
          onClick={() => selectedDungeon && selectedParty.length > 0 && raidMutation.mutate({ dungeonId: selectedDungeon, partyIds: selectedParty })}
          disabled={!selectedDungeon || selectedParty.length === 0 || raidMutation.isPending}
          className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold"
          size="lg"
        >
          {raidMutation.isPending ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Raiding...</>
          ) : (
            <><Swords className="mr-2 h-5 w-5" /> Start Raid {dungeon ? `(${dungeon.cost} Credits)` : ""}</>
          )}
        </Button>
      </Card>

      {raidResult && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring" }}>
          <Card className={`p-6 backdrop-blur-xl ${raidResult.victory ? "border-amber-500/30 bg-gradient-to-br from-amber-900/20 to-green-900/20" : "border-red-500/30 bg-gradient-to-br from-red-900/20 to-gray-900/20"}`}>
            <div className="text-center mb-4">
              {raidResult.victory ? (
                <>
                  <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-2" />
                  <h3 className="text-2xl font-black text-amber-400">Victory!</h3>
                </>
              ) : (
                <>
                  <Skull className="h-12 w-12 text-red-400 mx-auto mb-2" />
                  <h3 className="text-2xl font-black text-red-400">Defeated</h3>
                </>
              )}
            </div>
            <div className="bg-card/30 p-4 rounded-lg border border-border/20">
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">{raidResult.narrative}</p>
            </div>
            {raidResult.rewards && (
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="text-center">
                  <Star className="h-5 w-5 text-amber-400 mx-auto" />
                  <p className="text-xs text-muted-foreground">XP Gained</p>
                  <p className="font-bold text-amber-400">{raidResult.rewards.xp}</p>
                </div>
                {raidResult.rewards.loot && (
                  <div className="text-center">
                    <Flame className="h-5 w-5 text-purple-400 mx-auto" />
                    <p className="text-xs text-muted-foreground">Loot</p>
                    <p className="font-bold text-purple-400">{raidResult.rewards.loot}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};
