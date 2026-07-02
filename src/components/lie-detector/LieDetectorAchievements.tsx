import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const achievements = [
  { icon: "🔍", name: "First Scan", unlocked: false },
  { icon: "🧵", name: "Thread Master", unlocked: false },
  { icon: "🧠", name: "Profiler", unlocked: false },
  { icon: "🎯", name: "Sharp Eye", unlocked: false },
  { icon: "⚡", name: "Speed Reader", unlocked: false },
  { icon: "👑", name: "Truth Seeker", unlocked: false },
];

export const LieDetectorAchievements = () => {
  return (
    <>
      <FloatingHowItWorks title={"Lie Detector Achievements - How it works"} steps={[{ title: 'Open', desc: 'Access the Lie Detector Achievements section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Lie Detector Achievements.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
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
