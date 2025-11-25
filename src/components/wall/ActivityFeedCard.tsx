import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import { formatDistanceToNow } from "date-fns";
import { Activity } from "lucide-react";

interface ActivityFeedCardProps {
  userId?: string;
}

export const ActivityFeedCard = ({ userId }: ActivityFeedCardProps) => {
  const { activities, isLoading, getActivityIcon, getActivityMessage } =
    useActivityFeed(userId);

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-accent rounded w-3/4" />
          <div className="h-4 bg-accent rounded w-1/2" />
          <div className="h-4 bg-accent rounded w-2/3" />
        </div>
      </Card>
    );
  }

  return (
    <div className="glass-card p-5 rounded-2xl">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Activity className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-bold text-lg">Recent Activity</h3>
      </div>
      <ScrollArea className="h-64">
        <div className="space-y-2">
          {activities.slice(0, 10).map((activity) => (
            <div
              key={activity.id}
              className="flex gap-3 p-3 rounded-xl glass-hover cursor-pointer group"
            >
              <span className="text-2xl">{getActivityIcon(activity.activity_type)}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{getActivityMessage(activity)}</p>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
        {activities.length === 0 && (
          <div className="text-center text-muted-foreground py-8 text-sm">No recent activity</div>
        )}
      </ScrollArea>
    </div>
  );
};
