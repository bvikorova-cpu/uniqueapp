import { Hash } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useHashtags } from "@/hooks/useHashtags";

export const TrendingHashtags = () => {
  const { trending } = useHashtags();

  if (trending.length === 0) return null;

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Hash className="h-5 w-5" />
        Trending Hashtags
      </h3>
      <div className="space-y-2">
        {trending.map((hashtag) => (
          <button
            key={hashtag.id}
            className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-lg text-left transition-colors"
            onClick={() => {
              // Navigate to hashtag search
              window.location.href = `/wall?hashtag=${hashtag.tag.replace("#", "")}`;
            }}
          >
            <span className="font-medium text-primary">{hashtag.tag}</span>
            <span className="text-xs text-muted-foreground">
              {hashtag.use_count} posts
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
};
