import { Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  label?: string;
}

/**
 * UI hint that direct messages are transmitted over TLS and stored under RLS.
 * Not end-to-end encryption — copy is intentionally accurate.
 */
export const EncryptionBadge = ({ className, label = "Secured" }: Props) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary",
            className,
          )}
        >
          <Lock className="h-3 w-3" />
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[240px] text-xs">
        Messages travel over TLS and are stored with row-level security so only you and the recipient can read them.
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
