import { Virtuoso } from "react-virtuoso";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import WallPost, { type FeedItem } from "./WallPost";

interface WallFeedProps {
  items: FeedItem[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  feedError: string | null;
  onRetry: () => void;
  onLoadMore: () => void;
  onDelete: () => void;
}

/**
 * Virtualized feed list with loading, error, empty and end states.
 * Pure presentational — all data fetching happens in the parent.
 */
const WallFeed = ({
  items,
  loading,
  loadingMore,
  hasMore,
  feedError,
  onRetry,
  onLoadMore,
  onDelete,
}: WallFeedProps) => {
  if (loading) {
    return (
      <Card className="p-6 sm:p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
      </Card>
    );
  }

  if (feedError) {
    return (
      <Card className="p-6 sm:p-8 text-center space-y-3">
        <p className="text-sm sm:text-base text-destructive font-medium">
          Couldn't load posts
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground">{feedError}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-6 sm:p-8 text-center text-sm sm:text-base text-muted-foreground">
        No posts found. Try adjusting your filters.
      </Card>
    );
  }

  return (
    <Virtuoso
      useWindowScroll
      data={items}
      computeItemKey={(_, item) => `${item.type}-${item.data.id}`}
      endReached={() => {
        if (hasMore && !loadingMore) onLoadMore();
      }}
      overscan={800}
      increaseViewportBy={{ top: 400, bottom: 800 }}
      itemContent={(index, item) => (
        <WallPost item={item} index={index} onDelete={onDelete} />
      )}
      components={{
        Footer: () => (
          <>
            {loadingMore && (
              <Card className="p-3 sm:p-4 flex items-center justify-center">
                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary mr-2" />
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Loading more posts...
                </span>
              </Card>
            )}
            {!loadingMore && !hasMore && items.length > 0 && (
              <Card className="p-3 sm:p-4 text-center text-muted-foreground text-xs sm:text-sm">
                You've reached the end! 🎉
              </Card>
            )}
          </>
        ),
      }}
    />
  );
};

export default WallFeed;
