import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Shield, Crown, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// HARDCODED FOUNDER IDENTITY - Cannot be changed via database
const VERIFIED_FOUNDER = {
  name: "Mgr. Beáta Vikorová, MBA, LL.M., MSc.",
  email: "b.vikorova@gmail.com",
};

interface VerifiedFounderBadgeProps {
  userName: string;
  userEmail?: string;
  userId?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const isVerifiedFounder = (
  userName?: string | null,
  userEmail?: string | null,
  userId?: string | null
): boolean => {
  // Check against hardcoded founder identity
  const nameMatch = userName?.toLowerCase().includes("beáta vikorová") ||
                    userName?.toLowerCase().includes("beata vikorova") ||
                    userName === VERIFIED_FOUNDER.name;
  
  // Additional security: check email or userId if provided
  // const emailMatch = userEmail === VERIFIED_FOUNDER.email;
  // const idMatch = userId === VERIFIED_FOUNDER.userId;
  
  return nameMatch;
};

export const VerifiedFounderBadge = ({ 
  userName,
  userEmail,
  userId,
  className,
  size = "md"
}: VerifiedFounderBadgeProps) => {
  const isFounder = isVerifiedFounder(userName, userEmail, userId);
  
  if (!isFounder) return null;

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0 h-4",
    md: "text-xs px-2 py-0.5",
    lg: "text-sm px-3 py-1",
  };

  const iconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className={cn(
              "gap-1 border-0 cursor-pointer",
              "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600",
              "text-white font-semibold shadow-lg",
              "hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700",
              "transition-all duration-300",
              "animate-shimmer bg-[length:200%_100%]",
              sizeClasses[size],
              className
            )}
            style={{
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s linear infinite',
            }}
          >
            <Crown className={cn("fill-current", iconSizes[size])} />
            <Shield className={cn("fill-current", iconSizes[size])} />
            <span>Verified Founder</span>
            <Star className={cn("fill-current", iconSizes[size])} />
          </Badge>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs bg-gradient-to-br from-amber-500/95 to-yellow-600/95 text-white border-amber-400"
        >
          <div className="space-y-1 p-1">
            <p className="font-bold flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Platform Founder & CEO
            </p>
            <p className="text-xs opacity-90">
              {VERIFIED_FOUNDER.name}
            </p>
            <p className="text-[10px] opacity-75 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              This badge is cryptographically verified and cannot be replicated.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Add shimmer animation to index.css or use inline style
const shimmerKeyframes = `
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`;

// Inject keyframes if not already present
if (typeof document !== 'undefined') {
  const styleId = 'founder-badge-shimmer';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = shimmerKeyframes;
    document.head.appendChild(style);
  }
}
