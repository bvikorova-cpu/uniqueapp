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
            <VideoPlayer key={video.id} video={video} onUpdate={fetchVideos} />
          ))}
        </div>

        {videos.length === 0 && (
          <div className="text-center p-12 border border-border rounded-lg">
            <p className="text-muted-foreground mb-4">No videos yet</p>
            <p className="text-sm text-muted-foreground">Click the upload button to add your first video</p>
          </div>
        )}
      </div>

      {/* Floating upload button */}
      <div className="fixed bottom-8 right-8">
        <Button
          size="lg"
          className="rounded-full h-16 w-16 shadow-lg"
          onClick={() => setUploadDialogOpen(true)}
        >
          <Upload className="h-6 w-6" />
        </Button>
      </div>

      <VideoUpload
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadComplete={fetchVideos}
      />
    </div>
  );
}
