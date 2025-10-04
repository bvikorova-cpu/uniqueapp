import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, MessageCircle, Share2, Upload, User, UserPlus, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Video {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  video_url: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  user_profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  is_liked: boolean;
  is_following: boolean;
}

const TikTok = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
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
    }
  }, [user]);

  useEffect(() => {
    // Play current video, pause others
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentVideoIndex) {
          video.play();
        } else {
          video.pause();
        }
      }
    });
  }, [currentVideoIndex]);

  const fetchVideos = async () => {
    const { data: videosData, error } = await supabase
      .from("videos")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error || !videosData) return;

    const videosWithDetails = await Promise.all(
      videosData.map(async (video) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", video.user_id)
          .single();

        const { data: likeData } = await supabase
          .from("video_likes")
          .select("id")
          .eq("video_id", video.id)
          .eq("user_id", user.id)
          .maybeSingle();

        const { data: followData } = await supabase
          .from("user_follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", video.user_id)
          .maybeSingle();

        return {
          ...video,
          user_profile: profile,
          is_liked: !!likeData,
          is_following: !!followData,
        };
      })
    );

    setVideos(videosWithDetails);
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const scrollPosition = container.scrollTop;
    const videoHeight = container.clientHeight;
    const newIndex = Math.round(scrollPosition / videoHeight);
    
    if (newIndex !== currentVideoIndex && newIndex >= 0 && newIndex < videos.length) {
      setCurrentVideoIndex(newIndex);
    }
  };

  const toggleLike = async (videoId: string) => {
    const video = videos.find((v) => v.id === videoId);
    if (!video) return;

    if (video.is_liked) {
      const { error } = await supabase
        .from("video_likes")
        .delete()
        .eq("video_id", videoId)
        .eq("user_id", user.id);

      if (!error) {
        setVideos((prev) =>
          prev.map((v) =>
            v.id === videoId ? { ...v, is_liked: false, likes_count: v.likes_count - 1 } : v
          )
        );
      }
    } else {
      const { error } = await supabase
        .from("video_likes")
        .insert({ video_id: videoId, user_id: user.id });

      if (!error) {
        setVideos((prev) =>
          prev.map((v) =>
            v.id === videoId ? { ...v, is_liked: true, likes_count: v.likes_count + 1 } : v
          )
        );
      }
    }
  };

  const toggleFollow = async (userId: string) => {
    const video = videos.find((v) => v.user_id === userId);
    if (!video) return;

    if (video.is_following) {
      const { error } = await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", userId);

      if (!error) {
        setVideos((prev) =>
          prev.map((v) => (v.user_id === userId ? { ...v, is_following: false } : v))
        );
      }
    } else {
      const { error } = await supabase
        .from("user_follows")
        .insert({ follower_id: user.id, following_id: userId });

      if (!error) {
        setVideos((prev) =>
          prev.map((v) => (v.user_id === userId ? { ...v, is_following: true } : v))
        );
      }
    }
  };

  const fetchComments = async (videoId: string) => {
    const { data: commentsData } = await supabase
      .from("video_comments")
      .select("*")
      .eq("video_id", videoId)
      .order("created_at", { ascending: false });

    if (commentsData) {
      const commentsWithProfiles = await Promise.all(
        commentsData.map(async (comment) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .eq("id", comment.user_id)
            .single();

          return { ...comment, user_profile: profile };
        })
      );

      setComments(commentsWithProfiles);
    }
  };

  const addComment = async (videoId: string) => {
    if (!newComment.trim()) return;

    const { error } = await supabase
      .from("video_comments")
      .insert({
        video_id: videoId,
        user_id: user.id,
        content: newComment.trim(),
      });

    if (error) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa pridať komentár",
        variant: "destructive",
      });
      return;
    }

    setNewComment("");
    fetchComments(videoId);
  };

  const handleUpload = async () => {
    if (!uploadFile || !user) return;

    setUploading(true);

    try {
      const fileExt = uploadFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(fileName, uploadFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("videos")
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from("videos")
        .insert({
          user_id: user.id,
          title: uploadTitle,
          description: uploadDescription,
          video_url: publicUrl,
        });

      if (insertError) throw insertError;

      toast({
        title: "Úspech",
        description: "Video bolo nahrané",
      });

      setUploadDialogOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      setUploadDescription("");
      fetchVideos();
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa nahrať video",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const currentVideo = videos[currentVideoIndex];

  return (
    <div className="fixed inset-0 bg-black pt-16">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
        style={{ scrollBehavior: "smooth" }}
      >
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="relative h-screen w-full snap-start flex items-center justify-center"
          >
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              src={video.video_url}
              className="w-full h-full object-contain"
              loop
              playsInline
            />

            <div className="absolute bottom-20 left-4 right-20 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-10 w-10 border-2 border-white">
                  <AvatarImage src={video.user_profile?.avatar_url || undefined} />
                  <AvatarFallback>{video.user_profile?.full_name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <span className="font-bold">{video.user_profile?.full_name || "Používateľ"}</span>
                {video.user_id !== user?.id && (
                  <Button
                    size="sm"
                    variant={video.is_following ? "secondary" : "default"}
                    onClick={() => toggleFollow(video.user_id)}
                    className="ml-2"
                  >
                    {video.is_following ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  </Button>
                )}
              </div>
              {video.title && <p className="font-semibold mb-1">{video.title}</p>}
              {video.description && <p className="text-sm">{video.description}</p>}
            </div>

            <div className="absolute right-4 bottom-20 flex flex-col gap-4">
              <button
                onClick={() => toggleLike(video.id)}
                className="flex flex-col items-center text-white"
              >
                <Heart
                  className={`h-8 w-8 ${video.is_liked ? "fill-red-500 text-red-500" : ""}`}
                />
                <span className="text-xs">{video.likes_count}</span>
              </button>

              <button
                onClick={() => {
                  setCommentsDialogOpen(true);
                  fetchComments(video.id);
                }}
                className="flex flex-col items-center text-white"
              >
                <MessageCircle className="h-8 w-8" />
                <span className="text-xs">{video.comments_count}</span>
              </button>

              <button className="flex flex-col items-center text-white">
                <Share2 className="h-8 w-8" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-24 right-4 h-14 w-14 rounded-full bg-primary shadow-lg z-50"
          >
            <Upload className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nahrať video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            />
            <Input
              placeholder="Názov videa"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
            />
            <Textarea
              placeholder="Popis videa"
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
            />
            <Button onClick={handleUpload} disabled={!uploadFile || uploading} className="w-full">
              {uploading ? "Nahrávam..." : "Nahrať"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={commentsDialogOpen} onOpenChange={setCommentsDialogOpen}>
        <DialogContent className="max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Komentáre</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 my-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user_profile?.avatar_url || undefined} />
                  <AvatarFallback>{comment.user_profile?.full_name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {comment.user_profile?.full_name || "Používateľ"}
                  </p>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Pridať komentár..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addComment(currentVideo?.id || "")}
            />
            <Button onClick={() => addComment(currentVideo?.id || "")} size="icon">
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default TikTok;
