import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props {
  messageCount: number;
  matchInterests?: string[];
}

// Heuristic compatibility based on message volume + shared interests
export const CompatibilityMeter = ({ messageCount, matchInterests = [] }: Props) => {
  const interestScore = Math.min(matchInterests.length * 8, 40);
  const messageScore = Math.min(messageCount * 1.5, 60);
  const score = Math.round(Math.min(interestScore + messageScore, 100));

  const color =
    score >= 80 ? "from-pink-500 to-rose-500"
    : score >= 50 ? "from-primary to-pink-500"
    : "from-violet-500 to-primary";

  return (
    <div className="p-3 rounded-2xl bg-card/60 backdrop-blur-md border border-border/40">
      <FloatingHowItWorks
        title={"Compatibility Meter"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Heart className="h-3.5 w-3.5 text-pink-500" />
          <span className="text-xs font-bold uppercase tracking-wide">Vibe meter</span>
        </div>
        <span className={`text-sm font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{score}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full bg-gradient-to-r ${color}`}
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-1.5">
        Grows with every message and shared interest 💫
      </p>
    </div>
  );
};
