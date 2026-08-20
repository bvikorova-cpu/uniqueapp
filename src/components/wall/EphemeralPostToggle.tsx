import { motion } from "framer-motion";
import { Ghost, Users, Eye } from "lucide-react";

export type PostVisibility = "normal" | "ephemeral" | "close-friends";

interface EphemeralPostToggleProps {
  visibility: PostVisibility;
  onVisibilityChange: (v: PostVisibility) => void;
}

const options = [
  {
    value: "normal" as PostVisibility,
    label: "Normal",
    meaning: "Regular post",
    description: "Stays on your profile and feed like any other post.",
    icon: Eye,
    gradient: "from-primary/30 to-primary/10",
    ring: "ring-primary/30",
  },
  {
    value: "ephemeral" as PostVisibility,
    label: "24h Only",
    meaning: "Temporary post",
    description: "Visible for 24 hours, then disappears automatically.",
    icon: Ghost,
    gradient: "from-orange-500/30 to-amber-500/10",
    ring: "ring-orange-500/30",
  },
  {
    value: "close-friends" as PostVisibility,
    label: "Close Friends",
    meaning: "Restricted post",
    description: "Only people you add to Close Friends can see it.",
    icon: Users,
    gradient: "from-emerald-500/30 to-teal-500/10",
    ring: "ring-emerald-500/30",
  },
];

export const EphemeralPostToggle = ({ visibility, onVisibilityChange }: EphemeralPostToggleProps) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {options.map((option) => {
          const OptIcon = option.icon;
          const isActive = visibility === option.value;
          return (
            <motion.button
              key={option.value}
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onVisibilityChange(option.value)}
              className={`relative flex flex-col items-start gap-1 p-2.5 rounded-xl text-left transition-all border ${
                isActive
                  ? `bg-gradient-to-br ${option.gradient} border-transparent ring-1 ${option.ring}`
                  : "bg-accent/20 hover:bg-accent/40 border-white/5"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <OptIcon className={`w-3.5 h-3.5 ${isActive ? "text-foreground" : "text-muted-foreground"}`} />
                <span className="text-xs font-semibold">{option.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="ephemeralActiveDot"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </div>
              <span className="text-[10px] font-medium text-muted-foreground leading-tight">
                {option.meaning}
              </span>
              <span className="text-[10px] text-muted-foreground/80 leading-tight">
                {option.description}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
