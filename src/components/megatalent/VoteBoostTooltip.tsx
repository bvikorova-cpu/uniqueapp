import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface VoteBoostTooltipProps {
  isTopPremium: boolean;
  className?: string;
}

export const VoteBoostTooltip = ({
  isTopPremium,
  className,
}: VoteBoostTooltipProps) => {
  if (!isTopPremium) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              "inline-flex items-center justify-center w-4 h-4 rounded-full",
              "bg-gold/20 text-gold hover:bg-gold/30 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-gold/50",
              className
            )}
            aria-label="TOP Premium ranking boost"
          >
            <Info className="h-3 w-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          className="max-w-[300px] bg-gradient-to-r from-gold/95 to-yellow-500/95 text-black border-gold"
          sideOffset={5}
        >
          <div className="space-y-1.5 text-sm">
            <p className="font-bold">🏆 TOP Premium ranking boost</p>
            <p className="font-medium">
              Ranking score = real votes × 2 (+100%).
            </p>
            <p className="text-xs opacity-90">
              The vote number you see is always the real count. The ×2 multiplier only changes the order in the leaderboard, not the displayed votes or the final prize calculation.
            </p>
          </div>
        </TooltipContent>

      </Tooltip>
    </TooltipProvider>
  );
};

export default VoteBoostTooltip;
