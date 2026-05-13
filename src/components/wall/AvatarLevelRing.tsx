import { ReactNode } from "react";
import { useUserLevel } from "@/hooks/useUserLevel";
import { cn } from "@/lib/utils";

interface Props {
  userId?: string;
  size?: number;
  thickness?: number;
  showBadge?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Wraps an avatar with a circular XP progress ring and a small level badge.
 */
export function AvatarLevelRing({
  userId,
  size = 56,
  thickness = 3,
  showBadge = true,
  className,
  children,
}: Props) {
  const { data } = useUserLevel(userId);
  const pct = data?.progressPct ?? 0;
  const level = data?.level ?? 1;

  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--muted) / 0.3)"
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#levelGrad)"
          strokeWidth={thickness}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-700"
        />
        <defs>
          <linearGradient id="levelGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
      </svg>
      <div
        className="rounded-full overflow-hidden"
        style={{ width: size - thickness * 2 - 2, height: size - thickness * 2 - 2 }}
      >
        {children}
      </div>
      {showBadge && (
        <span
          className="absolute -bottom-1 -right-1 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground text-[10px] font-bold leading-none px-1.5 py-0.5 shadow-md ring-2 ring-background"
        >
          {level}
        </span>
      )}
    </div>
  );
}
