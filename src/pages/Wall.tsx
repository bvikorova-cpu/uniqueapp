import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import CreatePost from "@/components/feed/CreatePost";
import PostCard from "@/components/feed/PostCard";
import RepostCard from "@/components/feed/RepostCard";
import UserSearch from "@/components/feed/UserSearch";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, Home, Users, ArrowUp, Search, X, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { WallSidebar } from "@/components/wall/WallSidebar";
import { WallRightbar } from "@/components/wall/WallRightbar";
import { MobileWallMenu } from "@/components/wall/MobileWallMenu";
import { EnhancedCreatePost } from "@/components/wall/EnhancedCreatePost";
import { AchievementsBadge } from "@/components/wall/AchievementsBadge";
import { SearchBar } from "@/components/wall/SearchBar";
import { WallTopNav } from "@/components/wall/WallTopNav";
import { WallBackground } from "@/components/wall/WallBackground";
import { useQuery } from "@tanstack/react-query";
import { useTrendingPosts } from "@/hooks/useTrends";
import WallMessages from "./wall/WallMessages";
import WallFriends from "./wall/WallFriends";
import WallGroups from "./wall/WallGroups";
import WallPages from "./wall/WallPages";
import WallVideos from "./wall/WallVideos";
import WallEvents from "./wall/WallEvents";
import WallSaved from "./wall/WallSaved";
import WallTrending from "./wall/WallTrending";

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  reposts_count: number;
  feeling?: string | null;
  location?: string | null;
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
  const [isRightbarOpen, setIsRightbarOpen] = useState(false);
  const [pullToRefresh, setPullToRefresh] = useState({
    pulling: false,
    pullDistance: 0,
    canRefresh: false,
  });
  const POSTS_PER_PAGE = 10;
  const PULL_THRESHOLD = 80;
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const { data: userProfile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

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

  const fetchSavedPosts = async () => {
    if (!user) return;
    
    setLoadingSaved(true);
    try {
      // Get saved post IDs
      const { data: savedData, error: savedError } = await supabase
        .from("saved_posts")
        .select("post_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (savedError) throw savedError;

      if (!savedData || savedData.length === 0) {
        setSavedPosts([]);
        setLoadingSaved(false);
        return;
      }

      const postIds = savedData.map(s => s.post_id);

      // Fetch posts with their media
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`*, media (*)`)
        .in("id", postIds);

      if (postsError) throw postsError;

      // Collect unique user IDs
      const userIds = new Set<string>();
      (postsData || []).forEach(post => userIds.add(post.user_id));

      // Batch fetch all profiles
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", Array.from(userIds));

      const profilesMap = new Map(
        (profilesData || []).map(p => [p.id, p])
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

      setSavedPosts(postsWithProfiles);
    } catch (error: any) {
      toast({
        title: "Error loading saved posts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingSaved(false);
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

    // Search filter only
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        if (item.type === 'post') {
          const post = item.data as Post;
          const contentMatch = post.content.toLowerCase().includes(query);
          const hashtags = post.content.match(/#\w+/g) || [];
          const hashtagMatch = hashtags.some(tag => tag.toLowerCase().includes(query));
          const authorMatch = post.profiles.full_name?.toLowerCase().includes(query);
          
          return contentMatch || hashtagMatch || authorMatch;
        } else {
          const repost = item.data as Repost;
          const commentMatch = repost.comment?.toLowerCase().includes(query);
          const originalContentMatch = repost.original_post.content.toLowerCase().includes(query);
          const authorMatch = repost.profiles.full_name?.toLowerCase().includes(query);
          
          return commentMatch || originalContentMatch || authorMatch;
        }
      });
    }

    return filtered;
  }, [feedItems, searchQuery]);

  const location = useLocation();
  const currentPath = location.pathname;

  // Determine which component to render based on path
  const renderContent = () => {
    switch (currentPath) {
      case '/wall/messages':
        return <WallMessages />;
      case '/wall/friends':
        return <WallFriends />;
      case '/wall/groups':
        return <WallGroups />;
      case '/wall/pages':
        return <WallPages />;
      case '/wall/videos':
        return <WallVideos />;
      case '/wall/events':
        return <WallEvents />;
      case '/wall/saved':
        return <WallSaved />;
      case '/wall/trending':
        return <WallTrending />;
      default:
        // Default Feed content
        return (
          <>
            {/* Pull-to-refresh indicator - adjusted for mobile */}
            {pullToRefresh.pulling && (
              <div 
                className="fixed top-0 left-0 lg:left-80 right-0 lg:right-80 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-200"
                style={{ 
                  height: `${pullToRefresh.pullDistance}px`,
                  opacity: pullToRefresh.pullDistance / PULL_THRESHOLD 
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <Loader2 
                    className={`h-5 w-5 sm:h-6 sm:w-6 text-primary transition-transform duration-200 ${
                      pullToRefresh.canRefresh ? 'animate-spin' : ''
                    }`}
                    style={{
                      transform: `rotate(${pullToRefresh.pullDistance * 3}deg)`
                    }}
                  />
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {pullToRefresh.canRefresh ? 'Release to refresh' : 'Pull to refresh'}
                  </span>
                </div>
              </div>
            )}

            <div className="max-w-2xl mx-auto px-2 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4">
              {/* Achievements Badge */}
              <div className="flex justify-end">
                <AchievementsBadge />
              </div>

              {/* Search Bar */}
              <SearchBar />

              {/* Feed */}
              <div className="space-y-3 sm:space-y-4">
                {loading ? (
                  <Card className="p-6 sm:p-8 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
                  </Card>
                ) : filteredFeedItems.length === 0 ? (
                  <Card className="p-6 sm:p-8 text-center text-sm sm:text-base text-muted-foreground">
                    No posts found. Try adjusting your filters.
                  </Card>
                ) : (
                  <>
                    {filteredFeedItems.map((item, index) => (
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
                      <Card className="p-3 sm:p-4 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary mr-2" />
                        <span className="text-xs sm:text-sm text-muted-foreground">Loading more posts...</span>
                      </Card>
                    )}
                    
                    {/* End of feed message */}
                    {!loading && !loadingMore && !hasMore && filteredFeedItems.length > 0 && (
                      <Card className="p-3 sm:p-4 text-center text-muted-foreground text-xs sm:text-sm">
                        You've reached the end! 🎉
                      </Card>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background - Full coverage */}
      <WallBackground />
      
      {/* Content overlay with stronger contrast */}
      <div className="relative z-10">
        {/* Fixed Top Navigation */}
        <WallTopNav currentPath={currentPath} />
      
      {/* Mobile Menu Button and Drawer */}
      <MobileWallMenu onPostCreated={fetchPosts} />
      
      {/* Main Layout Container - starts below fixed nav */}
      <div className="flex pt-[112px]">
        {/* Left Sidebar - Hidden on mobile, sticky within container */}
        <div className="hidden lg:block">
          <WallSidebar onPostCreated={fetchPosts} />
        </div>

        {/* Main Content Area - scrollable with enhanced contrast */}
        <div className="flex-1 min-w-0 px-2 sm:px-4 py-4">
          <div className="[&_.card]:bg-white/95 [&_.card]:backdrop-blur-md [&_.card]:shadow-[0_0_30px_rgba(167,139,250,0.3)] [&_.card]:border-violet-300/30">
            {renderContent()}
          </div>
        </div>

        {/* Right Sidebar - Hidden on mobile, visible on md+ */}
        <div className="hidden md:block">
          <WallRightbar />
        </div>
      </div>

      {/* Mobile Rightbar Sheet */}
      <Sheet open={isRightbarOpen} onOpenChange={setIsRightbarOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="md:hidden fixed bottom-20 right-4 z-50 h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          >
            <TrendingUp className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[85vw] sm:w-[400px] p-0 overflow-y-auto">
          <div className="pt-6">
            <WallRightbar />
          </div>
        </SheetContent>
      </Sheet>

      {/* Back to top button - enhanced neon style */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 xl:right-96 z-50 p-2.5 sm:p-3 rounded-full bg-violet-500 text-white shadow-[0_0_30px_rgba(167,139,250,0.8)] hover:shadow-[0_0_40px_rgba(167,139,250,1)] transition-all duration-300 hover:scale-110 animate-fade-in border-2 border-violet-300"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      )}
      </div>
    </div>
  );
};

export default Feed;
