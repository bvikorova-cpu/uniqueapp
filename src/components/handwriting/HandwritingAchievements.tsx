import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";
import { useHandwritingStats } from "@/hooks/useHandwritingStats";

export const HandwritingAchievements = () => {
  const { data } = useHandwritingStats();
  const counts = data?.counts ?? {};
  const total = data?.total ?? 0;
  const streak = data?.streak ?? 0;

  const achievements = [
    { icon: "✍️", name: "First Analysis", unlocked: total >= 1 },
    { icon: "🎯", name: "Detail Spotter", unlocked: total >= 5 },
    { icon: "🧠", name: "Mind Reader", unlocked: (counts["personal"] ?? 0) >= 3 },
    { icon: "💼", name: "Pro Analyst", unlocked: (counts["professional"] ?? 0) + (counts["business"] ?? 0) >= 3 },
    { icon: "💕", name: "Heart Expert", unlocked: (counts["relationship"] ?? 0) >= 2 },
    { icon: "👑", name: "Master Graphologist", unlocked: total >= 15 || streak >= 7 },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Handwriting Achievements - How it works"} steps={[{ title: 'Analyze', desc: 'Each completed analysis counts towards your achievements.' }, { title: 'Vary', desc: 'Personal, professional and relationship analyses unlock different badges.' }, { title: 'Unlock', desc: 'Badges light up automatically once their condition is met.' }, { title: 'Review', desc: 'All badges reflect real analyses stored on your account.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-500" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {achievements.map((a, i) => (
            <motion.div
              key={a.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              whileHover={{ scale: 1.1 }}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                a.unlocked
                  ? "bg-primary/10 border-primary/30"
                  : "bg-muted/10 border-border/20 opacity-40"
              }`}
            >
              <span className="text-lg">{a.icon}</span>
              <span className="text-[9px] text-muted-foreground text-center leading-tight">{a.name}</span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
  );
};
