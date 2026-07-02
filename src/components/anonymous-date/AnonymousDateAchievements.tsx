import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const badges = [
  { icon: "💌", label: "First Match", unlocked: true },
  { icon: "💬", label: "Chatterbox", unlocked: true },
  { icon: "👀", label: "First Reveal", unlocked: false },
  { icon: "🎁", label: "Gift Giver", unlocked: false },
  { icon: "🎤", label: "Voice Star", unlocked: true },
  { icon: "💕", label: "Love Found", unlocked: false },
];

export const AnonymousDateAchievements = () => {
  return (
    <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
      <FloatingHowItWorks
        title={"Anonymous Date Achievements"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

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
                ? "bg-pink-500/10 border border-pink-500/20"
                : "bg-muted/20 opacity-40"
            }`}
          >
            <span className="text-lg">{badge.icon}</span>
            <span className="text-[9px] mt-1 text-muted-foreground leading-tight">{badge.label}</span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};
