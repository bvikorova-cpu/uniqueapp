import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hash, TrendingUp } from "lucide-react";
import { useTrending } from "@/hooks/useTrending";

export const TrendingSidebar = () => {
  const { topics, isLoading } = useTrending();

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
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Trending Now</h3>
      </div>
      <div className="space-y-3">
        {topics.slice(0, 5).map((topic, index) => (
          <div key={topic.id} className="flex items-center gap-3 hover:bg-accent p-2 rounded-lg cursor-pointer transition-colors">
            <span className="text-2xl font-bold text-muted-foreground w-8">
              {index + 1}
            </span>
            <div className="flex-1">
              <Badge variant="secondary" className="gap-1 mb-1">
                <Hash className="h-3 w-3" />
                {topic.topic}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {topic.post_count} posts
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
