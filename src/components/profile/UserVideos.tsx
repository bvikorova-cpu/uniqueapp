import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Play, Eye, Heart } from "lucide-react";

interface Video {
  id: string;
  title: string | null;
  video_url: string;
  thumbnail_url: string | null;
  views_count: number;
  likes_count: number;
  created_at: string;
}

export const UserVideos = ({ userId }: { userId: string }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setVideos(data);
      }
      setLoading(false);
    };

    fetchVideos();
  }, [userId]);

  if (loading) {
    return <div className="text-center py-8">Načítavam...</div>;
  }

  if (videos.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        Zatiaľ žiadne nahraté videá
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {videos.map((video) => (
        <Card key={video.id} className="overflow-hidden cursor-pointer hover:scale-105 transition-transform">
          <div className="relative aspect-video bg-black">
            <video
              src={video.video_url}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Play className="h-12 w-12 text-white" />
            </div>
          </div>
          <div className="p-3">
            <p className="font-semibold truncate">{video.title || "Bez názvu"}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {video.views_count}
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {video.likes_count}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
