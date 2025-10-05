import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Trash2, Heart, MessageCircle, Share2, Smile, Flame, Laugh, AlertCircle, Frown, ThumbsUp, PartyPopper, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { sk } from "date-fns/locale";

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
      full_name: string;
      avatar_url: string;
    };
  };
  onDelete: () => void;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

interface Reaction {
  reaction_type: string;
  count: number;
  userReacted: boolean;
}

const reactionIcons = {
  heart: Heart,
  fire: Flame,
  laugh: Laugh,
  wow: AlertCircle,
  sad: Frown,
  angry: AlertCircle,
  thumbsup: ThumbsUp,
  clap: ThumbsUp,
  party: PartyPopper,
  sparkle: Sparkles,
};

const PostCard = ({ post, onDelete }: PostCardProps) => {
  const [deleting, setDeleting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    checkIfLiked();
    fetchReactions();
  }, [post.id]);

  const checkIfLiked = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .single();

    setLiked(!!data);
  };

  const fetchReactions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: reactionsData } = await supabase
      .from("post_reactions")
      .select("reaction_type, user_id")
      .eq("post_id", post.id);

    if (reactionsData) {
      const grouped = reactionsData.reduce((acc, r) => {
        if (!acc[r.reaction_type]) {
          acc[r.reaction_type] = { count: 0, userReacted: false };
        }
        acc[r.reaction_type].count++;
        if (user && r.user_id === user.id) {
          acc[r.reaction_type].userReacted = true;
        }
        return acc;
      }, {} as Record<string, { count: number; userReacted: boolean }>);

      setReactions(
        Object.entries(grouped).map(([type, data]) => ({
          reaction_type: type,
          count: data.count,
          userReacted: data.userReacted,
        }))
      );
    }
  };

  const handleLike = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Musíš byť prihlásený", variant: "destructive" });
      return;
    }

    try {
      if (liked) {
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);
        setLikesCount(prev => prev - 1);
        setLiked(false);
      } else {
        await supabase
          .from("post_likes")
          .insert({ post_id: post.id, user_id: user.id });
        setLikesCount(prev => prev + 1);
        setLiked(true);
      }
    } catch (error: any) {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    }
  };

  const handleReaction = async (reactionType: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Musíš byť prihlásený", variant: "destructive" });
      return;
    }

    try {
      const existing = reactions.find(r => r.reaction_type === reactionType);
      
      if (existing?.userReacted) {
        await supabase
          .from("post_reactions")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id)
          .eq("reaction_type", reactionType);
      } else {
        await supabase
          .from("post_reactions")
          .insert({ post_id: post.id, user_id: user.id, reaction_type: reactionType });
      }
      
      fetchReactions();
      setShowReactions(false);
    } catch (error: any) {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    }
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from("post_comments")
      .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq("post_id", post.id)
      .order("created_at", { ascending: false });

    if (data) setComments(data);
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Musíš byť prihlásený", variant: "destructive" });
      return;
    }

    try {
      await supabase
        .from("post_comments")
        .insert({ post_id: post.id, user_id: user.id, content: newComment });
      
      setNewComment("");
      setCommentsCount(prev => prev + 1);
      fetchComments();
      
      toast({ title: "Komentár pridaný" });
    } catch (error: any) {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/feed?post=${post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ url });
      } catch (error) {
        await navigator.clipboard.writeText(url);
        toast({ title: "Odkaz skopírovaný" });
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Odkaz skopírovaný" });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Naozaj chceš zmazať tento príspevok?")) return;

    setDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user?.id !== post.user_id) {
        toast({
          title: "Nie je možné zmazať",
          description: "Môžeš mazať len vlastné príspevky",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("posts").delete().eq("id", post.id);

      if (error) throw error;

      toast({
        title: "Úspech",
        description: "Príspevok bol zmazaný",
      });

      onDelete();
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <Avatar>
          <AvatarImage src={post.profiles?.avatar_url} />
          <AvatarFallback>{post.profiles?.full_name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{post.profiles?.full_name || "Používateľ"}</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: sk,
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

      <Separator className="my-4" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={liked ? "text-red-500" : ""}
          >
            <Heart className={`h-5 w-5 mr-1 ${liked ? "fill-current" : ""}`} />
            {likesCount}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowComments(!showComments);
              if (!showComments) fetchComments();
            }}
          >
            <MessageCircle className="h-5 w-5 mr-1" />
            {commentsCount}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="h-5 w-5 mr-1" />
            Zdieľať
          </Button>
        </div>
        
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReactions(!showReactions)}
          >
            <Smile className="h-5 w-5" />
          </Button>
          {showReactions && (
            <div className="absolute bottom-full right-0 mb-2 bg-card border rounded-lg shadow-lg p-2 flex gap-1">
              {Object.entries(reactionIcons).map(([type, Icon]) => (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction(type)}
                  className="h-8 w-8 p-0"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {reactions.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {reactions.map((reaction) => {
            const Icon = reactionIcons[reaction.reaction_type as keyof typeof reactionIcons];
            return (
              <div
                key={reaction.reaction_type}
                className={`flex items-center gap-1 px-2 py-1 rounded-full border text-sm ${
                  reaction.userReacted ? "bg-primary/10 border-primary" : "bg-secondary"
                }`}
              >
                <Icon className="h-3 w-3" />
                {reaction.count}
              </div>
            );
          })}
        </div>
      )}

      {showComments && (
        <div className="mt-4 space-y-4">
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Napíš komentár..."
              className="flex-1"
              rows={2}
            />
            <Button onClick={handleComment} disabled={!newComment.trim()}>
              Pridať
            </Button>
          </div>

          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.profiles?.avatar_url} />
                  <AvatarFallback>{comment.profiles?.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-secondary rounded-lg p-3">
                  <p className="font-semibold text-sm">{comment.profiles?.full_name || "Používateľ"}</p>
                  <p className="text-sm">{comment.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: sk,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default PostCard;
