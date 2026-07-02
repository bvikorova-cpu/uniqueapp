import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, TrendingUp, Star, Flame, CheckCircle2 } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const milestones = [
  { label: "10 tasks completed", progress: 80, icon: "📝", earned: false },
  { label: "5 experiments", progress: 100, icon: "🔬", earned: true },
  { label: "7-day streak", progress: 100, icon: "🔥", earned: true },
  { label: "50 words learned", progress: 60, icon: "📚", earned: false },
  { label: "First story", progress: 100, icon: "✍️", earned: true },
];

const recommendations = [
  { text: "Tommy could try more science experiments — he has a talent for them!", emoji: "🔬" },
  { text: "Emma loves drawing — try collaborative creative challenges!", emoji: "🎨" },
  { text: "Both kids have a great streak — praise them for their persistence!", emoji: "⭐" },
];

export const WeeklyDigest = () => {
  return (
    <>
      <FloatingHowItWorks title={"Weekly Digest - How it works"} steps={[{ title: 'Open', desc: 'Access the Weekly Digest section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Weekly Digest.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Weekly Digest & Milestones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Active Days", value: "6/7", icon: <Flame className="w-4 h-4 text-orange-500" />, color: "bg-orange-50" },
                { label: "Completed", value: "23", icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, color: "bg-green-50" },
                { label: "New Stars", value: "+18", icon: <Star className="w-4 h-4 text-yellow-500" />, color: "bg-yellow-50" },
              ].map((s, i) => (
                <div key={i} className={`${s.color} rounded-xl p-3 text-center`}>
                  <div className="flex justify-center mb-1">{s.icon}</div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-semibold flex items-center gap-2"><Target className="w-4 h-4 text-purple-500" /> Milestones</h4>
              {milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg">{m.icon}</span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{m.label}</span>
                      {m.earned ? <Badge className="bg-green-500 text-[10px] h-5">✓ Achieved</Badge> : <span className="text-xs text-muted-foreground">{m.progress}%</span>}
                    </div>
                    <Progress value={m.progress} className="h-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-500" />Recommendations for You</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-2 bg-white/70 rounded-lg p-3 text-sm"><span className="text-lg">{r.emoji}</span><p>{r.text}</p></div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
    </>
  );
};
