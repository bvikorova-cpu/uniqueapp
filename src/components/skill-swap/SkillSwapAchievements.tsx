import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const badges = [
  { icon: "🔄", label: "First Swap", unlocked: true },
  { icon: "⭐", label: "5-Star Rating", unlocked: true },
  { icon: "🌍", label: "Global Swapper", unlocked: false },
  { icon: "🎓", label: "Master Teacher", unlocked: false },
  { icon: "💬", label: "Chatterbox", unlocked: true },
  { icon: "🏆", label: "Top Swapper", unlocked: false },
];

export const SkillSwapAchievements = () => {
  return (
    <>
      <FloatingHowItWorks title={"Skill Swap Achievements - How it works"} steps={[{ title: 'Open', desc: 'Access the Skill Swap Achievements section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Skill Swap Achievements.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h3 className="font-bold text-sm">Achievements</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {badges.filter(b => b.unlocked).length}/{badges.length}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {badges.map((badge) => (
          <motion.div
            key={badge.label}
            whileHover={{ scale: 1.1 }}
            className={`flex flex-col items-center p-2 rounded-lg text-center transition-all ${
              badge.unlocked
                ? "bg-primary/10 border border-primary/20"
                : "bg-muted/20 opacity-40"
            }`}
          >
            <span className="text-lg">{badge.icon}</span>
            <span className="text-[9px] mt-1 text-muted-foreground leading-tight">{badge.label}</span>
          </motion.div>
        ))}
      </div>
    </Card>
    </>
  );
};
