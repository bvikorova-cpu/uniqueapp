import React from "react";

type Tier = "verified" | "plus" | "pro" | "none";

const TIER_CONFIG: Record<Tier, { label: string; gradient: string; ring: string; icon: string }> = {
  verified: {
    label: "Verified",
    gradient: "from-yellow-400 via-amber-300 to-yellow-600",
    ring: "#f59e0b",
    icon: "✓",
  },
  plus: {
    label: "Plus",
    gradient: "from-pink-400 via-rose-300 to-pink-600",
    ring: "#ec4899",
    icon: "+",
  },
  pro: {
    label: "Pro",
    gradient: "from-purple-400 via-violet-300 to-fuchsia-500",
    ring: "#8b5cf6",
    icon: "★",
  },
  none: {
    label: "",
    gradient: "",
    ring: "",
    icon: "",
  },
};

interface VerifiedBadgeProps {
  tier: Tier | string | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ tier = "none", size = "md", showLabel = true }) => {
  const normalized = ((tier ?? "none") as Tier) in TIER_CONFIG ? ((tier ?? "none") as Tier) : "none";
  if (normalized === "none") return null;

  const cfg = TIER_CONFIG[normalized];
  const sizeClasses = {
    sm: { wrap: "w-4 h-4", icon: "text-[8px]", label: "text-[10px]" },
    md: { wrap: "w-5 h-5", icon: "text-[10px]", label: "text-xs" },
    lg: { wrap: "w-7 h-7", icon: "text-[14px]", label: "text-sm" },
  }[size];

  return (
    <span className="inline-flex items-center gap-1 align-middle">
      <span
        className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br ${cfg.gradient} ${sizeClasses.wrap} shadow-[0_0_12px_${cfg.ring}]`}
        title={`Unique ${cfg.label}`}
      >
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <defs>
            <linearGradient id={`sparkle-${normalized}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.9" />
              <stop offset="100%" stopColor="white" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={`url(#sparkle-${normalized})`}
            strokeWidth="4"
            strokeDasharray="20 80"
            className="origin-center animate-spin"
            style={{ animationDuration: "8s" }}
          />
        </svg>
        <span className={`relative z-10 font-black text-white ${sizeClasses.icon}`}>{cfg.icon}</span>
      </span>
      {showLabel && (
        <span className={`font-bold bg-gradient-to-r ${cfg.gradient} bg-clip-text text-transparent ${sizeClasses.label}`}>
          {cfg.label}
        </span>
      )}
    </span>
  );
};
