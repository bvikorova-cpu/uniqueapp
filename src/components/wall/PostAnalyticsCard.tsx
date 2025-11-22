import { usePostAnalytics } from "@/hooks/usePostAnalytics";
import { Card } from "@/components/ui/card";
import { Eye, Users, TrendingUp, Clock } from "lucide-react";

interface PostAnalyticsCardProps {
  postId: string;
}

export const PostAnalyticsCard = ({ postId }: PostAnalyticsCardProps) => {
  const { analytics, isLoading } = usePostAnalytics(postId);

  if (isLoading || !analytics) {
    return null;
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        Post Analytics
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span className="text-sm">Views</span>
          </div>
          <p className="text-2xl font-bold">{analytics.views_count}</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-sm">Unique</span>
          </div>
          <p className="text-2xl font-bold">{analytics.unique_viewers}</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Engagement</span>
          </div>
          <p className="text-2xl font-bold">{analytics.engagement_rate.toFixed(1)}%</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Avg Time</span>
          </div>
          <p className="text-2xl font-bold">{analytics.avg_time_spent}s</p>
        </div>
      </div>
    </Card>
  );
};
