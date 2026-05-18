import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  memberNumber: number;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Permanent recognition badge for the first 100 platform members.
 * Public — anyone can see who is a Founding Member.
 */
export function FoundingMemberBadge({ memberNumber, size = "md", className = "" }: Props) {
  const sizeClass = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            className={`${sizeClass} gap-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black border-amber-300/60 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 font-bold ${className}`}
          >
            <Crown className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
            Founder #{memberNumber}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">One of the first 100 members of Unique. Permanent recognition.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
