import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const badges = [
  { icon: "🔮", label: "First Vision", unlocked: true },
  { icon: "📜", label: "Time Scholar", unlocked: true },
  { icon: "👑", label: "Royal Past", unlocked: false },
  { icon: "💫", label: "Soul Seeker", unlocked: true },
  { icon: "🌍", label: "World Explorer", unlocked: false },
  { icon: "💕", label: "Twin Flame", unlocked: false },
];

export const PastLifeAchievements = () => {
  return (
    <>
      <FloatingHowItWorks
        title='Past Life Achievements'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Past Life Achievements panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h3 className="font-bold text-sm">Achievements</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {badges.filter(b => b.unlocked).length}/{badges.length}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {badges.map((badge, i) => (
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
