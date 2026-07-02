import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TreeDeciduous, Zap, Star, ArrowUp, Lock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const EVOLUTION_STAGES = [
  { level: 1, name: "Recruit", color: "from-gray-400 to-gray-500", icon: "🗡️", requiredXP: 0 },
  { level: 5, name: "Warrior", color: "from-green-400 to-emerald-500", icon: "⚔️", requiredXP: 500 },
  { level: 10, name: "Elite", color: "from-blue-400 to-cyan-500", icon: "🛡️", requiredXP: 2000 },
  { level: 20, name: "Champion", color: "from-purple-400 to-violet-500", icon: "👑", requiredXP: 5000 },
  { level: 30, name: "Legendary", color: "from-amber-400 to-yellow-500", icon: "🌟", requiredXP: 15000 },
  { level: 50, name: "Mythic", color: "from-red-400 to-rose-500", icon: "🔥", requiredXP: 50000 },
];

export const CharacterEvolutionTree = () => {
  const { data: characters } = useQuery({
    queryKey: ["user-characters"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase.from("characters").select("*").eq("user_id", user.id).order("level", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getEvolutionStage = (level: number) => {
    return [...EVOLUTION_STAGES].reverse().find((s) => level >= s.level) || EVOLUTION_STAGES[0];
  };

  const getNextStage = (level: number) => {
    return EVOLUTION_STAGES.find((s) => level < s.level);
  };

  return (
    <>
      <FloatingHowItWorks title={"Character Evolution Tree - How it works"} steps={[{ title: 'Open', desc: 'Access the Character Evolution Tree section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Character Evolution Tree.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="relative overflow-hidden border-border/30 bg-card/90 backdrop-blur-xl p-6">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500" />
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
            <TreeDeciduous className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Evolution Tree</h2>
            <p className="text-muted-foreground text-sm">Track your warriors' evolution through battle XP</p>
          </div>
        </div>

        {/* Evolution Path */}
        <div className="flex items-center gap-1 sm:gap-2 mb-8 overflow-x-auto pb-2">
          {EVOLUTION_STAGES.map((stage, i) => (
            <div key={stage.name} className="flex items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring" }}
                className={`flex flex-col items-center min-w-[64px] sm:min-w-[80px]`}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${stage.color} flex items-center justify-center text-lg sm:text-xl shadow-lg`}>
                  {stage.icon}
                </div>
                <span className="text-[10px] sm:text-xs font-bold mt-1 text-center">{stage.name}</span>
                <span className="text-[9px] text-muted-foreground">Lv.{stage.level}+</span>
              </motion.div>
              {i < EVOLUTION_STAGES.length - 1 && (
                <div className="w-4 sm:w-8 h-0.5 bg-gradient-to-r from-border to-border/30 mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* Characters Evolution Progress */}
        <div className="space-y-4">
          {characters?.map((char) => {
            const currentStage = getEvolutionStage(char.level);
            const nextStage = getNextStage(char.level);
            const xp = char.experience || 0;
            const progress = nextStage ? Math.min(100, (xp / nextStage.requiredXP) * 100) : 100;

            return (
              <motion.div key={char.id} whileHover={{ scale: 1.01 }} className="p-4 rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {char.image_url ? (
                      <img src={char.image_url} alt={char.name} className="w-14 h-14 rounded-xl object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-2xl">{currentStage.icon}</div>
                    )}
                    <Badge className={`absolute -bottom-2 -right-2 bg-gradient-to-r ${currentStage.color} text-white text-[10px] px-1.5`}>
                      Lv.{char.level}
                    </Badge>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-sm truncate">{char.name}</p>
                      <Badge variant="outline" className="text-[10px] shrink-0">{currentStage.name}</Badge>
                    </div>
                    
                    {nextStage ? (
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                          <span>XP: {xp.toLocaleString()}</span>
                          <span className="flex items-center gap-1">
                            <ArrowUp className="h-3 w-3" /> {nextStage.name} ({nextStage.requiredXP.toLocaleString()} XP)
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-400 text-xs">
                        <Star className="h-3.5 w-3.5" />
                        <span className="font-bold">MAX EVOLUTION REACHED</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span>⚔️ {char.wins}W / {char.losses}L</span>
                      <span>❤️ {char.hp} HP</span>
                      <span>⚡ {char.attack} ATK</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {(!characters || characters.length === 0) && (
            <div className="text-center py-12">
              <Lock className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground">Create characters first to track their evolution</p>
            </div>
          )}
        </div>
      </Card>
    </div>
    </>
  );
};
