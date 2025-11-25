import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PostCard from "@/components/feed/PostCard";
import RepostCard from "@/components/feed/RepostCard";
import { PostFilters, SortBy, TimeFilter, CategoryFilter } from "@/components/feed/PostFilters";
import { Card } from "@/components/ui/card";
import { Loader2, Zap, GraduationCap } from "lucide-react";
import { AchievementsBadge } from "@/components/wall/AchievementsBadge";
import { SearchBar } from "@/components/wall/SearchBar";
import { TopGameWidget } from "@/components/wall/TopGameWidget";
import { useTranslation } from "react-i18next";
import type { Post, Repost, FeedItem } from "@/types/database";
import { Button } from "@/components/ui/button";

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
  const [focusMode, setFocusMode] = useState(false);
  const [learnWorkMode, setLearnWorkMode] = useState(false);
  const { t } = useTranslation();

  // Filter feed items based on focus/learn mode
  const getFilteredItems = () => {
    let items = filteredFeedItems;

    if (focusMode) {
      // Show only high engagement posts (sort by engagement score)
      items = items.filter(item => {
        if (item.type === 'post') {
          const post = item.data;
          const engagementScore = (post.likes_count || 0) + (post.comments_count || 0) * 2 + (post.reposts_count || 0) * 3;
          return engagementScore > 10; // Threshold for high engagement
        }
        return true;
      });
    }

    if (learnWorkMode) {
      // Show only educational/professional content
      items = items.filter(item => {
        if (item.type === 'post') {
          const post = item.data;
          const content = post.content.toLowerCase();
          const keywords = ['learn', 'tutorial', 'guide', 'course', 'work', 'project', 'study', 'education', 'skill'];
          return keywords.some(keyword => content.includes(keyword));
        }
        return true;
      });
    }

    return items;
  };

  const displayItems = getFilteredItems();

  const handleResetFilters = () => {
    setSortBy("newest");
    setTimeFilter("all");
    setCategoryFilter("all");
    setFocusMode(false);
    setLearnWorkMode(false);
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

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed - Left & Center */}
          <div className="lg:col-span-2 space-y-4">
            {/* Achievements Badge */}
            <div className="flex justify-end">
              <AchievementsBadge />
            </div>

            {/* Search Bar */}
            <SearchBar />

            {/* Focus Mode Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={focusMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFocusMode(!focusMode);
                  if (learnWorkMode) setLearnWorkMode(false);
                }}
                className={focusMode ? "bg-gradient-primary shadow-glow" : "glassmorphism"}
              >
                <Zap className="h-4 w-4 mr-2" />
                Focus Mode
              </Button>
              <Button
                variant={learnWorkMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setLearnWorkMode(!learnWorkMode);
                  if (focusMode) setFocusMode(false);
                }}
                className={learnWorkMode ? "bg-gradient-primary shadow-glow" : "glassmorphism"}
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Learn/Work
              </Button>
            </div>

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
            <div className="space-y-4">
              {loading ? (
                <Card className="glassmorphism p-8 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </Card>
              ) : displayItems.length === 0 ? (
                <Card className="glassmorphism p-8 text-center text-muted-foreground">
                  {focusMode && "No high-engagement posts found"}
                  {learnWorkMode && "No educational/work posts found"}
                  {!focusMode && !learnWorkMode && t('wall.feed.noPostsFound')}
                </Card>
              ) : (
                <>
                  {displayItems.map((item, index) => (
                    <div 
                      key={`${item.type}-${item.data.id}`}
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
                  ))}
                  
                  {/* Loading more indicator */}
                  {loadingMore && (
                    <Card className="glassmorphism p-4 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                      <span className="text-sm text-muted-foreground">{t('wall.feed.loadingMore')}</span>
                    </Card>
                  )}
                  
                  {/* End of feed message */}
                  {!loading && !loadingMore && !hasMore && displayItems.length > 0 && (
                    <Card className="glassmorphism p-4 text-center text-muted-foreground text-sm">
                      {t('wall.feed.reachedEnd')}
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Sidebar - Widgets */}
          <div className="hidden lg:block space-y-4 sticky top-24 h-fit">
            <TopGameWidget />
          </div>
        </div>
      </div>
    </>
  );
}
