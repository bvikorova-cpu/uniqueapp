import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Play, Heart, MessageCircle, Share2, Bookmark, Upload, Music, Loader2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Video {
  id: string;
  title: string | null;
  video_url: string;
  thumbnail_url: string | null;
  audio_track: string | null;
  views_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  };
}

const popularAudioTracks = [
  { id: "track1", name: "Summer Vibes", artist: "DJ Cool" },
  { id: "track2", name: "Chill Beats", artist: "Lo-Fi Master" },
  { id: "track3", name: "Dance Energy", artist: "EDM King" },
  { id: "track4", name: "Acoustic Dreams", artist: "Guitar Soul" },
  { id: "track5", name: "Hip Hop Flow", artist: "Rap Star" },
];

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from("videos")
      .select(`
        *,
        profiles (username, avatar_url)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setVideos(data as any);
    }
    setLoading(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("video/")) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file",
          description: "Please select a video file",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Missing file",
        description: "Please select a video",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to upload videos",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload video
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("videos")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("videos")
        .getPublicUrl(fileName);

      // Insert video record
      const { error: insertError } = await supabase
        .from("videos")
        .insert({
          user_id: user.id,
          video_url: publicUrl,
          audio_track: selectedAudioTrack || null,
          is_active: true,
        });

      if (insertError) throw insertError;

      toast({
        title: "Video uploaded!",
        description: "Your video has been uploaded successfully",
      });

      setUploadDialogOpen(false);
      setSelectedFile(null);
      setSelectedAudioTrack("");
      fetchVideos();
    } catch (error: any) {
      toast({
        title: "Upload error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (videoId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("video_likes")
      .insert({ video_id: videoId, user_id: user.id });

    if (!error) {
      fetchVideos();
      toast({ title: "Video sa páči!" });
    }
  };

  const handleSave = async (videoId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("saved_videos")
      .insert({ video_id: videoId, user_id: user.id });

    if (!error) {
      toast({ title: "Video uložené!" });
    }
  };

  const handleShare = (video: Video) => {
    const shareUrl = `${window.location.origin}/videos/${video.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Odkaz skopírovaný!" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Videá</h1>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Nahrať video
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nahrať nové video</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="video-file">Video File</Label>
                  <Input
                    id="video-file"
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    disabled={uploading}
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="audio-track">Audio Track (Optional)</Label>
                  <Select value={selectedAudioTrack} onValueChange={setSelectedAudioTrack} disabled={uploading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audio track" />
                    </SelectTrigger>
                    <SelectContent>
                      {popularAudioTracks.map((track) => (
                        <SelectItem key={track.id} value={track.id}>
                          {track.name} - {track.artist}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleUpload} disabled={uploading || !selectedFile} className="w-full">
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Video
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                      {video.profiles.username || "Používateľ"}
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
            <p className="text-muted-foreground mb-4">Zatiaľ tu nie sú žiadne videá</p>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Nahrať prvé video
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
