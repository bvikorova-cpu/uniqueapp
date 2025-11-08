import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import CreatePost from "@/components/feed/CreatePost";
import PostCard from "@/components/feed/PostCard";
import RepostCard from "@/components/feed/RepostCard";
import UserSearch from "@/components/feed/UserSearch";
import StoriesBar from "@/components/feed/StoriesBar";
import CreateStory from "@/components/feed/CreateStory";
import { PostFilters, SortBy, TimeFilter, CategoryFilter } from "@/components/feed/PostFilters";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, Home, Users, ArrowUp, Search, X } from "lucide-react";
import { useTrendingPosts } from "@/hooks/useTrends";
import { useFollowingPosts } from "@/hooks/useFollow";

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  reposts_count: number;
  media: Array<{
    id: string;
    file_url: string;
    file_type: string;
  }>;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface Repost {
  id: string;
  user_id: string;
  comment: string;
  created_at: string;
  original_post: Post;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

type FeedItem = 
  | { type: 'post'; data: Post }
  | { type: 'repost'; data: Repost };

const Feed = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reposts, setReposts] = useState<Repost[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [pullToRefresh, setPullToRefresh] = useState({
    pulling: false,
    pullDistance: 0,
    canRefresh: false,
  });
  const POSTS_PER_PAGE = 10;
  const PULL_THRESHOLD = 80;
  const { toast } = useToast();
  const { data: trendingPosts, isLoading: trendingLoading } = useTrendingPosts();
  const { data: followingPosts, isLoading: followingLoading } = useFollowingPosts(user?.id);
  
  // Filter states
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPosts = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setPage(0);
        setHasMore(true);
      }

      const currentPage = loadMore ? page + 1 : 0;
      const from = currentPage * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      // Fetch regular posts with pagination
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          media (*)
        `)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (postsError) throw postsError;

      // Fetch reposts with pagination
      const { data: repostsData, error: repostsError } = await supabase
        .from("reposts")
        .select(`*`)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (repostsError) throw repostsError;

      // Check if we have more data
      const hasMoreData = (postsData?.length || 0) + (repostsData?.length || 0) === POSTS_PER_PAGE;
      setHasMore(hasMoreData);

      // Collect all unique user IDs and post IDs needed
      const userIds = new Set<string>();
      const originalPostIds = new Set<string>();

      (postsData || []).forEach(post => userIds.add(post.user_id));
      (repostsData || []).forEach(repost => {
        userIds.add(repost.user_id);
        originalPostIds.add(repost.original_post_id);
      });

      // Batch fetch all profiles
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", Array.from(userIds));

      const profilesMap = new Map(
        (profilesData || []).map(p => [p.id, p])
      );

      // Batch fetch all original posts for reposts
      const { data: originalPostsData } = await supabase
        .from("posts")
        .select(`*, media (*)`)
        .in("id", Array.from(originalPostIds));

      const originalPostsMap = new Map(
        (originalPostsData || []).map(p => [p.id, p])
      );

      // Map posts with profiles
      const postsWithProfiles = (postsData || []).map(post => ({
        ...post,
        profiles: profilesMap.get(post.user_id) || { 
          id: post.user_id, 
          full_name: null, 
          avatar_url: null 
        }
      }));

      // Map reposts with profiles and original posts
      const repostsWithData = (repostsData || [])
        .map(repost => {
          const originalPost = originalPostsMap.get(repost.original_post_id);
          if (!originalPost) return null;

          return {
            ...repost,
            profiles: profilesMap.get(repost.user_id) || { 
              id: repost.user_id, 
              full_name: null, 
              avatar_url: null 
            },
            original_post: {
              ...originalPost,
              profiles: profilesMap.get(originalPost.user_id) || { 
                id: originalPost.user_id, 
                full_name: null, 
                avatar_url: null 
              }
            }
          };
        })
        .filter(r => r !== null) as Repost[];

      if (loadMore) {
        setPosts(prev => [...prev, ...postsWithProfiles]);
        setReposts(prev => [...prev, ...repostsWithData]);
      } else {
        setPosts(postsWithProfiles);
        setReposts(repostsWithData);
      }

      // Combine and sort all feed items by created_at
      const newItems: FeedItem[] = [
        ...postsWithProfiles.map(post => ({ type: 'post' as const, data: post })),
        ...repostsWithData.map(repost => ({ type: 'repost' as const, data: repost }))
      ];

      newItems.sort((a, b) => {
        const dateA = new Date(a.data.created_at).getTime();
        const dateB = new Date(b.data.created_at).getTime();
        return dateB - dateA;
      });

      if (loadMore) {
        setFeedItems(prev => [...prev, ...newItems]);
        setPage(currentPage);
      } else {
        setFeedItems(newItems);
      }
    } catch (error: any) {
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      if (loadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          navigate("/auth");
        } else {
          setUser(session.user);
        }
      }
    );

    fetchPosts();

    // Subscribe to new posts and reposts
    const postsChannel = supabase
      .channel("posts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    const repostsChannel = supabase
      .channel("reposts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reposts",
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(repostsChannel);
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Pull-to-refresh functionality
  useEffect(() => {
    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const scrollTop = document.documentElement.scrollTop;
      if (scrollTop === 0) {
        startY = e.touches[0].clientY;
        setPullToRefresh(prev => ({ ...prev, pulling: true }));
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pullToRefresh.pulling) return;
      
      const scrollTop = document.documentElement.scrollTop;
      if (scrollTop > 0) {
        setPullToRefresh({ pulling: false, pullDistance: 0, canRefresh: false });
        return;
      }

      currentY = e.touches[0].clientY;
      const pullDistance = Math.max(0, currentY - startY);
      
      if (pullDistance > 0) {
        e.preventDefault();
      }

      setPullToRefresh({
        pulling: true,
        pullDistance: Math.min(pullDistance, 120),
        canRefresh: pullDistance > PULL_THRESHOLD,
      });
    };

    const handleTouchEnd = async () => {
      if (pullToRefresh.canRefresh && !loading) {
        await fetchPosts();
        toast({
          title: "Feed refreshed",
          description: "Your feed has been updated",
        });
      }
      
      setPullToRefresh({ pulling: false, pullDistance: 0, canRefresh: false });
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullToRefresh.pulling, pullToRefresh.canRefresh, loading]);

  // Infinite scroll effect and back to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop;
      
      // Show back to top button when scrolled down 400px
      setShowBackToTop(scrollTop > 400);

      if (loadingMore || !hasMore) return;

      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      // Load more when user is 300px from bottom
      if (scrollHeight - scrollTop - clientHeight < 300) {
        fetchPosts(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, page]);

  // Filter and sort feed items
  const filteredFeedItems = useMemo(() => {
    let filtered = [...feedItems];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        if (item.type === 'post') {
          const post = item.data as Post;
          // Search in content
          const contentMatch = post.content.toLowerCase().includes(query);
          // Search in hashtags (extract hashtags from content)
          const hashtags = post.content.match(/#\w+/g) || [];
          const hashtagMatch = hashtags.some(tag => tag.toLowerCase().includes(query));
          // Search in author name
          const authorMatch = post.profiles.full_name?.toLowerCase().includes(query);
          
          return contentMatch || hashtagMatch || authorMatch;
        } else {
          const repost = item.data as Repost;
          // Search in repost comment
          const commentMatch = repost.comment?.toLowerCase().includes(query);
          // Search in original post content
          const originalContentMatch = repost.original_post.content.toLowerCase().includes(query);
          // Search in repost author name
          const authorMatch = repost.profiles.full_name?.toLowerCase().includes(query);
          
          return commentMatch || originalContentMatch || authorMatch;
        }
      });
    }

    // Time filter
    if (timeFilter !== "all") {
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const startOfWeek = new Date(now.setDate(now.getDate() - 7));
      const startOfMonth = new Date(now.setDate(now.getDate() - 30));

      filtered = filtered.filter(item => {
        const itemDate = new Date(item.data.created_at);
        switch (timeFilter) {
          case "today":
            return itemDate >= startOfDay;
          case "week":
            return itemDate >= startOfWeek;
          case "month":
            return itemDate >= startOfMonth;
          default:
            return true;
        }
      });
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => {
        if (item.type === "repost") return false;
        
        const post = item.data as Post;
        const hasMedia = post.media && post.media.length > 0;
        
        switch (categoryFilter) {
          case "text":
            return !hasMedia;
          case "image":
            return hasMedia && post.media.some(m => m.file_type.startsWith("image"));
          case "video":
            return hasMedia && post.media.some(m => m.file_type.startsWith("video"));
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime();
        case "oldest":
          return new Date(a.data.created_at).getTime() - new Date(b.data.created_at).getTime();
        case "popular":
          const aLikes = a.type === "post" ? a.data.likes_count : 0;
          const bLikes = b.type === "post" ? b.data.likes_count : 0;
          return bLikes - aLikes;
        case "most-comments":
          const aComments = a.type === "post" ? a.data.comments_count : 0;
          const bComments = b.type === "post" ? b.data.comments_count : 0;
          return bComments - aComments;
        default:
          return 0;
      }
    });

    return filtered;
  }, [feedItems, sortBy, timeFilter, categoryFilter, searchQuery]);

  const handleResetFilters = () => {
    setSortBy("newest");
    setTimeFilter("all");
    setCategoryFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-8">
      {/* Pull-to-refresh indicator */}
      {pullToRefresh.pulling && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-200"
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
              {pullToRefresh.canRefresh ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-4xl">
        <UserSearch />

        {/* Stories Bar */}
        <StoriesBar />

        {/* Hidden trigger for CreateStory dialog */}
        <div id="create-story-trigger" className="hidden">
          <CreateStory />
        </div>

        <div className="mt-4">
          <CreateStory />
        </div>

        <CreatePost onPostCreated={fetchPosts} />

        {/* Search Bar */}
        <div className="relative mt-4 mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Hľadať príspevky, hashtagy alebo používateľov..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
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

        <Tabs defaultValue="all" className="mt-8">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              All Posts
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Following
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {loading ? (
              <Card className="p-8 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </Card>
            ) : filteredFeedItems.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                No posts found. Try adjusting your filters.
              </Card>
            ) : (
              <div className="masonry-grid">
                {filteredFeedItems.map((item, index) => (
                  <div 
                    key={`${item.type}-${item.data.id}`}
                    className="masonry-item animate-fade-in"
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
              </div>
            )}
          </TabsContent>

          <TabsContent value="following" className="mt-6">
            {followingLoading ? (
              <Card className="p-8 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </Card>
            ) : !followingPosts || followingPosts.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">
                  No posts from people you follow yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Follow users to see their posts here
                </p>
              </Card>
            ) : (
              <div className="masonry-grid">
                {followingPosts.map((post, index) => (
                  <div 
                    key={post.id}
                    className="masonry-item animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <PostCard
                      post={post}
                      onDelete={fetchPosts}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending" className="mt-6">
            {trendingLoading ? (
              <Card className="p-8 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </Card>
            ) : !trendingPosts || trendingPosts.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                No trending posts yet. Be the first to create viral content!
              </Card>
            ) : (
              <div className="masonry-grid">
                {trendingPosts.map((post, index) => (
                  <div 
                    key={post.id}
                    className="masonry-item animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <PostCard
                      post={post}
                      onDelete={fetchPosts}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Loading more indicator */}
            {loadingMore && (
              <Card className="p-4 mt-4 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span className="text-sm text-muted-foreground">Loading more posts...</span>
              </Card>
            )}
            
            {/* End of feed message */}
            {!loading && !loadingMore && !hasMore && filteredFeedItems.length > 0 && (
              <Card className="p-4 mt-4 text-center text-muted-foreground text-sm">
                You've reached the end! 🎉
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-glow hover:shadow-lg transition-all duration-300 hover:scale-110 animate-fade-in"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default Feed;
