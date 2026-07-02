import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Flame, Trophy, Star, Zap, Target, Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const XP_LEVELS = [
  { level: 1, xp: 0, title: "Beginner" },
  { level: 2, xp: 100, title: "Rookie" },
  { level: 3, xp: 300, title: "Regular" },
  { level: 4, xp: 600, title: "Athlete" },
  { level: 5, xp: 1000, title: "Pro" },
  { level: 6, xp: 1500, title: "Elite" },
  { level: 7, xp: 2200, title: "Champion" },
  { level: 8, xp: 3000, title: "Legend" },
  { level: 9, xp: 4000, title: "Mythic" },
  { level: 10, xp: 5500, title: "Immortal" },
];

const DAILY_CHALLENGES = [
  { id: "workout", title: "Complete a Workout", xp: 25, icon: "🏋️" },
  { id: "steps", title: "Walk 8,000+ Steps", xp: 15, icon: "🚶" },
  { id: "water", title: "Drink 2L Water", xp: 10, icon: "💧" },
  { id: "meal", title: "Log a Healthy Meal", xp: 10, icon: "🥗" },
  { id: "stretch", title: "10 Min Stretching", xp: 15, icon: "🧘" },
  { id: "sleep", title: "Sleep 7+ Hours", xp: 20, icon: "😴" },
];

export default function AIWorkoutStreaks({ onBack }: Props) {
  const [totalXP, setTotalXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProgress(); }, []);

  const loadProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase.from("activity_logs").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
      if (data) {
        const total = data.reduce((sum, d) => sum + (d.points_earned || 0), 0);
        setTotalXP(total);
        const today = new Date().toISOString().split("T")[0];
        const todayLogs = data.filter(d => d.created_at?.startsWith(today));
        setCompleted(todayLogs.map(d => d.activity_type));
        // Calculate streak
        let s = 0;
        const days = new Set(data.map(d => d.created_at?.split("T")[0]));
        const d = new Date();
        while (days.has(d.toISOString().split("T")[0])) { s++; d.setDate(d.getDate() - 1); }
        setStreak(s);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const completeChallenge = async (challengeId: string, xp: number) => {
    if (completed.includes(challengeId)) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; }
      await supabase.from("activity_logs").insert({ user_id: user.id, activity_type: challengeId, points_earned: xp });
      setCompleted(prev => [...prev, challengeId]);
      setTotalXP(prev => prev + xp);
      toast({ title: `+${xp} XP! 🎉`, description: "Challenge completed!" });
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const currentLevel = XP_LEVELS.reduce((acc, l) => totalXP >= l.xp ? l : acc, XP_LEVELS[0]);
  const nextLevel = XP_LEVELS.find(l => l.xp > totalXP) || XP_LEVELS[XP_LEVELS.length - 1];
  const progressToNext = nextLevel.xp > currentLevel.xp ? ((totalXP - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)) * 100 : 100;

  return (
    <>
      <FloatingHowItWorks title={"A I Workout Streaks - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Workout Streaks section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Workout Streaks.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <span className="font-bold text-yellow-400">Workout Streaks & XP</span>
          <span className="text-xs bg-green-500/20 px-2 py-0.5 rounded-full text-green-300">Free</span>
        </div>
      </div>

      {/* Level & Streak */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 text-center">
            <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-3xl font-black text-yellow-400">Level {currentLevel.level}</div>
            <div className="text-sm text-muted-foreground">{currentLevel.title}</div>
            <Progress value={progressToNext} className="mt-3 h-2" />
            <div className="text-xs text-muted-foreground mt-1">{totalXP} / {nextLevel.xp} XP</div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-5 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30 text-center">
            <Flame className="h-8 w-8 text-orange-400 mx-auto mb-2" />
            <div className="text-3xl font-black text-orange-400">{streak} Days</div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-5 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30 text-center">
            <Zap className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <div className="text-3xl font-black text-emerald-400">{totalXP}</div>
            <div className="text-sm text-muted-foreground">Total XP Earned</div>
          </Card>
        </motion.div>
      </div>

      {/* Daily Challenges */}
      <h3 className="text-xl font-bold flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Daily Challenges</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DAILY_CHALLENGES.map((c, i) => {
          const done = completed.includes(c.id);
          return (
            <motion.div key={c.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }}>
              <Card className={`p-4 cursor-pointer transition-all duration-300 ${done ? "bg-emerald-500/10 border-emerald-500/30" : "bg-card/80 border-border/60 hover:border-primary/50 hover:scale-[1.02]"}`} onClick={() => !done && completeChallenge(c.id, c.xp)}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{c.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{c.title}</h4>
                    <Badge variant="outline" className={done ? "bg-emerald-500/20 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"}>
                      {done ? "✅ Completed" : `+${c.xp} XP`}
                    </Badge>
                  </div>
                  {done && <Medal className="h-5 w-5 text-emerald-400" />}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Rank Ladder */}
      <h3 className="text-xl font-bold flex items-center gap-2"><Medal className="h-5 w-5 text-yellow-400" /> Rank Ladder</h3>
      <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/60">
        <div className="space-y-2">
          {XP_LEVELS.map((l) => (
            <div key={l.level} className={`flex items-center justify-between p-2 rounded-lg transition-colors ${currentLevel.level === l.level ? "bg-yellow-500/10 border border-yellow-500/30" : totalXP >= l.xp ? "bg-emerald-500/5" : "opacity-50"}`}>
              <div className="flex items-center gap-3">
                <span className="text-lg font-black w-8">{l.level}</span>
                <span className="font-semibold">{l.title}</span>
              </div>
              <span className="text-sm text-muted-foreground">{l.xp} XP</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
    </>
  );
}
