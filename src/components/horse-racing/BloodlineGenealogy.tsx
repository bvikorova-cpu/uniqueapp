import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitBranch, Dna, Star, Zap, Shield, Heart, Flame, Crown, Sparkles, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserHorses } from "@/hooks/useHorseRacing";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface AncestorNode {
  id: string;
  name: string;
  breed: string;
  color: string;
  level: number;
  speed: number;
  stamina: number;
  acceleration: number;
  generation: number;
  wins: number;
}

export const BloodlineGenealogy = () => {
  const { horses } = useUserHorses();
  const [selectedHorse, setSelectedHorse] = useState("");

  const horse = horses?.find(h => h.id === selectedHorse);

  const { data: bloodline = [], isLoading } = useQuery({
    queryKey: ["horse-bloodline", selectedHorse],
    queryFn: async () => {
      if (!selectedHorse) return [];
      const { data } = await (supabase as any)
        .from("horse_bloodlines")
        .select("*, parent:horses!horse_bloodlines_parent_id_fkey(id, name, breed, color, level, speed_stat, stamina_stat, acceleration_stat, race_wins)")
        .eq("horse_id", selectedHorse)
        .order("generation", { ascending: true });
      return data || [];
    },
    enabled: !!selectedHorse,
  });

  const getBloodlineScore = () => {
    if (!horse) return 0;
    return horse.speed_stat + horse.stamina_stat + horse.acceleration_stat + horse.temperament_stat;
  };

  const getBloodlineRank = (score: number) => {
    if (score >= 350) return { label: "Legendary", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" };
    if (score >= 250) return { label: "Epic", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" };
    if (score >= 150) return { label: "Rare", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" };
    return { label: "Common", color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/30" };
  };

  return (
    <>
      <FloatingHowItWorks title={"Bloodline Genealogy - How it works"} steps={[{ title: 'Open', desc: 'Access the Bloodline Genealogy section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Bloodline Genealogy.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black font-mono flex items-center gap-2 text-white">
          <GitBranch className="h-6 w-6 text-amber-400" /> Bloodline Genealogy
        </h2>
        <p className="text-amber-400/50 font-mono text-sm">Explore your horse's family tree and genetic heritage</p>
      </div>

      {/* Horse Selector */}
      <Card className="p-4 bg-slate-900/60 border-amber-500/15">
        <Select value={selectedHorse} onValueChange={setSelectedHorse}>
          <SelectTrigger className="bg-slate-800/60 border-amber-500/20 font-mono">
            <SelectValue placeholder="Select a horse to view bloodline..." />
          </SelectTrigger>
          <SelectContent>
            {horses?.map(h => (
              <SelectItem key={h.id} value={h.id}>{h.name} — {h.breed} (Lvl {h.level})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {horse && (
        <>
          {/* Horse Profile Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-5 bg-slate-900/60 border-amber-500/15 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-xl border-2 border-amber-400/30" style={{ backgroundColor: horse.color }} />
                  <div className="absolute -inset-2 rounded-2xl blur-lg opacity-30" style={{ backgroundColor: horse.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-black font-mono text-white">{horse.name}</h3>
                    {(() => {
                      const rank = getBloodlineRank(getBloodlineScore());
                      return (
                        <Badge className={`${rank.bg} ${rank.color} ${rank.border} text-[10px] font-mono`}>
                          <Crown className="h-3 w-3 mr-1" /> {rank.label} Bloodline
                        </Badge>
                      );
                    })()}
                  </div>
                  <p className="text-xs font-mono text-amber-400/50 capitalize mb-3">
                    {horse.breed} • Level {horse.level} • {horse.total_wins}W / {horse.total_races}R
                  </p>

                  {/* Stat Overview */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "SPD", value: horse.speed_stat, icon: Zap, color: "text-yellow-400" },
                      { label: "STA", value: horse.stamina_stat, icon: Shield, color: "text-blue-400" },
                      { label: "ACC", value: horse.acceleration_stat, icon: Flame, color: "text-orange-400" },
                      { label: "TMP", value: horse.temperament_stat, icon: Heart, color: "text-pink-400" },
                    ].map(s => (
                      <div key={s.label} className="text-center p-2 rounded-lg bg-slate-800/40 border border-white/5">
                        <s.icon className={`h-4 w-4 ${s.color} mx-auto mb-1`} />
                        <p className="font-mono font-bold text-white text-sm">{s.value}</p>
                        <p className="text-[9px] font-mono text-amber-400/40">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Power Score */}
              <div className="mt-4 pt-3 border-t border-amber-500/10 flex items-center justify-between">
                <span className="text-xs font-mono text-amber-400/50">Bloodline Power Score</span>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span className="text-lg font-black font-mono text-amber-400">{getBloodlineScore()}</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Family Tree */}
          <div>
            <h3 className="font-mono text-sm text-amber-400/60 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Dna className="h-4 w-4" /> Ancestry Tree
            </h3>

            {bloodline.length > 0 ? (
              <div className="relative space-y-3">
                <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-amber-400/30 via-amber-400/10 to-transparent" />
                
                {bloodline.map((entry: any, i: number) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="ml-12 relative"
                  >
                    <div className="absolute -left-[3.25rem] top-4 w-3 h-3 rounded-full border-2 border-amber-400/50 bg-slate-950" />
                    
                    <Card className="p-3 bg-slate-900/40 border-amber-500/10 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        {entry.parent && (
                          <>
                            <div className="w-8 h-8 rounded-lg border border-white/10" style={{ backgroundColor: entry.parent.color }} />
                            <div>
                              <p className="font-mono font-bold text-white text-sm">{entry.parent.name}</p>
                              <p className="text-[10px] font-mono text-amber-400/40 capitalize">
                                Gen {entry.generation} • {entry.parent.breed} • Lvl {entry.parent.level}
                              </p>
                            </div>
                            <div className="ml-auto text-right">
                              <p className="text-[10px] font-mono text-amber-400">{entry.parent.race_wins}W</p>
                            </div>
                          </>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="p-8 bg-slate-900/40 border-amber-500/10 text-center">
                <Dna className="h-10 w-10 mx-auto mb-3 text-amber-400/20" />
                <p className="text-amber-400/50 font-mono text-sm">No ancestry data available</p>
                <p className="text-amber-400/30 font-mono text-[10px] mt-1">Breed horses to build a family tree</p>
              </Card>
            )}
          </div>

          {/* Genetic Traits */}
          <Card className="p-4 bg-slate-900/40 border-amber-500/10">
            <h3 className="font-bold font-mono text-sm text-amber-300 mb-3 flex items-center gap-2">
              <Info className="h-4 w-4" /> Genetic Traits Analysis
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { trait: "Sprint Gene", chance: Math.min(horse.speed_stat, 100), desc: "Burst speed ability" },
                { trait: "Endurance Gene", chance: Math.min(horse.stamina_stat, 100), desc: "Long-distance stamina" },
                { trait: "Reflexes Gene", chance: Math.min(horse.acceleration_stat, 100), desc: "Quick start reactions" },
                { trait: "Calm Gene", chance: Math.min(horse.temperament_stat, 100), desc: "Race composure" },
              ].map(t => (
                <div key={t.trait} className="p-2 rounded-lg bg-slate-800/30 border border-white/5">
                  <p className="text-[10px] font-mono text-amber-400/60">{t.trait}</p>
                  <div className="h-1.5 bg-slate-700 rounded-full mt-1 mb-1 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full" style={{ width: `${t.chance}%` }} />
                  </div>
                  <p className="text-[9px] font-mono text-amber-400/30">{t.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {!selectedHorse && (
        <Card className="p-12 bg-slate-900/40 border-amber-500/10 text-center">
          <GitBranch className="h-12 w-12 mx-auto mb-3 text-amber-400/20" />
          <p className="text-amber-400/50 font-mono text-sm">Select a horse to explore its bloodline</p>
        </Card>
      )}
    </div>
    </>
  );
};
