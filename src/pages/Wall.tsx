import { useEffect, useState } from "react";
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
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, Home, Users } from "lucide-react";
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
  const { toast } = useToast();
  const { data: trendingPosts, isLoading: trendingLoading } = useTrendingPosts();
  const { data: followingPosts, isLoading: followingLoading } = useFollowingPosts(user?.id);

  const fetchPosts = async () => {
    try {
      // Fetch regular posts
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          media (*)
        `)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      // Fetch profiles for posts
      const postsWithProfiles = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .eq("id", post.user_id)
            .single();
          
          return {
            ...post,
            profiles: profile || { id: post.user_id, full_name: null, avatar_url: null }
          };
        })
      );

      setPosts(postsWithProfiles);

      // Fetch reposts
      const { data: repostsData, error: repostsError } = await supabase
        .from("reposts")
        .select(`
          *
        `)
        .order("created_at", { ascending: false });

      if (repostsError) throw repostsError;

      // Fetch all data for reposts (profiles and original posts with their media)
      const repostsWithData = await Promise.all(
        (repostsData || []).map(async (repost) => {
          // Get repost author profile
          const { data: repostProfile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .eq("id", repost.user_id)
            .single();

          // Get original post with media
          const { data: originalPost } = await supabase
            .from("posts")
            .select(`
              *,
              media (*)
            `)
            .eq("id", repost.original_post_id)
            .single();

          if (!originalPost) return null;

          // Get original post author profile
          const { data: originalProfile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .eq("id", originalPost.user_id)
            .single();

          return {
            ...repost,
            profiles: repostProfile || { id: repost.user_id, full_name: null, avatar_url: null },
            original_post: {
              ...originalPost,
              profiles: originalProfile || { id: originalPost.user_id, full_name: null, avatar_url: null }
            }
          };
        })
      );

      // Filter out null values (posts that were deleted)
      const validReposts = repostsWithData.filter(r => r !== null) as Repost[];
      setReposts(validReposts);

      // Combine and sort all feed items by created_at
      const combined: FeedItem[] = [
        ...postsWithProfiles.map(post => ({ type: 'post' as const, data: post })),
        ...validReposts.map(repost => ({ type: 'repost' as const, data: repost }))
      ];

      combined.sort((a, b) => {
        const dateA = new Date(a.data.created_at).getTime();
        const dateB = new Date(b.data.created_at).getTime();
        return dateB - dateA;
      });

      setFeedItems(combined);
    } catch (error: any) {
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-background pt-24 pb-8">
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
            ) : feedItems.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                No posts yet. Be the first to add something!
              </Card>
            ) : (
              <div className="masonry-grid">
                {feedItems.map((item, index) => (
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Feed;
