import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, CheckCircle2, Star, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export type VerificationTier = "verified" | "creator" | "vip" | "founder";

interface UserVerificationBadgeProps {
  tier: VerificationTier;
  className?: string;
  size?: "xs" | "sm" | "md";
  showLabel?: boolean;
}

const tierConfig: Record<VerificationTier, {
  label: string;
  description: string;
  icon: typeof CheckCircle2;
  gradient: string;
  glow: string;
  textColor: string;
}> = {
  verified: {
    label: "Verified",
    description: "This account has been verified as authentic",
    icon: CheckCircle2,
    gradient: "from-blue-500 to-cyan-500",
    glow: "shadow-[0_0_10px_rgba(59,130,246,0.4)]",
    textColor: "text-blue-500",
  },
  creator: {
    label: "Creator",
    description: "Recognized content creator with quality contributions",
    icon: Star,
    gradient: "from-purple-500 to-pink-500",
    glow: "shadow-[0_0_10px_rgba(168,85,247,0.4)]",
    textColor: "text-purple-500",
  },
  vip: {
    label: "VIP",
    description: "Premium VIP member with exclusive access",
    icon: Zap,
    gradient: "from-amber-400 to-orange-500",
    glow: "shadow-[0_0_10px_rgba(245,158,11,0.4)]",
    textColor: "text-amber-500",
  },
  founder: {
    label: "Founder",
    description: "Platform Founder & CEO",
    icon: Crown,
    gradient: "from-amber-500 via-yellow-500 to-amber-600",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.5)]",
    textColor: "text-amber-500",
  },
};

export const UserVerificationBadge = ({ tier, className, size = "sm", showLabel = false }: UserVerificationBadgeProps) => {
  const config = tierConfig[tier];
  const Icon = config.icon;

  const sizeClasses = {
    xs: "w-3.5 h-3.5",
    sm: "w-4 h-4",
    md: "w-5 h-5",
  };

  const badgeSizes = {
    xs: "text-[9px] px-1 py-0 h-3.5 gap-0.5",
    sm: "text-[10px] px-1.5 py-0 h-4 gap-0.5",
    md: "text-xs px-2 py-0.5 h-5 gap-1",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {showLabel ? (
            <Badge
              className={cn(
                "border-0 cursor-pointer font-semibold",
                `bg-gradient-to-r ${config.gradient} text-white`,
                config.glow,
                badgeSizes[size],
                className
              )}
            >
              <Icon className={sizeClasses[size]} />
              {config.label}
            </Badge>
          ) : (
            <span className={cn("inline-flex cursor-pointer", className)}>
              <Icon className={cn(sizeClasses[size], config.textColor, "drop-shadow-sm")} />
            </span>
          )}
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="flex items-center gap-1.5">
            <Icon className={cn("w-3.5 h-3.5", config.textColor)} />
            <span className="font-semibold">{config.label}</span>
          </div>
          <p className="text-muted-foreground mt-0.5">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
