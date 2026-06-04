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
          className="max-w-[260px] bg-gradient-to-r from-gold/90 to-yellow-500/90 text-black border-gold"
          sideOffset={5}
        >
          <p className="text-sm font-medium">
            🏆 TOP Premium: 50% algorithmic ranking boost and priority display. Vote count shown is the real number.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VoteBoostTooltip;
