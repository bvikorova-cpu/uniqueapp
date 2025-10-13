import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import CreatePost from "@/components/feed/CreatePost";
import PostCard from "@/components/feed/PostCard";
import UserSearch from "@/components/feed/UserSearch";
import StoriesBar from "@/components/feed/StoriesBar";
import CreateStory from "@/components/feed/CreateStory";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
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

const Feed = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          media (*)
        `)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      // Fetch profiles separately
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

    // Subscribe to new posts
    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel);
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-primary bg-clip-text text-transparent text-center">
          Feed
        </h1>

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

        <div className="mt-8 space-y-4">
          {loading ? (
            <Card className="p-8 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </Card>
          ) : posts.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No posts yet. Be the first to add something!
            </Card>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={fetchPosts}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
