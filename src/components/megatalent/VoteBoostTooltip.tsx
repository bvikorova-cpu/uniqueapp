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
  bonusVotes?: number;
  className?: string;
}

export const VoteBoostTooltip = ({
  isTopPremium,
  bonusVotes = 100000,
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
            aria-label="Vote boost information"
          >
            <Info className="h-3 w-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          className="max-w-[250px] bg-gradient-to-r from-gold/90 to-yellow-500/90 text-black border-gold"
          sideOffset={5}
        >
          <p className="text-sm font-medium">
            🏆 Your entry is boosted by +{bonusVotes.toLocaleString()} votes due to your TOP Premium status!
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VoteBoostTooltip;
