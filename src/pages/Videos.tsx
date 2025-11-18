import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { VideoPlayer } from "@/components/videos/VideoPlayer";
import { VideoUpload } from "@/components/videos/VideoUpload";

interface Video {
  id: string;
  title: string | null;
  video_url: string;
  thumbnail_url: string | null;
  views_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
    full_name: string | null;
  };
}

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    fetchVideos();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('videos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'videos'
        },
        () => fetchVideos()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from("videos")
      .select(`
        *,
        profiles (username, avatar_url, full_name)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setVideos(data as any);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Videos</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Card key={video.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
              <div className="relative aspect-[9/16] bg-black">
                <video
                  src={video.video_url}
                  className="w-full h-full object-cover"
                  onClick={(e) => {
                    const target = e.target as HTMLVideoElement;
                    target.paused ? target.play() : target.pause();
                  }}
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-16 w-16 text-white" />
                </div>
                
                {/* Video info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={video.profiles.avatar_url || "/placeholder.svg"}
                      alt={video.profiles.username || "User"}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-white font-semibold text-sm">
                      {video.profiles.username || "User"}
                    </span>
                  </div>
                  <p className="text-white text-sm font-medium mb-1">
                    {video.title}
                  </p>
                  {video.audio_track && (
                    <div className="flex items-center gap-1 text-white/80 text-xs">
                      <Music className="h-3 w-3" />
                      <span>
                        {popularAudioTracks.find(t => t.id === video.audio_track)?.name || "Originálny zvuk"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="absolute right-2 bottom-20 flex flex-col gap-4">
                  <button
                    onClick={() => handleLike(video.id)}
                    className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform"
                  >
                    <Heart className="h-6 w-6" />
                    <span className="text-xs">{video.likes_count}</span>
                  </button>
                  <button
                    className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform"
                  >
                    <MessageCircle className="h-6 w-6" />
                    <span className="text-xs">{video.comments_count || 0}</span>
                  </button>
                  <button
                    onClick={() => handleSave(video.id)}
                    className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform"
                  >
                    <Bookmark className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => handleShare(video)}
                    className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform"
                  >
                    <Share2 className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <CardContent className="p-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {video.views_count}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {video.likes_count}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {videos.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No videos yet</p>
            <p className="text-sm text-muted-foreground">Click the upload button to add your first video</p>
          </Card>
        )}
      </div>

      {/* Floating upload button */}
      <div className="fixed bottom-8 right-8">
        <input
          type="file"
          id="video-upload"
          accept="video/*"
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
        />
        <label htmlFor="video-upload">
          <Button
            size="lg"
            className="rounded-full h-16 w-16 shadow-lg"
            disabled={uploading}
            asChild
          >
            <span className="cursor-pointer">
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Upload className="h-6 w-6" />
              )}
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
}
