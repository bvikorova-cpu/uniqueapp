import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Bookmark, Loader2 } from "lucide-react";
import PostCard from "@/components/feed/PostCard";

export default function WallSaved() {
  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: savedPosts = [], isLoading, refetch } = useQuery({
    queryKey: ["saved-posts", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get saved post IDs
      const { data: savedData } = await supabase
        .from("saved_posts")
        .select("post_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!savedData || savedData.length === 0) return [];

      const postIds = savedData.map(s => s.post_id);

      // Fetch posts with their media
      const { data: posts } = await supabase
        .from("posts")
        .select(`*, media (*)`)
        .in("id", postIds);

      if (!posts) return [];

      // Collect unique user IDs
      const userIds = Array.from(new Set(posts.map(p => p.user_id)));

      // Batch fetch all profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      const profilesMap = new Map(
        (profiles || []).map(p => [p.id, p])
      );

      // Map posts with profiles
      return posts.map(post => ({
        ...post,
        profiles: profilesMap.get(post.user_id) || {
          id: post.user_id,
          full_name: null,
          avatar_url: null
        }
      }));
    },
    enabled: !!user,
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bookmark className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Saved Posts</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : savedPosts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No saved posts yet</p>
            <p className="text-sm mt-2">Save posts to view them later</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={refetch}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
