import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  earned: boolean;
  earned_at?: string;
}

export function QuantumAchievements({ onBack }: { onBack: () => void }) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [earnedCount, setEarnedCount] = useState(0);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: allAchievements } = await supabase.from("quantum_achievements").select("*").order("points", { ascending: true });

    let userAchievementIds: string[] = [];
    if (user) {
      const { data: userAch } = await supabase.from("quantum_user_achievements").select("achievement_id, earned_at").eq("user_id", user.id);
      userAchievementIds = (userAch || []).map(a => a.achievement_id);
    }

    const merged = (allAchievements || []).map(a => ({
      ...a,
      earned: userAchievementIds.includes(a.id),
    }));

    const earned = merged.filter(a => a.earned);
    setAchievements(merged);
    setEarnedCount(earned.length);
    setTotalPoints(earned.reduce((sum, a) => sum + a.points, 0));
    setLoading(false);
  };

  const categories = [...new Set(achievements.map(a => a.category))];

  return (
    <>
      <FloatingHowItWorks
        title='Quantum Achievements'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Quantum Achievements panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            Quantum Achievements
          </h2>
          <p className="text-xs text-muted-foreground">Earn badges by exploring quantum realities</p>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{earnedCount}</p>
          <p className="text-xs text-muted-foreground">Earned</p>
        </div>
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-center">
          <p className="text-2xl font-bold text-cyan-400">{achievements.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 text-center">
          <p className="text-2xl font-bold text-violet-400">{totalPoints}</p>
          <p className="text-xs text-muted-foreground">Points</p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-xs text-muted-foreground">{earnedCount}/{achievements.length}</span>
        </div>
        <Progress value={achievements.length > 0 ? (earnedCount / achievements.length) * 100 : 0} className="h-2" />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading achievements...</p>
      ) : (
        categories.map(cat => (
          <div key={cat}>
            <h3 className="text-sm font-semibold capitalize mb-3 text-cyan-400">{cat}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {achievements.filter(a => a.category === cat).map((ach, i) => (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`rounded-xl border p-4 flex items-center gap-3 ${
                    ach.earned
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : 'border-white/10 bg-white/2 opacity-60'
                  }`}
                >
                  <div className="text-2xl">{ach.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{ach.name}</h4>
                      {ach.earned ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{ach.description}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{ach.points}pts</Badge>
                </motion.div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
    </>
  );
}
