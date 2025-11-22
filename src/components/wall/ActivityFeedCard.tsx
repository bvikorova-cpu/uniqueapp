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
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Recent Activity</h3>
      </div>
      <ScrollArea className="h-64">
        <div className="space-y-3">
          {activities.slice(0, 10).map((activity) => (
            <div
              key={activity.id}
              className="flex gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
            >
              <span className="text-2xl">{getActivityIcon(activity.activity_type)}</span>
              <div className="flex-1">
                <p className="text-sm">{getActivityMessage(activity)}</p>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
        {activities.length === 0 && (
          <div className="text-center text-muted-foreground py-8">No recent activity</div>
        )}
      </ScrollArea>
    </Card>
  );
};
