import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VerifiedBadgeProps {
  level?: "basic" | "creator" | "official";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const COLORS = {
  basic: "text-sky-400",
  creator: "text-primary",
  official: "text-amber-400",
};

const SIZES = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" };

const LABELS = {
  basic: "Verified account",
  creator: "Verified creator",
  official: "Official partner",
};

/** Inline verified checkmark for usernames/handles. */
export const VerifiedBadge = ({ level = "basic", size = "sm", className }: VerifiedBadgeProps) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("inline-flex shrink-0 align-middle", className)} aria-label={LABELS[level]}>
            <BadgeCheck className={cn(SIZES[size], COLORS[level], "fill-current/10")} />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">{LABELS[level]}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerifiedBadge;
