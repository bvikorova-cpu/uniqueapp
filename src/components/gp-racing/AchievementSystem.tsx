import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Award, Trophy, Star, Flame, Zap, Target, Crown, Shield, Car, Rocket, Medal, Lock } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  bgGradient: string;
  category: "racing" | "garage" | "social" | "legendary";
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  reward: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const achievements: Achievement[] = [
  { id: "1", name: "First Blood", description: "Win your first race", icon: Trophy, color: "text-amber-400", bgGradient: "from-amber-950/30 to-orange-950/20", category: "racing", progress: 1, maxProgress: 1, unlocked: true, reward: "50 Coins", rarity: "common" },
  { id: "2", name: "Speed Demon", description: "Win 10 races", icon: Flame, color: "text-orange-400", bgGradient: "from-orange-950/30 to-red-950/20", category: "racing", progress: 7, maxProgress: 10, unlocked: false, reward: "200 Coins + Title", rarity: "rare" },
  { id: "3", name: "Perfect Lap", description: "Set a track record", icon: Target, color: "text-cyan-400", bgGradient: "from-cyan-950/30 to-blue-950/20", category: "racing", progress: 1, maxProgress: 1, unlocked: true, reward: "100 Coins", rarity: "rare" },
  { id: "4", name: "Unbeatable", description: "Win 5 races in a row", icon: Crown, color: "text-violet-400", bgGradient: "from-violet-950/30 to-purple-950/20", category: "racing", progress: 3, maxProgress: 5, unlocked: false, reward: "500 Coins + Crown Badge", rarity: "epic" },
  { id: "5", name: "Car Collector", description: "Own 5 cars", icon: Car, color: "text-emerald-400", bgGradient: "from-emerald-950/30 to-cyan-950/20", category: "garage", progress: 3, maxProgress: 5, unlocked: false, reward: "150 Coins", rarity: "common" },
  { id: "6", name: "Max Power", description: "Upgrade any stat to 100", icon: Zap, color: "text-yellow-400", bgGradient: "from-yellow-950/30 to-amber-950/20", category: "garage", progress: 87, maxProgress: 100, unlocked: false, reward: "300 Coins + Glow Effect", rarity: "rare" },
  { id: "7", name: "Full Garage", description: "Own 10 cars", icon: Shield, color: "text-blue-400", bgGradient: "from-blue-950/30 to-indigo-950/20", category: "garage", progress: 3, maxProgress: 10, unlocked: false, reward: "500 Gems", rarity: "epic" },
  { id: "8", name: "Team Player", description: "Join a racing team", icon: Medal, color: "text-pink-400", bgGradient: "from-pink-950/30 to-rose-950/20", category: "social", progress: 1, maxProgress: 1, unlocked: true, reward: "75 Coins", rarity: "common" },
  { id: "9", name: "Social Racer", description: "Race against 20 unique drivers", icon: Rocket, color: "text-indigo-400", bgGradient: "from-indigo-950/30 to-violet-950/20", category: "social", progress: 12, maxProgress: 20, unlocked: false, reward: "200 Coins", rarity: "rare" },
  { id: "10", name: "Grand Champion", description: "Win a Season Championship", icon: Star, color: "text-amber-300", bgGradient: "from-amber-900/40 to-yellow-900/30", category: "legendary", progress: 0, maxProgress: 1, unlocked: false, reward: "2,000 Coins + Legendary Title + Exclusive Livery", rarity: "legendary" },
  { id: "11", name: "100 Victories", description: "Win 100 total races", icon: Award, color: "text-red-400", bgGradient: "from-red-950/40 to-orange-950/30", category: "legendary", progress: 7, maxProgress: 100, unlocked: false, reward: "5,000 Coins + Legend Badge", rarity: "legendary" },
];

