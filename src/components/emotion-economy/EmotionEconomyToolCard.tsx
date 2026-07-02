import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface EmotionEconomyToolCardProps {
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

export function EmotionEconomyToolCard({
  icon: Icon,
  title,
  description,
  badge,
  credits,
  gradient,
  iconColor,
  onClick,
  delay = 0,
}: EmotionEconomyToolCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`
        group relative cursor-pointer rounded-xl border border-white/10 
        bg-gradient-to-br ${gradient} backdrop-blur-sm 
        p-5 overflow-hidden transition-all duration-300
        hover:border-white/20 hover:shadow-[0_8px_32px_rgba(139,92,246,0.15)]
      `}
    >
      <FloatingHowItWorks
        title={"Emotion Economy Tool Card"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl bg-background/60 ${iconColor} shadow-lg`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex gap-1.5">
            {badge && (
              <Badge variant="outline" className="text-xs border-white/20 bg-white/5">
                {badge}
              </Badge>
            )}
            {credits !== undefined && (
              <Badge className="text-xs bg-pink-500/20 text-pink-300 border-pink-500/30">
                {credits} cr
              </Badge>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-sm mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
