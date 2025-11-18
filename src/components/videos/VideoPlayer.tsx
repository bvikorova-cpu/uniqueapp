import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Bookmark, Trash2, Eye, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VideoComments } from "./VideoComments";
import { VideoReactions } from "./VideoReactions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

interface VideoPlayerProps {
  video: Video;
  onDelete?: () => void;
  onUpdate?: () => void;
}

export function VideoPlayer({ video, onDelete, onUpdate }: VideoPlayerProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const [viewTracked, setViewTracked] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    checkUserInteractions();
  }, [video.id]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || viewTracked) return;

    const handlePlay = () => {
      trackView();
    };

    videoElement.addEventListener('play', handlePlay);
    return () => videoElement.removeEventListener('play', handlePlay);
  }, [viewTracked]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const checkUserInteractions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if liked
    const { data: likeData } = await supabase
      .from("video_likes")
      .select("id")
      .eq("video_id", video.id)
      .eq("user_id", user.id)
      .maybeSingle();
    setIsLiked(!!likeData);

    // Check if saved
    const { data: savedData } = await supabase
      .from("saved_videos")
      .select("id")
      .eq("video_id", video.id)
      .eq("user_id", user.id)
      .maybeSingle();
    setIsSaved(!!savedData);

    // Check if following
    const { data: followData } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", video.user_id)
      .maybeSingle();
    setIsFollowing(!!followData);
  };

  const trackView = async () => {
    if (viewTracked) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from("video_views").insert({
      video_id: video.id,
      user_id: user?.id || null,
    });
    
    setViewTracked(true);
    onUpdate?.();
  };

  const handleLike = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Please log in to like videos", variant: "destructive" });
      return;
    }

    if (isLiked) {
      await supabase
        .from("video_likes")
        .delete()
        .eq("video_id", video.id)
        .eq("user_id", user.id);
      setIsLiked(false);
      toast({ title: "Like removed" });
    } else {
      await supabase
        .from("video_likes")
        .insert({ video_id: video.id, user_id: user.id });
      setIsLiked(true);
      toast({ title: "Video liked!" });
    }
    onUpdate?.();
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Please log in to save videos", variant: "destructive" });
      return;
    }

    if (isSaved) {
      await supabase
        .from("saved_videos")
        .delete()
        .eq("video_id", video.id)
        .eq("user_id", user.id);
      setIsSaved(false);
      toast({ title: "Removed from saved" });
    } else {
      await supabase
        .from("saved_videos")
        .insert({ video_id: video.id, user_id: user.id });
      setIsSaved(true);
      toast({ title: "Video saved!" });
    }
  };

  const handleFollow = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Please log in to follow users", variant: "destructive" });
      return;
    }

    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", video.user_id);
      setIsFollowing(false);
      toast({ title: "Unfollowed" });
    } else {
      await supabase
        .from("follows")
        .insert({ follower_id: user.id, following_id: video.user_id });
      setIsFollowing(true);
      toast({ title: "Following!" });
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/videos/${video.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: video.title || "Check out this video",
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    const { error } = await supabase
      .from("videos")
      .delete()
      .eq("id", video.id);

    if (error) {
      toast({ title: "Error deleting video", variant: "destructive" });
    } else {
      toast({ title: "Video deleted successfully" });
      onDelete?.();
    }
  };

  const isOwnVideo = currentUser?.id === video.user_id;

  return (
    <div className="bg-card rounded-lg overflow-hidden border">
      {/* Video */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={video.video_url}
          className="w-full h-full object-contain"
          controls
          playsInline
        />
      </div>

      {/* Video Info */}
      <div className="p-4 space-y-4">
        {/* User Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={video.profiles.avatar_url || undefined} />
              <AvatarFallback>{video.profiles.username?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{video.profiles.full_name || video.profiles.username || "User"}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(video.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {!isOwnVideo && (
            <Button
              variant={isFollowing ? "outline" : "default"}
              size="sm"
              onClick={handleFollow}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>

        {/* Title */}
        {video.title && (
          <h3 className="font-semibold text-lg">{video.title}</h3>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {video.views_count}
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {video.likes_count}
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            {video.comments_count}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant={isLiked ? "default" : "outline"}
            size="sm"
            onClick={handleLike}
            className="flex-1"
          >
            <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
            {isLiked ? "Liked" : "Like"}
          </Button>

          <Dialog open={showComments} onOpenChange={setShowComments}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Comment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Comments</DialogTitle>
              </DialogHeader>
              <VideoComments videoId={video.id} onUpdate={onUpdate} />
            </DialogContent>
          </Dialog>

          <VideoReactions videoId={video.id} onUpdate={onUpdate} />

          <Button variant="outline" size="icon" onClick={handleSave}>
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          </Button>

          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>

          {isOwnVideo && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Video
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
