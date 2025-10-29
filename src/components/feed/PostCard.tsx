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

  // Get accent color based on content type
  const getAccentColor = () => {
    if (post.media && post.media.length > 0) {
      return post.media[0].file_type === "video" ? "border-l-blue-500" : "border-l-green-500";
    }
    return "border-l-purple-500";
  };

  return (
    <Card className={`overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 ${getAccentColor()}`}>
      {/* Media First - Pinterest Style */}
      {post.media && post.media.length > 0 && (
        <div className="relative overflow-hidden">
          {post.media.length === 1 ? (
            <div className="relative overflow-hidden">
              {post.media[0].file_type === "image" ? (
                <img
                  src={post.media[0].file_url}
                  alt="Post media"
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <video
                  src={post.media[0].file_url}
                  controls
                  className="w-full h-auto"
                />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1">
              {post.media.slice(0, 4).map((media, idx) => (
                <div key={media.id} className="relative overflow-hidden aspect-square">
                  {media.file_type === "image" ? (
                    <img
                      src={media.file_url}
                      alt={`Post media ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <video
                      src={media.file_url}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {idx === 3 && post.media.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">+{post.media.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Author Info */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-8 w-8 ring-2 ring-primary/10">
            <AvatarImage src={post.profiles?.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {post.profiles?.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{post.profiles?.full_name || "User"}</p>
            <p className="text-xs text-muted-foreground">
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
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>

        {/* Content */}
        {post.content && (
          <p className="text-sm text-foreground mb-3 leading-relaxed whitespace-pre-wrap line-clamp-6">
            {post.content}
          </p>
        )}

        {/* Interaction Buttons */}
        <div className="flex items-center gap-1 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className="gap-1.5 flex-1 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <Heart className={`h-4 w-4 transition-all ${liked ? "fill-red-500 text-red-500 scale-110" : ""}`} />
            <span className="text-xs font-medium">{likesCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleComments}
            className="gap-1.5 flex-1 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs font-medium">{commentsCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="gap-1.5 flex-1 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1.5 flex-1 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 transition-colors"
              >
                <Smile className="h-4 w-4" />
                {selectedReaction && (
                  <span className="text-sm">{reactions.find(r => r.type === selectedReaction)?.emoji}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="grid grid-cols-5 gap-1">
                {reactions.map((reaction) => (
                  <Button
                    key={reaction.type}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction(reaction.type)}
                    className={`text-xl p-1.5 hover:scale-125 transition-transform ${
                      selectedReaction === reaction.type ? "bg-accent scale-110" : ""
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
      </div>

      {showComments && (
        <div className="p-4 pt-0 space-y-3 animate-accordion-down">
          <div className="flex gap-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px] text-sm"
            />
            <Button 
              onClick={handleComment} 
              disabled={!newComment.trim()}
              size="sm"
              className="self-end"
            >
              Send
            </Button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {loadingComments ? (
              <p className="text-xs text-muted-foreground text-center py-2">Loading...</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 p-2 rounded-lg hover:bg-accent/5 transition-colors">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {comment.profiles?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">
                      {comment.profiles?.full_name || "User"}
                    </p>
                    <p className="text-xs text-foreground/90 mt-0.5">{comment.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
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
