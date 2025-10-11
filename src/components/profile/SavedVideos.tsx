import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Play, Eye, Heart, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Video {
  id: string;
  title: string | null;
  video_url: string;
  thumbnail_url: string | null;
  views_count: number;
  likes_count: number;
  created_at: string;
}

interface SavedVideo {
  id: string;
  video_id: string;
  created_at: string;
  videos: Video;
}

export const SavedVideos = ({ userId }: { userId: string }) => {
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSavedVideos = async () => {
    const { data, error } = await supabase
      .from("saved_videos")
      .select(`
        id,
        video_id,
        created_at,
        videos (*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSavedVideos(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSavedVideos();
  }, [userId]);

  const handleUnsave = async (savedVideoId: string) => {
    const { error } = await supabase
      .from("saved_videos")
      .delete()
      .eq("id", savedVideoId);

    if (!error) {
      toast({ title: "Video odstránené z uložených" });
      fetchSavedVideos();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Načítavam...</div>;
  }

  if (savedVideos.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        Zatiaľ žiadne uložené videá
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {savedVideos.map((saved) => (
        <Card key={saved.id} className="overflow-hidden group">
          <div className="relative aspect-video bg-black">
            <video
              src={saved.videos.video_url}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="h-12 w-12 text-white" />
            </div>
            <button
              onClick={() => handleUnsave(saved.id)}
              className="absolute top-2 right-2 p-2 bg-red-500/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4 text-white" />
            </button>
          </div>
          <div className="p-3">
            <p className="font-semibold truncate">{saved.videos.title || "Bez názvu"}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {saved.videos.views_count}
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {saved.videos.likes_count}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
