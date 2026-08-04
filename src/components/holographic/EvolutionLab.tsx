import { ArrowLeft, TrendingUp, Star, Activity, Crown, Swords, Heart, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useHolographicStats } from "@/hooks/useHolographicStats";

interface Props { onBack: () => void; }

const EVOLUTION_STAGES = [
  { level: 1, name: "Seed Form", min: 0, desc: "Your first avatar is created", unlocks: "Avatar Creator" },
  { level: 10, name: "Awakened", min: 500, desc: "Regular activity across tools", unlocks: "Avatar Restyle" },
  { level: 25, name: "Sentient", min: 2000, desc: "Consistent battles and creations", unlocks: "Battle Arena mastery" },
  { level: 50, name: "Transcendent", min: 10000, desc: "Deep collection and win record", unlocks: "Breeding mastery" },
  { level: 75, name: "Ascended", min: 50000, desc: "Elite level of real activity", unlocks: "Rare trait pool" },
  { level: 100, name: "Eternal", min: 200000, desc: "Maximum evolution reached", unlocks: "Legendary status" },
];

export const EvolutionLab = ({ onBack }: Props) => {
  const { stats, loading } = useHolographicStats();

  const activity = [
    { icon: Crown, name: "Avatars created", value: stats.avatars },
    { icon: Swords, name: "Battles fought", value: stats.battles },
    { icon: Star, name: "Battles won", value: stats.wins },
    { icon: Heart, name: "Offspring bred", value: stats.breedings },
    { icon: Sparkles, name: "Rare offspring", value: stats.rareOffspring },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Evolution Lab</h2>
          <p className="text-sm text-muted-foreground">Your real progress across every avatar tool</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
      ) : (
        <>
          {/* XP + level from real activity */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Evolution Progress</h3>
                <Badge className="bg-primary/20 text-primary">Level {stats.level}</Badge>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{stats.xp.toLocaleString()} XP</span>
                  <span className="text-muted-foreground">next stage at {stats.nextLevelXp.toLocaleString()} XP</span>
                </div>
                <Progress value={stats.progressToNextLevel} className="h-2" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg border border-border/50 p-3">
                  <p className="text-lg font-black">{stats.interactions}</p>
                  <p className="text-xs text-muted-foreground">Total actions</p>
                </div>
                <div className="rounded-lg border border-border/50 p-3">
                  <p className="text-lg font-black">{stats.winRate}%</p>
                  <p className="text-xs text-muted-foreground">Battle win rate</p>
                </div>
                <div className="rounded-lg border border-border/50 p-3">
                  <p className="text-lg font-black">{stats.styles.length}</p>
                  <p className="text-xs text-muted-foreground">Styles explored</p>
                </div>
                <div className="rounded-lg border border-border/50 p-3">
                  <p className="text-lg font-black">
                    {stats.lastActivity ? new Date(stats.lastActivity).toLocaleDateString() : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Last activity</p>
                </div>
              </div>
              {stats.interactions === 0 && (
                <p className="text-xs text-muted-foreground">
                  No activity yet — create your first avatar to start earning XP.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Real activity breakdown */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Activity Breakdown</h3>
              <div className="space-y-3">
                {activity.map((row, i) => (
                  <motion.div key={row.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/50 p-3">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <row.icon className="w-4 h-4 text-primary" /> {row.name}
                    </span>
                    <span className="text-sm font-black">{row.value}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stages relative to real XP */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-primary" /> Evolution Stages</h3>
              <div className="space-y-4">
                {EVOLUTION_STAGES.map((stage, i) => {
                  const reached = stats.xp >= stage.min;
                  return (
                    <motion.div key={stage.level} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      className={`p-4 rounded-xl border transition-all ${reached ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Badge className={reached ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}>Lv.{stage.level}</Badge>
                          <h4 className="font-bold text-sm">{stage.name}</h4>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {reached ? "Reached" : `${(stage.min - stats.xp).toLocaleString()} XP to go`}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{stage.desc}</p>
                      <p className="text-xs text-primary flex items-center gap-1"><Star className="w-3 h-3" /> Unlocks: {stage.unlocks}</p>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
