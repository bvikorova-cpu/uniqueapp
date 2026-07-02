import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface QuantumSocialToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  credits?: number;
  gradient: string;
  iconColor: string;
  onClick: () => void;
  delay?: number;
}

export function QuantumSocialToolCard({
  icon: Icon,
  title,
  description,
  badge,
  credits,
  gradient,
  iconColor,
  onClick,
  delay = 0,
}: QuantumSocialToolCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.03, y: -2 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl border border-cyan-500/20 bg-gradient-to-br ${gradient} p-4 hover:border-cyan-400/40 transition-all group relative overflow-hidden`}
    >
      <FloatingHowItWorks
        title={"Quantum Social Tool Card"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      {/* Neon glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-violet-500/0 group-hover:from-cyan-500/5 group-hover:to-violet-500/5 transition-all duration-300" />

      <div className="relative z-10">
        <div className={`p-2 rounded-lg bg-background/30 w-fit mb-2 ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-semibold text-sm mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        <div className="flex gap-1.5 mt-2">
          {badge && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-medium border border-cyan-500/30">
              {badge}
            </span>
          )}
          {credits !== undefined && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 font-medium border border-violet-500/30">
              {credits} credits
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
