import { Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePostThreads } from "@/hooks/usePostThreads";

interface ThreadIndicatorProps {
  postId: string;
}

export const ThreadIndicator = ({ postId }: ThreadIndicatorProps) => {
  const { threadPosts } = usePostThreads(postId);

  if (threadPosts.length === 0) return null;

  return (
    <Badge variant="secondary" className="gap-1">
      <Link2 className="w-3 h-3" />
      Thread ({threadPosts.length + 1})
    </Badge>
  );
};
