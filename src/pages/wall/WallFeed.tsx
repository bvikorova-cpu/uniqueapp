import { useState, useMemo } from "react";
import PostCard from "@/components/feed/PostCard";
import RepostCard from "@/components/feed/RepostCard";
import { PostFilters, SortBy, TimeFilter, CategoryFilter } from "@/components/feed/PostFilters";
import { Loader2 } from "lucide-react";
import { AchievementsBadge } from "@/components/wall/AchievementsBadge";
import { SearchBar } from "@/components/wall/SearchBar";
import RewardedAdCard from "@/components/ads/RewardedAdCard";
import { AD_PLACEMENTS } from "@/components/ads/AdPlacements";
import { NotesBar } from "@/components/wall/NotesBar";
import { MutedKeywordsDialog, useMutedKeywords } from "@/components/wall/MutedKeywordsDialog";
import { MutedUsersDialog } from "@/components/wall/MutedUsersDialog";
import { CloseFriendsDialog } from "@/components/wall/CloseFriendsDialog";
import { FollowedTopicsDialog } from "@/components/wall/FollowedTopicsDialog";
import { SavedSearchesDialog } from "@/components/wall/SavedSearchesDialog";
import { useUserMutes } from "@/hooks/useUserMutes";
import { useTranslation } from "react-i18next";
import type { Post, Repost, FeedItem } from "@/types/database";

interface WallFeedProps {
  posts: Post[];
  reposts: Repost[];
  feedItems: FeedItem[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  pullToRefresh: {
    pulling: boolean;
    pullDistance: number;
    canRefresh: boolean;
  };
  PULL_THRESHOLD: number;
  fetchPosts: (loadMore?: boolean) => Promise<void>;
  filteredFeedItems: FeedItem[];
}

export default function WallFeed({ 
  loading, 
  loadingMore, 
  hasMore, 
  pullToRefresh, 
  PULL_THRESHOLD,
  fetchPosts,
  filteredFeedItems 
}: WallFeedProps) {
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const { t } = useTranslation();
  const mutedKeywords = useMutedKeywords();
  const { mutedIds } = useUserMutes();

  const visibleFeedItems = useMemo(() => {
    return filteredFeedItems.filter((item) => {
      const data: any = item.data;
      const authorId = data.user_id || data.profiles?.id;
      if (authorId && mutedIds.includes(authorId)) return false;
      if (mutedKeywords.length > 0) {
        const text =
          item.type === "post"
            ? data.content ?? ""
            : (data.comment ?? "") + " " + (data.original_post?.content ?? "");
        const lower = text.toLowerCase();
        if (mutedKeywords.some((kw) => lower.includes(kw))) return false;
      }
      return true;
    });
  }, [filteredFeedItems, mutedKeywords, mutedIds]);

  const handleResetFilters = () => {
    setSortBy("newest");
    setTimeFilter("all");
    setCategoryFilter("all");
  };

  return (
    <>
      {/* Pull-to-refresh indicator */}
      {pullToRefresh.pulling && (
        <div 
          className="fixed top-0 left-80 right-80 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-200"
          style={{ 
            height: `${pullToRefresh.pullDistance}px`,
            opacity: pullToRefresh.pullDistance / PULL_THRESHOLD 
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <Loader2 
              className={`h-6 w-6 text-primary transition-transform duration-200 ${
                pullToRefresh.canRefresh ? 'animate-spin' : ''
              }`}
              style={{
                transform: `rotate(${pullToRefresh.pullDistance * 3}deg)`
              }}
            />
            <span className="text-sm text-muted-foreground">
              {pullToRefresh.canRefresh ? t('wall.feed.releaseToRefresh') : t('wall.feed.pullToRefresh')}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Achievements Badge + Mute settings */}
          <div className="flex justify-end items-center gap-2 flex-wrap">
            <CloseFriendsDialog />
            <FollowedTopicsDialog />
            <SavedSearchesDialog />
            <MutedUsersDialog />
            <MutedKeywordsDialog />
            <AchievementsBadge />
          </div>

          {/* Notes / 24h status bar */}
          <NotesBar />

          {/* Search Bar */}
          <SearchBar />

            <PostFilters
              sortBy={sortBy}
              timeFilter={timeFilter}
              categoryFilter={categoryFilter}
              onSortChange={setSortBy}
              onTimeChange={setTimeFilter}
              onCategoryChange={setCategoryFilter}
              onReset={handleResetFilters}
            />

          {/* Feed */}
          <div className="space-y-5">
            {loading ? (
              <div className="glass-post-card p-12 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : visibleFeedItems.length === 0 ? (
              <div className="glass-post-card p-12 text-center text-muted-foreground">
                {t('wall.feed.noPostsFound')}
              </div>
            ) : (
              <>
                {visibleFeedItems.map((item, index) => (
                  <div key={`${item.type}-${item.data.id}`}>
                    <div 
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {item.type === 'post' ? (
                        <PostCard
                          post={item.data}
                          onDelete={fetchPosts}
                        />
                      ) : (
                        <RepostCard
                          repost={item.data}
                          onDelete={fetchPosts}
                        />
                      )}
                    </div>
                    {/* Rewarded ad after every 15th post */}
                    {(index + 1) % 15 === 0 && (
                      <div 
                        className="animate-fade-in mt-5"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <RewardedAdCard 
                          sectionKey={`wall_feed_${Math.floor((index + 1) / 15)}`}
                          adSlot={AD_PLACEMENTS.FOOTER_BANNER}
                        />
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Loading more indicator */}
                {loadingMore && (
                  <div className="glass-post-card p-6 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                    <span className="text-sm text-muted-foreground">{t('wall.feed.loadingMore')}</span>
                  </div>
                )}
                
                {/* End of feed message */}
                {!loading && !loadingMore && !hasMore && visibleFeedItems.length > 0 && (
                  <div className="glass-post-card p-6 text-center text-muted-foreground text-sm">
                    {t('wall.feed.reachedEnd')}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
