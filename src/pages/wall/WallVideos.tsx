import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Video, Loader2 } from "lucide-react";
import PostCard from "@/components/feed/PostCard";

export default function WallVideos() {
  const { data: videoPosts = [], isLoading, refetch } = useQuery({
    queryKey: ["video-posts"],
    queryFn: async () => {
      // Fetch posts that have video media
      const { data: posts } = await supabase
        .from("posts")
        .select(`
          *,
          media (*)
        `)
        .order("created_at", { ascending: false });

      if (!posts) return [];

      // Filter posts that have at least one video
      const videoPostsData = posts.filter(post => 
        post.media?.some((m: any) => m.file_type?.startsWith("video/"))
      );

      // Get unique user IDs
      const userIds = Array.from(new Set(videoPostsData.map(p => p.user_id)));

      // Batch fetch all profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      const profilesMap = new Map(
        (profiles || []).map(p => [p.id, p])
      );

      // Map posts with profiles
      return videoPostsData.map(post => ({
        ...post,
        profiles: profilesMap.get(post.user_id) || {
          id: post.user_id,
          full_name: null,
          avatar_url: null
        }
      }));
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Video className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Videos</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : videoPosts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No videos yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {videoPosts.map((post) => (
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
