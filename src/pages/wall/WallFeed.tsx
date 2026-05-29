import { useState, useMemo } from "react";
import PostCard from "@/components/feed/PostCard";
import RepostCard from "@/components/feed/RepostCard";
import { PostFilters, SortBy, TimeFilter, CategoryFilter } from "@/components/feed/PostFilters";
import { Loader2 } from "lucide-react";
import { AchievementsBadge } from "@/components/wall/AchievementsBadge";
import { SearchBar } from "@/components/wall/SearchBar";
import MonetagInFeedAd from "@/components/ads/MonetagInFeedAd";
import { NotesBar } from "@/components/wall/NotesBar";
import { MutedKeywordsDialog, useMutedKeywords } from "@/components/wall/MutedKeywordsDialog";
import { MutedUsersDialog } from "@/components/wall/MutedUsersDialog";
import { CloseFriendsDialog } from "@/components/wall/CloseFriendsDialog";
import { FollowedTopicsDialog } from "@/components/wall/FollowedTopicsDialog";
import { SavedSearchesDialog } from "@/components/wall/SavedSearchesDialog";
import { GroupChatDialog } from "@/components/wall/GroupChatDialog";
import { ProfileCustomizationDialog } from "@/components/profile/ProfileCustomizationDialog";
import { SmartFeedTabs, type FeedTab } from "@/components/wall/SmartFeedTabs";
import { SpacesDialog } from "@/components/wall/SpacesDialog";
import { useForYouRanking } from "@/hooks/useForYouRanking";
import { useUserMutes } from "@/hooks/useUserMutes";

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
  const [activeTab, setActiveTab] = useState<FeedTab>("latest");
  const mutedKeywords = useMutedKeywords();
  const { mutedIds } = useUserMutes();
  const { data: forYouIds = [] } = useForYouRanking(activeTab === "for-you");

  const visibleFeedItems = useMemo(() => {
    const filtered = filteredFeedItems.filter((item) => {
      const data: any = item.data;
      const authorId = data.user_id || data.profiles?.id;
      if (authorId && mutedIds.includes(authorId)) return false;
      if (mutedKeywords.length > 0) {
        const text =
          item.type === "post"
            ? data.content ?? ""
            : (data.comment ?? "") + " " + (data.original_post?.content ?? "");
        const lower = text.toLowerCase();
        if (mutedKeywords.some((kw) => kw && lower.includes(kw))) return false;
      }
      return true;
    });

    if (activeTab === "for-you" && forYouIds.length > 0) {
      const order = new Map(forYouIds.map((id, i) => [id, i]));
      return [...filtered].sort((a, b) => {
        const ai = order.has(a.data.id) ? order.get(a.data.id)! : 9999;
        const bi = order.has(b.data.id) ? order.get(b.data.id)! : 9999;
        return ai - bi;
      });
    }
    if (activeTab === "trending") {
      return [...filtered].sort((a: any, b: any) => {
        const sa = (a.data.likes_count ?? 0) + (a.data.comments_count ?? 0) * 2;
        const sb = (b.data.likes_count ?? 0) + (b.data.comments_count ?? 0) * 2;
        return sb - sa;
      });
    }
    return filtered;
  }, [filteredFeedItems, mutedKeywords, mutedIds, activeTab, forYouIds]);

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
          className="fixed top-0 left-0 right-0 lg:left-80 lg:right-80 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-200"
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
              {pullToRefresh.canRefresh ? "Release to refresh" : "Pull to refresh"}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Achievements Badge + Mute settings */}
          <div className="flex justify-end items-center gap-2 flex-wrap">
            <ProfileCustomizationDialog />
            <SpacesDialog />
            <GroupChatDialog />
            <CloseFriendsDialog />
            <FollowedTopicsDialog />
            <SavedSearchesDialog />
            <MutedUsersDialog />
            <MutedKeywordsDialog />
            <AchievementsBadge />
          </div>

          {/* Notes / 24h status bar */}
          <NotesBar />

          {/* Smart feed tabs */}
          <SmartFeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

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
                {"No posts found. Try adjusting your filters."}
              </div>
            ) : (
              <>
                {visibleFeedItems.map((item, index) => (
                  <div key={`${item.type}-${item.data.id}`}>
                    <div 
                      className="animate-fade-in"
                      style={{ animationDelay: `${Math.min(index, 10) * 0.05}s` }}
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
                    {/* Monetag In-Page Push sponsored card after every 20th post */}
                    {(index + 1) % 20 === 0 && (
                      <div
                        className="animate-fade-in mt-5"
                        style={{ animationDelay: `${Math.min(index, 10) * 0.05}s` }}
                      >
                        <MonetagInFeedAd slotIndex={Math.floor((index + 1) / 20)} />
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Loading more indicator */}
                {loadingMore && (
                  <div className="glass-post-card p-6 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                    <span className="text-sm text-muted-foreground">{"Loading more posts..."}</span>
                  </div>
                )}
                
                {/* End of feed message */}
                {!loading && !loadingMore && !hasMore && visibleFeedItems.length > 0 && (
                  <div className="glass-post-card p-6 text-center text-muted-foreground text-sm">
                    {"You've reached the end! 🎉"}
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
