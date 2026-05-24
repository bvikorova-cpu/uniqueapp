import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Video, Loader2, Play, Film, Clapperboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PostCard from "@/components/feed/PostCard";
import VideoUploadDialog from "@/components/wall/VideoUploadDialog";
import VideoCard from "@/components/wall/VideoCard";
import MonetagInFeedAd from "@/components/ads/MonetagInFeedAd";
import { Fragment } from "react";
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

  const { data: storyVideos = [], isLoading: loadingStories, refetch: refetchStories } = useQuery({
    queryKey: ["story-videos-in-wall"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data: stories } = await supabase
        .from("stories")
        .select("*")
        .eq("media_type", "video")
        .gt("expires_at", now)
        .order("created_at", { ascending: false });
      if (!stories?.length) return [];
      const userIds = Array.from(new Set(stories.map((s: any) => s.user_id)));
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", userIds);
      const map = new Map((profiles || []).map((p: any) => [p.id, p]));
      return stories.map((s: any) => ({
        id: `story-${s.id}`,
        title: s.caption || "Story",
        description: null,
        video_url: s.media_url,
        thumbnail_url: null,
        views_count: 0,
        likes_count: 0,
        created_at: s.created_at,
        profiles: map.get(s.user_id) || { full_name: null, avatar_url: null },
      }));
    },
  });

  const isLoading = loadingPosts || loadingVideos || loadingStories;
  const refetch = () => { refetchPosts(); refetchVideos(); refetchStories(); };
  const totalVideos = standaloneVideos.length + videoPosts.length + storyVideos.length;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-12 sm:pt-6 pb-8 space-y-6">
      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500/15 via-primary/10 to-purple-500/5 border border-rose-500/20 p-6 sm:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-500/15 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div 
              className="p-4 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 shadow-xl shadow-rose-500/30"
              whileHover={{ rotate: -5, scale: 1.05 }}
            >
              <Play className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-foreground via-rose-500 to-purple-500 bg-clip-text text-transparent">Videos</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {totalVideos > 0 ? `${totalVideos} videos in your feed` : "Watch & share video content"}
              </p>
            </div>
          </div>
          <VideoUploadDialog onUploadSuccess={refetch} />
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading videos...</p>
        </div>
      ) : totalVideos === 0 ? (
        <Card className="border-dashed border-2 border-primary/20 bg-gradient-to-br from-rose-500/5 via-background to-purple-500/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl" />
          <CardContent className="py-16 text-center relative">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-5">
              <Clapperboard className="h-10 w-10 text-rose-500" />
            </motion.div>
            <h3 className="text-xl font-black mb-2">No videos yet</h3>
            <p className="text-sm text-muted-foreground mb-5">Upload a video to get started and share with the community</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {[...storyVideos.map((v: any) => ({ kind: "video" as const, data: v })),
            ...standaloneVideos.map((v: any) => ({ kind: "video" as const, data: v })),
            ...videoPosts.map((p: any) => ({ kind: "post" as const, data: p }))
          ].map((item, i) => {
            const showAd = (i + 1) % 20 === 0;
            return (
              <Fragment key={item.kind === "video" ? `v-${item.data.id}` : `p-${item.data.id}`}>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, type: "spring", stiffness: 200 }}>
                  {item.kind === "video" ? <VideoCard video={item.data} /> : <PostCard post={item.data} onDelete={refetch} />}
                </motion.div>
                {showAd && <MonetagInFeedAd slotIndex={Math.floor((i + 1) / 20)} />}
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
