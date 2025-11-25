import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Video, Loader2 } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import VideoUploadDialog from "@/components/wall/VideoUploadDialog";
import VideoCard from "@/components/wall/VideoCard";

export default function WallVideos() {
  const { data: videoPosts = [], isLoading: loadingPosts, refetch: refetchPosts } = useQuery({
    queryKey: ["video-posts"],
    queryFn: async () => {
      const { data: posts } = await supabase
        .from("posts")
        .select(`
          *,
          media (*)
        `)
        .order("created_at", { ascending: false });

      if (!posts) return [];

      const videoPostsData = posts.filter(post => 
        post.media?.some((m) => m.file_type?.startsWith("video/"))
      );

      const userIds = Array.from(new Set(videoPostsData.map(p => p.user_id)));

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      const profilesMap = new Map(
        (profiles || []).map(p => [p.id, p])
      );

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

  const { data: standaloneVideos = [], isLoading: loadingVideos, refetch: refetchVideos } = useQuery({
    queryKey: ["standalone-videos"],
    queryFn: async () => {
      const { data: videos } = await supabase
        .from("videos")
        .select("*, profiles:user_id(full_name, avatar_url)")
        .order("created_at", { ascending: false });

      return videos || [];
    },
  });

  const isLoading = loadingPosts || loadingVideos;
  
  const refetch = () => {
    refetchPosts();
    refetchVideos();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Video className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Videos</h2>
          </div>
          <VideoUploadDialog onUploadSuccess={refetch} />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : videoPosts.length === 0 && standaloneVideos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No videos yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {standaloneVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
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
