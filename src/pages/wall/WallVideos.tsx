import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Video, Loader2, Play, Film } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PostCard from "@/components/feed/PostCard";
import VideoUploadDialog from "@/components/wall/VideoUploadDialog";
import VideoCard from "@/components/wall/VideoCard";
import { motion } from "framer-motion";

export default function WallVideos() {
  const { data: videoPosts = [], isLoading: loadingPosts, refetch: refetchPosts } = useQuery({
    queryKey: ["video-posts"],
    queryFn: async () => {
      const { data: posts } = await supabase.from("posts").select(`*, media (*)`).order("created_at", { ascending: false });
      if (!posts) return [];
      const videoPostsData = posts.filter(post => post.media?.some((m: any) => m.file_type?.startsWith("video/")));
      const userIds = Array.from(new Set(videoPostsData.map(p => p.user_id)));
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", userIds);
      const profilesMap = new Map((profiles || []).map(p => [p.id, p]));
      return videoPostsData.map(post => ({
        ...post,
        profiles: profilesMap.get(post.user_id) || { id: post.user_id, full_name: null, avatar_url: null }
      }));
    },
  });

  const { data: standaloneVideos = [], isLoading: loadingVideos, refetch: refetchVideos } = useQuery({
    queryKey: ["standalone-videos"],
    queryFn: async () => {
      const { data: videos } = await supabase.from("videos").select("*, profiles:user_id(full_name, avatar_url)").order("created_at", { ascending: false });
      return videos || [];
    },
  });

  const isLoading = loadingPosts || loadingVideos;
  const refetch = () => { refetchPosts(); refetchVideos(); };
  const totalVideos = standaloneVideos.length + videoPosts.length;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-8 space-y-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
            <Play className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Videos</h1>
            <p className="text-sm text-muted-foreground">
              {totalVideos > 0 ? `${totalVideos} videos` : "Watch & share videos"}
            </p>
          </div>
        </div>
        <VideoUploadDialog onUploadSuccess={refetch} />
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : totalVideos === 0 ? (
        <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Film className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">No videos yet</h3>
            <p className="text-sm text-muted-foreground">Upload a video to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {standaloneVideos.map((video, i) => (
            <motion.div key={video.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <VideoCard video={video} />
            </motion.div>
          ))}
          {videoPosts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (standaloneVideos.length + i) * 0.05 }}>
              <PostCard post={post} onDelete={refetch} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
