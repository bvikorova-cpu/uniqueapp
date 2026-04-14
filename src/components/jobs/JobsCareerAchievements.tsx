import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ACHIEVEMENTS = [
  { icon: "🎯", title: "First Application", desc: "Submit your first job application", points: 10, unlocked: false },
  { icon: "📝", title: "Resume Master", desc: "Use AI Resume Builder 3 times", points: 25, unlocked: false },
  { icon: "🎤", title: "Interview Ready", desc: "Complete an AI interview coaching session", points: 20, unlocked: false },
  { icon: "💰", title: "Salary Expert", desc: "Run 5 salary negotiations analyses", points: 30, unlocked: false },
  { icon: "🗺️", title: "Career Navigator", desc: "Create your career path plan", points: 20, unlocked: false },
  { icon: "🔥", title: "7-Day Streak", desc: "Maintain a 7-day application streak", points: 35, unlocked: false },
  { icon: "🌍", title: "Global Explorer", desc: "Apply to jobs in 3 different countries", points: 40, unlocked: false },
  { icon: "⭐", title: "Top Candidate", desc: "Reach the skill leaderboard top 10", points: 50, unlocked: false },
  { icon: "🏆", title: "Challenge Champion", desc: "Win 3 weekly job challenges", points: 60, unlocked: false },
  { icon: "👑", title: "Career Legend", desc: "Unlock all other achievements", points: 100, unlocked: false },
  { icon: "🚀", title: "Quick Starter", desc: "Apply within 1 hour of account creation", points: 15, unlocked: false },
  { icon: "💎", title: "Diamond Profile", desc: "Achieve 100% profile completeness score", points: 45, unlocked: false },
];

export default function JobsCareerAchievements() {
  const totalPoints = ACHIEVEMENTS.filter(a => a.unlocked).reduce((s, a) => s + a.points, 0);
  const maxPoints = ACHIEVEMENTS.reduce((s, a) => s + a.points, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black">🏅 Career Achievements</h2>
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-sm">
          {totalPoints} / {maxPoints} pts
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {ACHIEVEMENTS.map((a, i) => (
          <motion.div key={a.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
            <Card className={`text-center p-4 border-border/30 ${a.unlocked ? "bg-amber-500/10 border-amber-500/30" : "bg-card/50 opacity-50"}`}>
              <div className="text-3xl mb-2">{a.icon}</div>
              <p className="font-bold text-xs mb-1">{a.title}</p>
              <p className="text-[10px] text-muted-foreground mb-2">{a.desc}</p>
              <Badge variant="outline" className="text-[9px]">{a.points} pts</Badge>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
