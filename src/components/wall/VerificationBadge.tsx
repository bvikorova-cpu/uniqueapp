import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { useVerification } from "@/hooks/useVerification";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VerificationBadgeProps {
  userId: string;
}

export const VerificationBadge = ({ userId }: VerificationBadgeProps) => {
  const { verification, isVerified } = useVerification(userId);

  if (!isVerified) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="ml-1 px-1">
            <CheckCircle2 className="h-3 w-3 text-primary" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Verified {verification?.verification_type} account</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
