import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Image, Star, Trophy, Flame, Target, Medal, Award, Crown } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const ACHIEVEMENTS = [
  { id: "first", name: "First Page", desc: "Create your first coloring page", icon: Star, threshold: 1, color: "text-yellow-500" },
  { id: "five", name: "Creative Five", desc: "Create 5 coloring pages", icon: Target, threshold: 5, color: "text-blue-500" },
  { id: "ten", name: "Art Explorer", desc: "Create 10 coloring pages", icon: Medal, threshold: 10, color: "text-green-500" },
  { id: "twenty", name: "Color Master", desc: "Create 20 pages", icon: Trophy, threshold: 20, color: "text-purple-500" },
  { id: "fifty", name: "Legendary Artist", desc: "Create 50 pages", icon: Crown, threshold: 50, color: "text-amber-500" },
  { id: "hundred", name: "Coloring Legend", desc: "Create 100 pages", icon: Award, threshold: 100, color: "text-red-500" },
];

interface ColoringStatsProps {
  totalPages: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  favoriteCount: number;
}

export function ColoringStats({ totalPages, easyCount, mediumCount, hardCount, favoriteCount }: ColoringStatsProps) {
  const displayValue = (v: number) => v > 0 ? v : "—";

  const stats = [
    { label: "Total Pages", value: displayValue(totalPages), icon: Image, gradient: "from-primary/20 to-accent/20", border: "border-primary/20" },
    { label: "Favorites", value: displayValue(favoriteCount), icon: Star, gradient: "from-amber-500/20 to-yellow-500/20", border: "border-amber-500/20" },
    { label: "Easy", value: displayValue(easyCount), icon: Target, gradient: "from-green-500/20 to-emerald-500/20", border: "border-green-500/20" },
    { label: "Hard", value: displayValue(hardCount), icon: Flame, gradient: "from-red-500/20 to-orange-500/20", border: "border-red-500/20" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Coloring Stats - How it works"} steps={[{ title: 'Open', desc: 'Access the Coloring Stats section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coloring Stats.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className={`backdrop-blur-xl bg-card/80 ${stat.border} overflow-hidden`}>
              <CardContent className="p-4 text-center relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
                <div className="relative z-10">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-background/80 backdrop-blur-sm border border-border/30 flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Difficulty breakdown */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold text-sm mb-3">Difficulty Breakdown</h3>
            {[
              { label: "Easy", count: easyCount, color: "bg-green-500", pct: totalPages > 0 ? (easyCount / totalPages) * 100 : 0 },
              { label: "Medium", count: mediumCount, color: "bg-amber-500", pct: totalPages > 0 ? (mediumCount / totalPages) * 100 : 0 },
              { label: "Hard", count: hardCount, color: "bg-red-500", pct: totalPages > 0 ? (hardCount / totalPages) * 100 : 0 },
            ].map((d) => (
              <div key={d.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{d.label}</span>
                  <span className="text-muted-foreground">{d.count > 0 ? d.count : "—"} ({Math.round(d.pct)}%)</span>
                </div>
                <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                  <motion.div className={`h-full ${d.color} rounded-full`} initial={{ width: 0 }} animate={{ width: `${d.pct}%` }} transition={{ duration: 1, delay: 0.3 }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
          <CardContent className="p-5">
            <h3 className="font-semibold text-sm mb-4">Achievements</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ACHIEVEMENTS.map((a, i) => {
                const unlocked = totalPages >= a.threshold;
                const progress = Math.min((totalPages / a.threshold) * 100, 100);
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.45 + i * 0.05 }}
                    className={`p-3 rounded-xl border transition-all hover:scale-[1.03] ${
                      unlocked ? "border-primary/30 bg-gradient-to-br from-primary/10 to-accent/5" : "border-border/30 bg-muted/20 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <a.icon className={`h-5 w-5 ${unlocked ? a.color : "text-muted-foreground"}`} />
                      <span className="font-medium text-xs">{a.name}</span>
                      {unlocked && <Badge className="ml-auto bg-primary text-primary-foreground text-[10px] px-1.5">Done</Badge>}
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-1.5">{a.desc}</p>
                    <Progress value={progress} className="h-1.5" />
                    <p className="text-[10px] text-muted-foreground mt-1">{totalPages}/{a.threshold}</p>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
    </>
  );
}
