import { CheckCircle } from "lucide-react";
import { useVerified } from "@/hooks/useVerified";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VerifiedBadgeProps {
  userId: string;
  className?: string;
}

export const VerifiedBadge = ({ userId, className = "" }: VerifiedBadgeProps) => {
  const { isVerified } = useVerified(userId);

  if (!isVerified) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <CheckCircle className={`h-4 w-4 text-primary fill-primary ${className}`} />
        </TooltipTrigger>
        <TooltipContent>
          <p>Verified Account</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
