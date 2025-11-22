import { Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLivePosts } from "@/hooks/useLivePosts";

interface LiveIndicatorProps {
  postId: string;
}

export const LiveIndicator = ({ postId }: LiveIndicatorProps) => {
  const { livePosts } = useLivePosts();
  const livePost = livePosts.find((lp) => lp.post_id === postId);

  if (!livePost || !livePost.is_active) return null;

  return (
    <Badge variant="destructive" className="gap-1 animate-pulse">
      <Radio className="w-3 h-3" />
      LIVE
      {livePost.viewers_count > 0 && (
        <span className="ml-1">• {livePost.viewers_count} watching</span>
      )}
    </Badge>
  );
};
