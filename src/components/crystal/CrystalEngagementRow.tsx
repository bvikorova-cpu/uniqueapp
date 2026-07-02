import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, TrendingUp, Trophy, Gem, Heart, Sparkles, Lock, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const achievementDefs = [
  { emoji: "🔮", name: "First Reading", key: "total_readings", threshold: 1 },
  { emoji: "💎", name: "Crystal Guru", key: "crystals_collected", threshold: 10 },
  { emoji: "✨", name: "Energy Master", key: "total_readings", threshold: 25 },
  { emoji: "🧘", name: "7-Day Zen", key: "current_streak", threshold: 7 },
  { emoji: "🌙", name: "Chakra Aligned", key: "chakras_balanced", threshold: 7 },
  { emoji: "👑", name: "Healer", key: "total_points", threshold: 500 },
];

export const CrystalEngagementRow = () => {
  const [stats, setStats] = useState<any>(null);
  const [activityDays, setActivityDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await (supabase as any).from("crystal_user_stats").select("*").eq("user_id", session.user.id).maybeSingle();
      if (data) setStats(data);

      // Check activity for current week
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
      monday.setHours(0, 0, 0, 0);

      const { data: readings } = await (supabase as any).from("crystal_energy_readings").select("created_at").eq("user_id", session.user.id).gte("created_at", monday.toISOString());
      const { data: sessions } = await (supabase as any).from("crystal_meditation_sessions").select("completed_at").eq("user_id", session.user.id).gte("completed_at", monday.toISOString());

      const activeDays = new Set<number>();
      [...(readings || []), ...(sessions || [])].forEach((r: any) => {
        const d = new Date(r.created_at || r.completed_at);
        activeDays.add((d.getDay() + 6) % 7); // Mon=0
      });
      setActivityDays(activeDays);
    };
    fetch();
  }, []);

  const streak = stats?.current_streak || 0;
  const readings = stats?.total_readings || 0;
  const crystals = stats?.crystals_collected || 0;
  const chakras = stats?.chakras_balanced || 0;

  return (
    <>
      <FloatingHowItWorks
        title='Crystal Engagement Row'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Crystal Engagement Row panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Healing Streak */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-border/50 h-full hover:border-primary/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 text-white" />
              </div>
              Healing Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl font-black bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">{streak}</span>
              <span className="text-xs text-muted-foreground">day streak</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => (
                <div key={day} className="text-center">
                  <div className="text-[10px] text-muted-foreground mb-1">{day}</div>
                  <div className={`w-7 h-7 rounded-full border flex items-center justify-center mx-auto transition-colors ${activityDays.has(i) ? "bg-primary border-primary" : "border-border/50 bg-muted/20"}`}>
                    {activityDays.has(i) ? <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" /> : <span className="text-[10px] text-muted-foreground">—</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Energy Progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-border/50 h-full hover:border-primary/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
              Energy Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Readings Done", value: readings, max: 100, icon: Sparkles, color: "bg-violet-500" },
              { label: "Crystals Collected", value: crystals, max: 50, icon: Gem, color: "bg-cyan-500" },
              { label: "Chakras Balanced", value: Math.min(chakras, 7), max: 7, icon: Heart, color: "bg-pink-500" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <stat.icon className="w-3 h-3" /> {stat.label}
                  </span>
                  <span className="font-semibold text-foreground">{stat.value} / {stat.max}</span>
                </div>
                <Progress value={Math.min((stat.value / stat.max) * 100, 100)} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-border/50 h-full hover:border-primary/30 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
                <Trophy className="w-3.5 h-3.5 text-white" />
              </div>
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {achievementDefs.map((badge) => {
                const unlocked = stats && (stats[badge.key] || 0) >= badge.threshold;
                return (
                  <div key={badge.name} className={`text-center p-2 rounded-xl bg-gradient-to-br border border-border/30 transition-opacity ${unlocked ? "opacity-100 from-primary/10 to-accent/10" : "opacity-40 from-muted/10 to-muted/5"}`}>
                    <div className="text-lg mb-0.5">{badge.emoji}</div>
                    <div className="text-[9px] text-muted-foreground font-medium">{badge.name}</div>
                    {unlocked ? <CheckCircle2 className="w-2.5 h-2.5 text-primary mx-auto mt-0.5" /> : <Lock className="w-2.5 h-2.5 text-muted-foreground mx-auto mt-0.5" />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
    </>
  );
};
