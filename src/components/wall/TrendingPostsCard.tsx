import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useTrendingPosts } from "@/hooks/useTrending";
import { formatDistanceToNow } from "date-fns";

export const TrendingPostsCard = () => {
  const { trendingPosts, isLoading } = useTrendingPosts();

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-accent rounded w-3/4" />
          <div className="h-4 bg-accent rounded w-1/2" />
        </div>
      </Card>
    );
  }

  if (trendingPosts.length === 0) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Trending Posts</h3>
      </div>
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {trendingPosts.slice(0, 10).map((trending, index) => (
            <div
              key={trending.id}
              className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="font-bold">
                  #{index + 1}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-clamp-2 mb-2">
                    {trending.posts?.content}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>🔥 {trending.trending_score.toFixed(0)}</span>
                    <span>👁️ {trending.views_24h}</span>
                    <span>❤️ {trending.reactions_24h}</span>
                    <span>💬 {trending.comments_24h}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
