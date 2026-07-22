import { useUserActivity } from "@/hooks/useUserActivity";
import { cn } from "@/lib/utils";

interface UserActivityIndicatorProps {
  userId: string;
  className?: string;
  showStatus?: boolean;
}

export const UserActivityIndicator = ({ userId,
  className = "",
  showStatus = false }: UserActivityIndicatorProps) => {
  const { activity, isOnline } = useUserActivity(userId);

  if (!activity) return null;

  const statusColors = { online: "bg-green-500",
    away: "bg-yellow-500",
    busy: "bg-red-500",
    offline: "bg-muted" };

  const statusColor = statusColors[activity.status as keyof typeof statusColors] || "bg-muted";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div className={cn("w-2.5 h-2.5 rounded-full", statusColor)} />
        {isOnline && (
          <div className={cn("absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping", statusColor)} />
        )}
      </div>
      {showStatus && (
        <span className="text-xs text-muted-foreground capitalize">
          {activity.custom_status || activity.status}
        </span>
      )}
    </div>
  );
};
