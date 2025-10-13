import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  Heart, 
  MessageCircle, 
  Share2, 
  Smile 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    likes_count: number;
    comments_count: number;
    shares_count: number;
    media: Array<{
      id: string;
      file_url: string;
      file_type: string;
    }>;
    profiles: {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  };
  onDelete: () => void;
}

const PostCard = ({ post, onDelete }: PostCardProps) => {
  const [deleting, setDeleting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const { toast } = useToast();

  const reactions = [
    { type: "heart", emoji: "❤️", label: "Love" },
    { type: "fire", emoji: "🔥", label: "Fire" },
    { type: "laugh", emoji: "😂", label: "Laugh" },
    { type: "wow", emoji: "😮", label: "Wow" },
    { type: "sad", emoji: "😢", label: "Sad" },
    { type: "angry", emoji: "😡", label: "Angry" },
    { type: "thumbsup", emoji: "👍", label: "Like" },
    { type: "clap", emoji: "👏", label: "Clap" },
    { type: "party", emoji: "🎉", label: "Party" },
    { type: "sparkle", emoji: "✨", label: "Sparkle" },
  ];

  const handleDelete = async () => {
    if (!confirm("Do you really want to delete this post?")) return;

    setDeleting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.id !== post.user_id) {
        toast({
          title: "Cannot delete",
          description: "You can only delete your own posts",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("posts").delete().eq("id", post.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post was deleted",
      });

      onDelete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleLike = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (liked) {
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);
        setLiked(false);
        setLikesCount((prev) => prev - 1);
      } else {
        await supabase
          .from("post_likes")
          .insert({ post_id: post.id, user_id: user.id });
        setLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReaction = async (reactionType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (selectedReaction === reactionType) {
        await supabase
          .from("post_reactions")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id)
          .eq("reaction_type", reactionType);
        setSelectedReaction(null);
      } else {
        if (selectedReaction) {
          await supabase
            .from("post_reactions")
            .delete()
            .eq("post_id", post.id)
            .eq("user_id", user.id);
        }
        await supabase
          .from("post_reactions")
          .insert({ post_id: post.id, user_id: user.id, reaction_type: reactionType });
        setSelectedReaction(reactionType);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from("post_comments")
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq("post_id", post.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingComments(false);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("post_comments")
        .insert({ post_id: post.id, user_id: user.id, content: newComment });

      if (error) throw error;

      setNewComment("");
      setCommentsCount((prev) => prev + 1);
      fetchComments();

      toast({
        title: "Success",
        description: "Comment was added",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Post",
          text: post.content || "",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Success",
          description: "Link was copied",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      fetchComments();
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <Avatar>
          <AvatarImage src={post.profiles?.avatar_url || undefined} />
          <AvatarFallback>
            {post.profiles?.full_name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{post.profiles?.full_name || "User"}</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: enUS,
                })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>

      {post.content && (
        <p className="text-foreground mb-4 whitespace-pre-wrap">{post.content}</p>
      )}

      {post.media && post.media.length > 0 && (
        <div className="grid grid-cols-1 gap-2 mb-4">
          {post.media.map((media) => (
            <div
              key={media.id}
              className="rounded-lg overflow-hidden bg-secondary"
            >
              {media.file_type === "image" ? (
                <img
                  src={media.file_url}
                  alt="Post media"
                  className="w-full h-auto"
                />
              ) : (
                <video
                  src={media.file_url}
                  controls
                  className="w-full h-auto"
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-6 pt-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className="gap-2"
        >
          <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
          <span>{likesCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleComments}
          className="gap-2"
        >
          <MessageCircle className="h-5 w-5" />
          <span>{commentsCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="gap-2"
        >
          <Share2 className="h-5 w-5" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Smile className="h-5 w-5" />
              {selectedReaction && <span>{reactions.find(r => r.type === selectedReaction)?.emoji}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-5 gap-2">
              {reactions.map((reaction) => (
                <Button
                  key={reaction.type}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction(reaction.type)}
                  className={`text-2xl p-2 ${
                    selectedReaction === reaction.type ? "bg-accent" : ""
                  }`}
                  title={reaction.label}
                >
                  {reaction.emoji}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px]"
            />
            <Button onClick={handleComment} disabled={!newComment.trim()}>
              Send
            </Button>
          </div>

          <div className="space-y-3">
            {loadingComments ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      {comment.profiles?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">
                      {comment.profiles?.full_name || "User"}
                    </p>
                    <p className="text-sm">{comment.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: enUS,
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default PostCard;
