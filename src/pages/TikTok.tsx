import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, MessageCircle, Share2, Upload, UserPlus, UserMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Video {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

const TikTok = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          navigate("/auth");
        } else {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchVideos();
      fetchLikedVideos();
      fetchFollowing();
    }
  }, [user]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.7 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [videos]);

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching videos:", error);
      return;
    }

    setVideos(data || []);
    
    const userIds = [...new Set(data?.map(v => v.user_id) || [])];
    const profilesData = await Promise.all(
      userIds.map(async (userId) => {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", userId)
          .maybeSingle();
        return data;
      })
    );

    const profilesMap = new Map();
    profilesData.forEach((profile) => {
      if (profile) profilesMap.set(profile.id, profile);
    });
    setProfiles(profilesMap);
  };

  const fetchLikedVideos = async () => {
    const { data } = await supabase
      .from("video_likes")
      .select("video_id")
      .eq("user_id", user.id);

    setLikedVideos(new Set(data?.map(l => l.video_id) || []));
  };

  const fetchFollowing = async () => {
    const { data } = await supabase
      .from("user_follows")
      .select("following_id")
      .eq("follower_id", user.id);

    setFollowing(new Set(data?.map(f => f.following_id) || []));
  };

  const toggleLike = async (videoId: string) => {
    if (likedVideos.has(videoId)) {
      await supabase
        .from("video_likes")
        .delete()
        .eq("video_id", videoId)
        .eq("user_id", user.id);
      
      setLikedVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    } else {
      await supabase
        .from("video_likes")
        .insert({ video_id: videoId, user_id: user.id });
      
      setLikedVideos(prev => new Set([...prev, videoId]));
    }
  };

  const toggleFollow = async (userId: string) => {
    if (following.has(userId)) {
      await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", userId);
      
      setFollowing(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    } else {
      await supabase
        .from("user_follows")
        .insert({ follower_id: user.id, following_id: userId });
      
      setFollowing(prev => new Set([...prev, userId]));
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    const fileExt = uploadFile.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(filePath, uploadFile);

    if (uploadError) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa nahrať video",
        variant: "destructive",
      });
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("videos")
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from("videos")
      .insert({
        user_id: user.id,
        title: uploadTitle,
        description: uploadDescription,
        video_url: publicUrl,
      });

    if (dbError) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa uložiť video",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Úspech",
      description: "Video bolo nahrané",
    });

    setUploadDialogOpen(false);
    setUploadFile(null);
    setUploadTitle("");
    setUploadDescription("");
    fetchVideos();
  };

  const togglePlayPause = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="fixed top-16 right-4 z-50">
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full shadow-elegant">
              <Upload className="h-5 w-5 mr-2" />
              Nahrať video
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nahrať nové video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
              </div>
              <div>
                <Input
                  placeholder="Názov videa"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Popis videa"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <Button onClick={handleUpload} className="w-full" disabled={!uploadFile}>
                Nahrať
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="h-[calc(100vh-4rem)] overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
        {videos.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Upload className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Zatiaľ nie sú žiadne videá. Buď prvý kto niečo nahrá!</p>
            </div>
          </div>
        ) : (
          videos.map((video, index) => {
            const profile = profiles.get(video.user_id);
            const isLiked = likedVideos.has(video.id);
            const isFollowing = following.has(video.user_id);

            return (
              <div
                key={video.id}
                className="h-[calc(100vh-4rem)] snap-start relative bg-black"
              >
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  src={video.video_url}
                  className="w-full h-full object-contain"
                  loop
                  playsInline
                  onClick={() => togglePlayPause(index)}
                />

                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none" />

                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="flex items-start gap-3 mb-2">
                    <Avatar className="h-12 w-12 border-2 border-white">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback>{profile?.full_name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{profile?.full_name || "Používateľ"}</p>
                      {video.description && (
                        <p className="text-sm opacity-90 mt-1">{video.description}</p>
                      )}
                    </div>
                    {video.user_id !== user?.id && (
                      <Button
                        size="sm"
                        variant={isFollowing ? "secondary" : "default"}
                        onClick={() => toggleFollow(video.user_id)}
                        className="rounded-full"
                      >
                        {isFollowing ? (
                          <UserMinus className="h-4 w-4" />
                        ) : (
                          <UserPlus className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="absolute right-4 bottom-20 flex flex-col gap-6">
                  <button
                    onClick={() => toggleLike(video.id)}
                    className="flex flex-col items-center gap-1 text-white transition-transform hover:scale-110"
                  >
                    <div className={`p-3 rounded-full bg-black/30 backdrop-blur-sm transition-all ${isLiked ? 'scale-110' : ''}`}>
                      <Heart
                        className={`h-7 w-7 transition-all ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
                      />
                    </div>
                    <span className="text-sm font-semibold">{video.likes_count}</span>
                  </button>

                  <button className="flex flex-col items-center gap-1 text-white transition-transform hover:scale-110">
                    <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm">
                      <MessageCircle className="h-7 w-7" />
                    </div>
                    <span className="text-sm font-semibold">{video.comments_count}</span>
                  </button>

                  <button className="flex flex-col items-center gap-1 text-white transition-transform hover:scale-110">
                    <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm">
                      <Share2 className="h-7 w-7" />
                    </div>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TikTok;
