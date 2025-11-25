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
    <div className="glass-card p-5 rounded-2xl">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-primary/10 rounded-xl">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-bold text-lg">Trending Now</h3>
      </div>
      <div className="space-y-3">
        {topics.slice(0, 5).map((topic, index) => (
          <div key={topic.id} className="flex items-center gap-4 glass-hover p-3 rounded-xl cursor-pointer group">
            <span className={`text-2xl font-bold w-8 ${
              index === 0 ? "text-primary" : 
              index === 1 ? "text-primary/80" : 
              index === 2 ? "text-primary/60" : 
              "text-muted-foreground"
            }`}>
              {index + 1}
            </span>
            <div className="flex-1">
              <Badge variant="secondary" className="gap-1.5 mb-1.5 glass-button group-hover:bg-primary/20">
                <Hash className="h-3 w-3" />
                <span className="font-medium">{topic.topic}</span>
              </Badge>
              <p className="text-xs text-muted-foreground font-medium">
                {topic.post_count} posts · {Math.round(topic.engagement_score)} engagement
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
