import { useState } from "react";
import { motion } from "framer-motion";
import { Snowflake, Sun, Leaf, Flame, Clock, CheckCircle2, Gift, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const seasons = [
  { id: "spring", name: "Spring Bloom", emoji: "🌸", icon: Leaf, color: "from-green-500 to-emerald-500", active: false },
  { id: "summer", name: "Summer Festival", emoji: "☀️", icon: Sun, color: "from-amber-500 to-orange-500", active: true },
  { id: "autumn", name: "Harvest Season", emoji: "🍂", icon: Leaf, color: "from-orange-600 to-red-600", active: false },
  { id: "winter", name: "Winter Gala", emoji: "❄️", icon: Snowflake, color: "from-blue-400 to-cyan-500", active: false },
];

// Real seasonal mission tracking is not yet wired to user activity.
// Until backend tracking is implemented we show 0/target so users see
// what's available without being misled by fake progress.
const currentMissions = [
  { id: "m1", emoji: "📸", title: "Summer Snapshot", desc: "Post 10 photos this season", progress: 0, target: 10, reward: "☀️ Summer Photographer Badge", xp: 300 },
  { id: "m2", emoji: "🏖️", title: "Beach Vibes", desc: "Use 5 seasonal hashtags", progress: 0, target: 5, reward: "🏖️ Beach Explorer Badge", xp: 150 },
  { id: "m3", emoji: "🎆", title: "Festival Star", desc: "Attend 3 community events", progress: 0, target: 3, reward: "🎆 Festival VIP Badge", xp: 500 },
  { id: "m4", emoji: "🌊", title: "Wave Rider", desc: "Maintain a 14-day streak during summer", progress: 0, target: 14, reward: "🌊 Wave Rider Badge", xp: 750 },
  { id: "m5", emoji: "🍹", title: "Social Mixer", desc: "Comment on 50 posts", progress: 0, target: 50, reward: "🍹 Social Butterfly Badge", xp: 200 },
];

export default function RewardsSeasonalMissions() {
  const { toast } = useToast();
  const activeSeason = seasons.find(s => s.active)!;
  const daysLeft = 47;

  return (
    <div className="space-y-4">
      {/* Season Header */}
      <Card className={`p-4 bg-gradient-to-br ${activeSeason.color}/10 border-amber-400/20 backdrop-blur-md`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${activeSeason.color} flex items-center justify-center`}>
              <span className="text-2xl">{activeSeason.emoji}</span>
            </div>
            <div>
              <h3 className="font-black text-lg">{activeSeason.name}</h3>
              <p className="text-xs text-muted-foreground">Season 4 · Active Now</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-amber-500 flex items-center gap-1"><Clock className="h-3 w-3" /> {daysLeft} days left</p>
            <p className="text-[10px] text-muted-foreground">Complete missions for exclusive badges</p>
          </div>
        </div>

        {/* Season selector */}
        <div className="flex gap-2 mt-3">
          {seasons.map(s => (
            <div key={s.id} className={`flex-1 text-center p-2 rounded-lg text-xs font-bold ${s.active ? `bg-gradient-to-r ${s.color} text-white` : "bg-muted/20 text-muted-foreground"}`}>
              <span className="text-sm block">{s.emoji}</span>
              {s.name.split(" ")[0]}
            </div>
          ))}
        </div>
      </Card>

      {/* Missions */}
      <Card className="p-4 bg-card/80 backdrop-blur-md border-amber-400/15">
        <h3 className="font-bold flex items-center gap-2 mb-3"><Target className="h-4 w-4 text-amber-500" /> Active Missions</h3>
        <div className="space-y-3">
          {currentMissions.map((m, i) => {
            const pct = Math.round((m.progress / m.target) * 100);
            const isComplete = m.progress >= m.target;
            return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className={`p-3 rounded-xl border ${isComplete ? "bg-green-500/10 border-green-500/20" : "bg-muted/10 border-border/20"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{m.emoji}</span>
                    <div>
                      <p className="font-bold text-sm">{m.title}</p>
                      <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-amber-500">+{m.xp} XP</p>
                    <p className="text-[10px] text-muted-foreground">{m.progress}/{m.target}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={pct} className="h-1.5 flex-1" />
                  {isComplete && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Gift className="h-3 w-3" /> Reward: {m.reward}</p>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
