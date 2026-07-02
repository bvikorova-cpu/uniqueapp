import { useState, useMemo } from "react";
import { Virtuoso } from "react-virtuoso";
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
import { SpacesDialog } from "@/components/wall/SpacesDialog";
import { useUserMutes } from "@/hooks/useUserMutes";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const WALL_HIW_STEPS = [
  { title: "Feed tabs (For You / Following / Trending / Latest / Friends)", desc: "Switch what you see: personalized picks, only people you follow, hottest posts right now, newest globally, or just your friends." },
  { title: "Notes bar (24h status)", desc: "The row of avatars on top are short 24-hour status notes — tap one to read, tap your own to post a mood, question or link that disappears after a day." },
  { title: "Create a post", desc: "Use the composer / plus button to post text, photos, videos, polls, or GIFs. Add hashtags and mentions with # and @." },
  { title: "Reactions, comments, share, repost", desc: "❤️ like, 💬 comment, 🔁 repost with your own comment, and ↗️ share externally. Long-press the like for extra reactions." },
  { title: "Bookmark / Save", desc: "The bookmark icon saves a post to Wall → Saved so you can find it later without scrolling." },
  { title: "Search bar", desc: "Search posts, people, hashtags and groups. Save frequent searches from the ⭐ icon so you can rerun them from Saved Searches." },
  { title: "Filters (Sort / Time / Category)", desc: "Sort by newest, oldest, most liked or most commented. Narrow by today/week/month or to text-only, image or video posts. Reset returns to defaults." },
  { title: "Profile Customization", desc: "Edit your banner, avatar, bio, pinned post, and theme colors that appear on your public profile." },
  { title: "Spaces", desc: "Live audio rooms. Open Spaces to join a running room or start your own drop-in voice chat with followers." },
  { title: "Group Chat", desc: "Create or open a multi-person chat with friends — separate from 1:1 Messages." },
  { title: "Close Friends", desc: "A private circle. Posts marked 'Close Friends only' are shown just to people on this list." },
  { title: "Followed Topics", desc: "Follow hashtags/topics so their posts appear in your For You feed even if you don't follow the author." },
  { title: "Saved Searches", desc: "One-tap access to searches you saved from the search bar." },
  { title: "Muted Users", desc: "Hide all posts from a specific user without unfollowing or blocking them." },
  { title: "Muted Keywords", desc: "Auto-hide posts containing words or phrases you don't want to see (e.g. spoilers)." },
  { title: "Achievements badge", desc: "Shows XP, level and unlocked Wall achievements — tap for details and next goals." },
  { title: "Pull to refresh", desc: "On mobile, pull the feed down until the spinner spins to load the freshest posts." },
  { title: "Wall sub-pages", desc: "Use the Wall menu to jump to Videos (TikTok-style), Stories, Trending, Friends, Groups, Pages, Events, Memories, Messages, Saved, Info." },
  { title: "Post menu (⋯)", desc: "On any post: report, mute author, mute keyword, copy link, or delete (your own posts)." },
  { title: "Notifications & DMs", desc: "The bell (top nav) shows likes, comments, follows, mentions. The envelope opens Messages for private 1:1 chat." },
];

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
  const [activeTab] = useState<"latest">("latest");
  void activeTab;
  const mutedKeywords = useMutedKeywords();
  const { mutedIds } = useUserMutes();

  // Note: feed-tab filtering (For You / Following / Trending / Latest / Friends) is
  // handled by Wall.tsx via filteredFeedItems. This component only applies the
  // user-level mute filters on top of what the parent already filtered/sorted.
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
      if (timeFilter !== "all") {
        const created = new Date(data.created_at).getTime();
        const now = Date.now();
        const day = 86_400_000;
        const cutoff =
          timeFilter === "today" ? now - day :
          timeFilter === "week" ? now - 7 * day :
          timeFilter === "month" ? now - 30 * day : 0;
        if (created < cutoff) return false;
      }
      if (categoryFilter !== "all" && item.type === "post") {
        const media = data.media || data.attachments || [];
        const hasImg = Array.isArray(media) && media.some((m: any) => /image/i.test(m?.type ?? m?.mime ?? ""));
        const hasVid = Array.isArray(media) && media.some((m: any) => /video/i.test(m?.type ?? m?.mime ?? ""));
        if (categoryFilter === "image" && !hasImg) return false;
        if (categoryFilter === "video" && !hasVid) return false;
        if (categoryFilter === "text" && (hasImg || hasVid)) return false;
      }
      return true;
    });
    return [...filtered].sort((a, b) => {
      const da: any = a.data, db: any = b.data;
      if (sortBy === "newest") return new Date(db.created_at).getTime() - new Date(da.created_at).getTime();
      if (sortBy === "oldest") return new Date(da.created_at).getTime() - new Date(db.created_at).getTime();
      if (sortBy === "popular") return (db.likes_count ?? 0) - (da.likes_count ?? 0);
      if (sortBy === "most-comments") return (db.comments_count ?? 0) - (da.comments_count ?? 0);
      return 0;
    });
  }, [filteredFeedItems, mutedKeywords, mutedIds, sortBy, timeFilter, categoryFilter]);

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
          {/* Prominent How it works banner — always visible at top of Wall */}
          <HowItWorksButton
            title="Wall"
            intro="The Wall is your social feed. Here's what every button and feature does — so nothing on this page is a mystery."
            steps={WALL_HIW_STEPS}
            variant="compact"
            className="w-full h-11 justify-center gap-2 border-2 border-primary/40 bg-gradient-to-r from-primary/15 via-accent/10 to-primary/15 text-primary hover:bg-primary/20 shadow-sm"
          />

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

          {/* Smart feed tabs are rendered by the Wall page (parent) — do not duplicate here */}

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
              <Virtuoso
                useWindowScroll
                data={visibleFeedItems}
                computeItemKey={(_, item) => `${item.type}-${item.data.id}`}
                endReached={() => {
                  if (hasMore && !loadingMore) fetchPosts(true);
                }}
                overscan={800}
                increaseViewportBy={{ top: 400, bottom: 800 }}
                itemContent={(index, item) => (
                  <div className="pb-5">
                    {item.type === 'post' ? (
                      <PostCard post={item.data} onDelete={fetchPosts} />
                    ) : (
                      <RepostCard repost={item.data} onDelete={fetchPosts} />
                    )}
                    {(index + 1) % 20 === 0 && (
                      <div className="mt-5">
                        <MonetagInFeedAd slotIndex={Math.floor((index + 1) / 20)} />
                      </div>
                    )}
                  </div>
                )}
                components={{
                  Footer: () => (
                    <>
                      {loadingMore && (
                        <div className="glass-post-card p-6 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                          <span className="text-sm text-muted-foreground">Loading more posts...</span>
                        </div>
                      )}
                      {!loading && !loadingMore && !hasMore && visibleFeedItems.length > 0 && (
                        <div className="glass-post-card p-6 text-center text-muted-foreground text-sm">
                          You've reached the end! 🎉
                        </div>
                      )}
                    </>
                  ),
                }}
              />
            )}
          </div>

        </div>
      </div>
    </>
  );
}
