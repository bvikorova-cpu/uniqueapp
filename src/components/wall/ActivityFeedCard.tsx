import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import { formatDistanceToNow } from "date-fns";
import { Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Activity as ActivityItem } from "@/types/entities";

interface ActivityFeedCardProps {
  userId?: string;
}

/** Map an activity to a target route. Returns null if the activity is not navigable. */
function getActivityRoute(activity: ActivityItem): string | null {
  const meta = (activity.metadata ?? {}) as Record<string, unknown>;
  const postId =
    (typeof meta.post_id === "string" && meta.post_id) ||
    (activity.target_type === "post" && activity.target_id) ||
    (activity.target_type === "comment" && typeof meta.post_id === "string" && meta.post_id) ||
    null;
  const profileId =
    (typeof meta.profile_id === "string" && meta.profile_id) ||
    (activity.target_type === "profile" && activity.target_id) ||
    (activity.target_type === "user" && activity.target_id) ||
    null;

  switch (activity.activity_type) {
    case "post_created":
    case "post_liked":
    case "post_commented":
    case "post_shared":
    case "photo_uploaded":
      return postId ? `/post/${postId}` : null;
    case "friend_added":
      return profileId ? `/profile/${profileId}` : null;
    case "profile_updated":
      return profileId ? `/profile/${profileId}` : "/profile";
    default:
      return postId ? `/post/${postId}` : profileId ? `/profile/${profileId}` : null;
  }
}

export const ActivityFeedCard = ({ userId }: ActivityFeedCardProps) => {
  const navigate = useNavigate();
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
      <ScrollArea className="h-64 touch-auto">
        <div className="space-y-2">
          {activities.slice(0, 10).map((activity) => {
            const route = getActivityRoute(activity);
            const clickable = !!route;
            return (
              <button
                key={activity.id}
                type="button"
                onClick={() => route && navigate(route)}
                disabled={!clickable}
                className={`w-full text-left flex gap-3 p-3 rounded-xl transition-colors ${
                  clickable
                    ? "glass-hover cursor-pointer hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    : "opacity-70 cursor-default"
                }`}
                aria-label={clickable ? `View ${getActivityMessage(activity)}` : undefined}
              >
                <span className="text-2xl shrink-0">{getActivityIcon(activity.activity_type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{getActivityMessage(activity)}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        {activities.length === 0 && (
          <div className="text-center text-muted-foreground py-8 text-sm">No recent activity</div>
        )}
      </ScrollArea>
    </div>
  );
};
