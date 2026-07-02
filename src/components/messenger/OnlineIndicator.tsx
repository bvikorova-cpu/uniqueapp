import { cn } from "@/lib/utils";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  lastSeen?: string | null;
}

export const OnlineIndicator = ({
  isOnline,
  size = "sm",
  showLabel = false,
  lastSeen,
}: OnlineIndicatorProps) => {
  const sizeClasses = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const formatLastSeen = (date: string | null) => {
    if (!date) return "Unknown";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return d.toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-1.5">
      <FloatingHowItWorks
        title={"Online Indicator"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <span
        className={cn(
          "rounded-full",
          sizeClasses[size],
          isOnline ? "bg-green-500" : "bg-muted-foreground/50"
        )}
      />
      {showLabel && (
        <span className="text-xs text-muted-foreground">
          {isOnline ? "Online" : `Last seen ${formatLastSeen(lastSeen)}`}
        </span>
      )}
    </div>
  );
};
