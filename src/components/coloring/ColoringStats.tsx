import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Image, Star, Trophy, Flame, Target, Medal, Award, Crown
} from "lucide-react";

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
  const stats = [
    { label: "Total Pages", value: totalPages, icon: Image, color: "from-blue-500 to-cyan-500" },
    { label: "Favorites", value: favoriteCount, icon: Star, color: "from-amber-500 to-yellow-500" },
    { label: "Easy", value: easyCount, icon: Target, color: "from-green-500 to-emerald-500" },
    { label: "Hard", value: hardCount, icon: Flame, color: "from-red-500 to-orange-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Difficulty breakdown */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-sm mb-3">Difficulty Breakdown</h3>
          {[
            { label: "Easy", count: easyCount, color: "bg-green-500", pct: totalPages > 0 ? (easyCount / totalPages) * 100 : 0 },
            { label: "Medium", count: mediumCount, color: "bg-amber-500", pct: totalPages > 0 ? (mediumCount / totalPages) * 100 : 0 },
            { label: "Hard", count: hardCount, color: "bg-red-500", pct: totalPages > 0 ? (hardCount / totalPages) * 100 : 0 },
          ].map((d) => (
            <div key={d.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{d.label}</span>
                <span className="text-muted-foreground">{d.count} ({Math.round(d.pct)}%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${d.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${d.pct}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-4">Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = totalPages >= a.threshold;
              const progress = Math.min((totalPages / a.threshold) * 100, 100);
              return (
                <motion.div
                  key={a.id}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    unlocked
                      ? "border-primary/30 bg-primary/5"
                      : "border-muted bg-muted/30 opacity-60"
                  }`}
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <a.icon className={`h-5 w-5 ${unlocked ? a.color : "text-muted-foreground"}`} />
                    <span className="font-medium text-xs">{a.name}</span>
                    {unlocked && (
                      <Badge className="ml-auto bg-primary text-primary-foreground text-[10px] px-1.5">✓</Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-1.5">{a.desc}</p>
                  <Progress value={progress} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {totalPages}/{a.threshold}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
