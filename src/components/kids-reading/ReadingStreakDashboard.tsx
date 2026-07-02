import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  textsAnalyzed: number;
  wordsLearned: number;
  quizzesTaken: number;
  currentStreak: number;
}

export const ReadingStreakDashboard = ({
  textsAnalyzed,
  wordsLearned,
  quizzesTaken,
  currentStreak,
}: Props) => {
  const stats = [
    { label: "Texts Read", value: textsAnalyzed, icon: "📖", max: 50 },
    { label: "Words Learned", value: wordsLearned, icon: "🔤", max: 200 },
    { label: "Quizzes Passed", value: quizzesTaken, icon: "🎯", max: 30 },
    { label: "Day Streak", value: currentStreak, icon: "🔥", max: 30 },
  ];

  const xp = textsAnalyzed * 10 + wordsLearned * 2 + quizzesTaken * 15;
  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;

  return (
    <>
      <FloatingHowItWorks title={"Reading Streak Dashboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Reading Streak Dashboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Reading Streak Dashboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardContent className="pt-6 space-y-4">
        {/* XP Bar */}
        <div className="flex items-center gap-3">
          <motion.div
            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 font-black text-primary text-sm"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            L{level}
          </motion.div>
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold">Level {level} Reader</span>
              <span className="text-muted-foreground">{xpInLevel}/100 XP</span>
            </div>
            <Progress value={xpInLevel} className="h-2" />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05 }}
              className="text-center p-2 rounded-xl bg-background/60 backdrop-blur-sm"
            >
              <div className="text-xl">{stat.icon}</div>
              <div className="font-black text-lg">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground leading-tight">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Mini streak calendar */}
        <div className="flex gap-1 justify-center">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                i < currentStreak
                  ? "bg-primary/20 text-primary"
                  : "bg-muted/30 text-muted-foreground"
              }`}
            >
              {["M", "T", "W", "T", "F", "S", "S"][i]}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
  );
};
