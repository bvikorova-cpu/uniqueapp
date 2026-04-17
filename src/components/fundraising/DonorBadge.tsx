import { motion } from "framer-motion";
import { Crown, Gem, Award, Medal } from "lucide-react";

export type DonorTier = "bronze" | "silver" | "gold" | "platinum";

interface Props {
  tier: DonorTier;
  totalDonated?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const tierConfig: Record<DonorTier, {
  label: string;
  Icon: typeof Crown;
  gradient: string;
  glow: string;
  text: string;
}> = {
  bronze: {
    label: "Bronze Donor",
    Icon: Medal,
    gradient: "from-orange-400 to-amber-700",
    glow: "rgba(180,83,9,0.5)",
    text: "text-orange-50",
  },
  silver: {
    label: "Silver Donor",
    Icon: Award,
    gradient: "from-slate-300 to-slate-500",
    glow: "rgba(148,163,184,0.5)",
    text: "text-slate-50",
  },
  gold: {
    label: "Gold Donor",
    Icon: Crown,
    gradient: "from-amber-300 via-yellow-400 to-amber-500",
    glow: "rgba(251,191,36,0.6)",
    text: "text-amber-950",
  },
  platinum: {
    label: "Platinum Donor",
    Icon: Gem,
    gradient: "from-cyan-200 via-fuchsia-300 to-purple-300",
    glow: "rgba(168,85,247,0.6)",
    text: "text-purple-950",
  },
};

const sizeMap = {
  sm: { box: "h-6 px-2 text-[10px] gap-1", icon: "w-3 h-3" },
  md: { box: "h-8 px-3 text-xs gap-1.5", icon: "w-3.5 h-3.5" },
  lg: { box: "h-10 px-4 text-sm gap-2", icon: "w-4 h-4" },
};

export function DonorBadge({ tier, totalDonated, size = "md", showLabel = true }: Props) {
  const cfg = tierConfig[tier];
  const sz = sizeMap[size];
  const { Icon } = cfg;

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center font-bold rounded-full bg-gradient-to-r ${cfg.gradient} ${cfg.text} border border-white/20 ${sz.box}`}
      style={{ boxShadow: `0 0 12px ${cfg.glow}` }}
    >
      <Icon className={sz.icon} fill="currentColor" />
      {showLabel && <span>{cfg.label}</span>}
      {totalDonated !== undefined && totalDonated > 0 && (
        <span className="opacity-80">€{totalDonated.toLocaleString()}</span>
      )}
    </motion.span>
  );
}

export function getTierFromAmount(total: number): DonorTier {
  if (total >= 1000) return "platinum";
  if (total >= 500) return "gold";
  if (total >= 100) return "silver";
  return "bronze";
}
