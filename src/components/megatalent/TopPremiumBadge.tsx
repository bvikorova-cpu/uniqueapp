import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopPremiumBadgeProps {
  variant?: "default" | "small" | "inline";
  className?: string;
  showIcon?: boolean;
}

export const TopPremiumBadge = ({
  variant = "default",
  className,
  showIcon = true,
}: TopPremiumBadgeProps) => {
  if (variant === "inline") {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold text-gold",
        className
      )}>
        {showIcon && <Crown className="h-3 w-3" />}
        TOP
      </span>
    );
  }

  if (variant === "small") {
    return (
      <Badge
        className={cn(
          "bg-gradient-to-r from-gold via-yellow-400 to-gold text-gold-foreground",
          "px-1.5 py-0.5 text-[10px] font-bold shadow-sm",
          "animate-pulse",
          className
        )}
      >
        {showIcon && <Crown className="h-2.5 w-2.5 mr-0.5" />}
        TOP
      </Badge>
    );
  }

  return (
    <Badge
      className={cn(
        "bg-gradient-to-r from-gold via-yellow-400 to-gold text-gold-foreground",
        "px-2.5 py-1 text-xs font-bold shadow-md",
        "border border-gold/50",
        "hover:scale-105 transition-transform",
        className
      )}
    >
      {showIcon && <Crown className="h-3 w-3 mr-1" />}
      TOP Premium
      <Sparkles className="h-3 w-3 ml-1 animate-pulse" />
    </Badge>
  );
};

export default TopPremiumBadge;