const rarityColors = {
  common: "text-gray-400 border-gray-500/20 bg-gray-500/10",
  rare: "text-blue-400 border-blue-500/20 bg-blue-500/10",
  epic: "text-violet-400 border-violet-500/20 bg-violet-500/10",
  legendary: "text-amber-400 border-amber-500/20 bg-amber-500/10",
};

export function AchievementSystem({ onBack }: { onBack: () => void }) {
  const [filter, setFilter] = useState<"all" | "racing" | "garage" | "social" | "legendary">("all");

  const filtered = filter === "all" ? achievements : achievements.filter(a => a.category === filter);
  const totalUnlocked = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.filter(a => a.unlocked).length * 100;

  return (
    <>
      <FloatingHowItWorks title={"Achievement System - How it works"} steps={[{ title: 'Open', desc: 'Access the Achievement System section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Achievement System.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-cyan-400 hover:bg-cyan-950/30">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-mono font-bold text-white uppercase tracking-wider">Achievements</h2>
          <p className="text-[10px] font-mono text-cyan-400/40 uppercase tracking-[0.3em]">Track your racing milestones</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 bg-slate-900/60 border-cyan-500/20 backdrop-blur-sm text-center">
          <Award className="h-5 w-5 mx-auto text-amber-400 mb-1" />
          <p className="font-mono font-bold text-lg text-white">{totalUnlocked}/{achievements.length}</p>
          <p className="text-[9px] font-mono text-cyan-400/40 uppercase">Unlocked</p>
        </Card>
        <Card className="p-3 bg-slate-900/60 border-cyan-500/20 backdrop-blur-sm text-center">
          <Star className="h-5 w-5 mx-auto text-violet-400 mb-1" />
          <p className="font-mono font-bold text-lg text-white">{totalPoints}</p>
          <p className="text-[9px] font-mono text-cyan-400/40 uppercase">Points</p>
        </Card>
        <Card className="p-3 bg-slate-900/60 border-cyan-500/20 backdrop-blur-sm text-center">
          <Trophy className="h-5 w-5 mx-auto text-emerald-400 mb-1" />
          <p className="font-mono font-bold text-lg text-white">{((totalUnlocked / achievements.length) * 100).toFixed(0)}%</p>
          <p className="text-[9px] font-mono text-cyan-400/40 uppercase">Complete</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "racing", "garage", "social", "legendary"] as const).map(f => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm"
            onClick={() => setFilter(f)}
            className={filter === f
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400/30 font-mono text-xs uppercase"
              : "border-cyan-500/30 text-cyan-300 font-mono text-xs uppercase whitespace-nowrap"
            }>
            {f}
          </Button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((ach, i) => (
          <motion.div key={ach.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className={`p-4 bg-gradient-to-b ${ach.bgGradient} border-cyan-500/10 backdrop-blur-sm relative overflow-hidden ${
              !ach.unlocked ? "opacity-80" : ""
            }`}>
              {ach.unlocked && (
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
              )}
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ach.unlocked ? "bg-slate-950/60" : "bg-slate-950/80"}`}>
                  {ach.unlocked ? <ach.icon className={`h-5 w-5 ${ach.color}`} /> : <Lock className="h-5 w-5 text-slate-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono font-bold text-sm text-white">{ach.name}</h3>
                    <Badge className={`font-mono text-[8px] px-1.5 py-0 ${rarityColors[ach.rarity]}`}>
                      {ach.rarity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-[10px] font-mono text-cyan-400/50 mt-0.5">{ach.description}</p>
                  {!ach.unlocked && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-mono text-cyan-400/40">{ach.progress}/{ach.maxProgress}</span>
                        <span className="text-[9px] font-mono text-cyan-400/40">{((ach.progress / ach.maxProgress) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={(ach.progress / ach.maxProgress) * 100} className="h-1.5 bg-slate-800" />
                    </div>
                  )}
                  <p className="text-[9px] font-mono text-amber-400/60 mt-1.5">🎁 {ach.reward}</p>
                </div>
                {ach.unlocked && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  );
}
