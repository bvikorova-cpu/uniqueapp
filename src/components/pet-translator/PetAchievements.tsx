import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const achievements = [
  { id: 1, title: "First Translation", desc: "Complete your first pet translation", icon: "🎤", points: 50, unlocked: false },
  { id: 2, title: "Emotion Expert", desc: "Detect 10 different emotions", icon: "💜", points: 100, unlocked: false },
  { id: 3, title: "Health Guardian", desc: "Complete 5 health scans", icon: "🏥", points: 150, unlocked: false },
  { id: 4, title: "Training Master", desc: "Create 10 training plans", icon: "🎓", points: 200, unlocked: false },
  { id: 5, title: "Diet Guru", desc: "Generate 5 diet plans", icon: "🥗", points: 100, unlocked: false },
  { id: 6, title: "Pet Whisperer", desc: "100 total translations", icon: "🐾", points: 500, unlocked: false },
  { id: 7, title: "Streak King", desc: "Maintain 30-day streak", icon: "🔥", points: 300, unlocked: false },
  { id: 8, title: "Community Star", desc: "Reach top 10 leaderboard", icon: "⭐", points: 250, unlocked: false },
  { id: 9, title: "Multi-Pet Owner", desc: "Analyze 3+ different pets", icon: "🐕", points: 150, unlocked: false },
  { id: 10, title: "Behavior Analyst", desc: "Complete 10 behavior analyses", icon: "🧠", points: 200, unlocked: false },
  { id: 11, title: "Weekly Champion", desc: "Win a weekly challenge", icon: "🏆", points: 400, unlocked: false },
  { id: 12, title: "Legend", desc: "Earn 2000+ total points", icon: "👑", points: 1000, unlocked: false },
];

interface PetAchievementsProps {
  totalPoints: number;
}

export default function PetAchievements({ totalPoints }: PetAchievementsProps) {
  return (
    <>
      <FloatingHowItWorks title="How Pet Achievements works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-black">🏅 Pet Achievements</h2>
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
          {totalPoints} Points
        </Badge>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {achievements.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
            <Card className={`text-center p-3 transition-all ${a.unlocked ? "border-purple-500/50 bg-purple-500/10" : "opacity-40"}`}>
              <span className="text-2xl">{a.icon}</span>
              <p className="text-xs font-bold mt-1 truncate">{a.title}</p>
              <p className="text-[9px] text-muted-foreground line-clamp-2">{a.desc}</p>
              <Badge className={`mt-1 text-[8px] ${a.unlocked ? "bg-purple-500 text-white" : "bg-muted text-muted-foreground"}`}>
                {a.unlocked ? "✓ Unlocked" : `${a.points} pts`}
              </Badge>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
    </>
    );
}
