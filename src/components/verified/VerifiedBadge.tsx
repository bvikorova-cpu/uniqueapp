import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type VerifiedTier = "verified" | "plus" | "pro" | "none";

export interface TierMeta {
  label: string;
  gradient: string;
  ring: string; // border color hex
  ringClass: string; // Tailwind ring utilities for cards/avatars
  glowClass: string; // Tailwind shadow utilities
  icon: string;
  tooltip: string;
}

export const TIER_META: Record<VerifiedTier, TierMeta> = { verified: {
    label: "Verified",
    gradient: "from-yellow-400 via-amber-300 to-yellow-600",
    ring: "#f59e0b",
    ringClass: "ring-2 ring-amber-400/70",
    glowClass: "shadow-lg shadow-amber-500/25",
    icon: "✓",
    tooltip: "Unique Verified — identity confirmed (€15)" },
  plus: { label: "Plus",
    gradient: "from-pink-400 via-rose-300 to-pink-600",
    ring: "#ec4899",
    ringClass: "ring-2 ring-pink-400/70",
    glowClass: "shadow-lg shadow-pink-500/25",
    icon: "+",
    tooltip: "Unique Plus — verified + 100 AI credits / month (€40)" },
  pro: { label: "Pro",
    gradient: "from-purple-400 via-violet-300 to-fuchsia-500",
    ring: "ring-2 ring-purple-400/70",
    ringClass: "ring-2 ring-purple-400/70",
    glowClass: "shadow-lg shadow-purple-500/30",
    icon: "★",
    tooltip: "Unique Pro — top tier, 150 AI credits + priority reach (€150)" },
  none: { label: "",
    gradient: "",
    ring: "",
    ringClass: "",
    glowClass: "",
    icon: "",
    tooltip: "" } };

export function normalizeTier(tier: string | null | undefined): VerifiedTier {
  const t = (tier ?? "none") as VerifiedTier;
  return t in TIER_META ? t : "none";
}

/** Tailwind ring + glow classes for a card / avatar based on tier. */
export function getVerifiedRingClass(tier: string | null | undefined): string {
  const t = normalizeTier(tier);
  if (t === "none") return "";
  const meta = TIER_META[t];
  return `${meta.ringClass} ${meta.glowClass}`;
}

interface VerifiedBadgeProps {
  tier: VerifiedTier | string | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  /** Wrap with tooltip. Defaults to true. */
  withTooltip?: boolean;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ tier = "none",
  size = "md",
  showLabel = true,
  withTooltip = true }) => {
  const normalized = normalizeTier(tier);
  if (normalized === "none") return null;

  const cfg = TIER_META[normalized];
  const sizeClasses = {
    sm: { wrap: "w-4 h-4", icon: "text-[8px]", label: "text-[10px]" },
    md: { wrap: "w-5 h-5", icon: "text-[10px]", label: "text-xs" },
    lg: { wrap: "w-7 h-7", icon: "text-[14px]", label: "text-sm" } }[size];

  const badge = (
    <span className="inline-flex items-center gap-1 align-middle" aria-label={cfg.tooltip}>
      <span
        className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br ${cfg.gradient} ${sizeClasses.wrap} ${cfg.glowClass}`}
      >
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" aria-hidden="true">
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

  if (!withTooltip) return badge;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help">{badge}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          {cfg.tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
