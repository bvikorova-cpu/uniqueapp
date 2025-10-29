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
  Smile,
  Maximize2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const { toast } = useToast();

  const reactions = {
    positive: [
      { type: "heart", emoji: "❤️", label: "Love" },
      { type: "fire", emoji: "🔥", label: "Fire" },
      { type: "adore", emoji: "🥰", label: "Adore" },
      { type: "heart-eyes", emoji: "😍", label: "Heart Eyes" },
      { type: "hug", emoji: "🤗", label: "Hug" },
      { type: "hundred", emoji: "💯", label: "Perfect" },
      { type: "praise", emoji: "🙌", label: "Praise" },
      { type: "strong", emoji: "💪", label: "Strong" },
      { type: "pink-heart", emoji: "💖", label: "Support" },
      { type: "star", emoji: "🌟", label: "Amazing" },
      { type: "trophy", emoji: "🏆", label: "Winner" },
      { type: "clap", emoji: "👏", label: "Clap" },
      { type: "party", emoji: "🎉", label: "Party" },
      { type: "sparkle", emoji: "✨", label: "Sparkle" },
    ],
    funny: [
      { type: "laugh", emoji: "😂", label: "Laugh" },
      { type: "rolling", emoji: "🤣", label: "Rolling" },
      { type: "cool", emoji: "😎", label: "Cool" },
      { type: "crazy", emoji: "🤪", label: "Crazy" },
      { type: "upside", emoji: "🙃", label: "Sarcastic" },
      { type: "thinking", emoji: "🤔", label: "Hmm" },
      { type: "mind-blown", emoji: "🤯", label: "Mind Blown" },
      { type: "dead", emoji: "💀", label: "Dead" },
      { type: "eyes", emoji: "👀", label: "Looking" },
      { type: "salute", emoji: "🫡", label: "Respect" },
    ],
    negative: [
      { type: "sad", emoji: "😢", label: "Sad" },
      { type: "angry", emoji: "😡", label: "Angry" },
      { type: "awkward", emoji: "😬", label: "Awkward" },
      { type: "raised-brow", emoji: "🤨", label: "Sus" },
      { type: "unimpressed", emoji: "😒", label: "Unimpressed" },
      { type: "eye-roll", emoji: "🙄", label: "Eye Roll" },
      { type: "shocked", emoji: "😱", label: "Shocked" },
      { type: "worried", emoji: "😰", label: "Worried" },
      { type: "broken-heart", emoji: "💔", label: "Broken Heart" },
      { type: "thumbsdown", emoji: "👎", label: "Dislike" },
    ],
    special: [
      { type: "wow", emoji: "😮", label: "Wow" },
      { type: "thumbsup", emoji: "👍", label: "Like" },
      { type: "pray", emoji: "🙏", label: "Thank You" },
      { type: "handshake", emoji: "🤝", label: "Deal" },
      { type: "birthday", emoji: "🎂", label: "Birthday" },
      { type: "coffee", emoji: "☕", label: "Coffee" },
      { type: "pizza", emoji: "🍕", label: "Food" },
      { type: "book", emoji: "📚", label: "Educational" },
      { type: "idea", emoji: "💡", label: "Idea" },
      { type: "rocket", emoji: "🚀", label: "Launch" },
      { type: "target", emoji: "🎯", label: "Goal" },
    ],
  };

  const allReactions = [
    ...reactions.positive,
    ...reactions.funny,
    ...reactions.negative,
    ...reactions.special,
  ];

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      const { data: commentsData, error } = await supabase
        .from("post_comments")
        .select("*")
        .eq("post_id", post.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      const commentsWithProfiles = await Promise.all(
        (commentsData || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .eq("id", comment.user_id)
            .single();
          
          return {
            ...comment,
            profiles: profile || { id: comment.user_id, full_name: null, avatar_url: null }
          };
        })
      );

      setComments(commentsWithProfiles);
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

  const toggleComments = (e: React.MouseEvent) => {
    e.stopPropagation();
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
            <div className="relative overflow-hidden group/image cursor-pointer"
                 onClick={(e) => {
                   e.stopPropagation();
                   if (post.media[0].file_type === "image") {
                     setSelectedImage(post.media[0].file_url);
                     setShowImageModal(true);
                   }
                 }}>
              {post.media[0].file_type === "image" ? (
                <>
                  <img
                    src={post.media[0].file_url}
                    alt="Post media"
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                    <Maximize2 className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>
                </>
              ) : (
                <video
                  src={post.media[0].file_url}
                  controls
                  className="w-full h-auto"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1">
              {post.media.slice(0, 4).map((media, idx) => (
                <div key={media.id} className="relative overflow-hidden aspect-square group/image cursor-pointer"
                     onClick={(e) => {
                       e.stopPropagation();
                       if (media.file_type === "image") {
                         setSelectedImage(media.file_url);
                         setShowImageModal(true);
                       }
                     }}>
                  {media.file_type === "image" ? (
                    <>
                      <img
                        src={media.file_url}
                        alt={`Post media ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                        <Maximize2 className="h-6 w-6 text-white drop-shadow-lg" />
                      </div>
                    </>
                  ) : (
                    <video
                      src={media.file_url}
                      className="w-full h-full object-cover"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  {idx === 3 && post.media.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
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
                  <span className="text-sm">{allReactions.find(r => r.type === selectedReaction)?.emoji}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-3" onClick={(e) => e.stopPropagation()}>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-3">
                  <TabsTrigger value="all" className="text-xs">
                    <span className="hidden sm:inline">Všetky</span>
                    <span className="sm:hidden">📱</span>
                  </TabsTrigger>
                  <TabsTrigger value="positive" className="text-xs">
                    <span className="hidden sm:inline">😊</span>
                    <span className="sm:hidden">😊</span>
                  </TabsTrigger>
                  <TabsTrigger value="funny" className="text-xs">
                    <span className="hidden sm:inline">😂</span>
                    <span className="sm:hidden">😂</span>
                  </TabsTrigger>
                  <TabsTrigger value="negative" className="text-xs">
                    <span className="hidden sm:inline">😢</span>
                    <span className="sm:hidden">😢</span>
                  </TabsTrigger>
                  <TabsTrigger value="special" className="text-xs">
                    <span className="hidden sm:inline">⚡</span>
                    <span className="sm:hidden">⚡</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-0">
                  <div className="grid grid-cols-7 gap-1 max-h-[200px] overflow-y-auto">
                    {allReactions.map((reaction) => (
                      <Button
                        key={reaction.type}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReaction(reaction.type)}
                        className={`text-xl p-2 hover:scale-125 transition-all ${
                          selectedReaction === reaction.type ? "bg-accent scale-110 ring-2 ring-primary" : ""
                        }`}
                        title={reaction.label}
                      >
                        {reaction.emoji}
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="positive" className="mt-0">
                  <div className="grid grid-cols-7 gap-1">
                    {reactions.positive.map((reaction) => (
                      <Button
                        key={reaction.type}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReaction(reaction.type)}
                        className={`text-xl p-2 hover:scale-125 transition-all ${
                          selectedReaction === reaction.type ? "bg-accent scale-110 ring-2 ring-primary" : ""
                        }`}
                        title={reaction.label}
                      >
                        {reaction.emoji}
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="funny" className="mt-0">
                  <div className="grid grid-cols-7 gap-1">
                    {reactions.funny.map((reaction) => (
                      <Button
                        key={reaction.type}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReaction(reaction.type)}
                        className={`text-xl p-2 hover:scale-125 transition-all ${
                          selectedReaction === reaction.type ? "bg-accent scale-110 ring-2 ring-primary" : ""
                        }`}
                        title={reaction.label}
                      >
                        {reaction.emoji}
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="negative" className="mt-0">
                  <div className="grid grid-cols-7 gap-1">
                    {reactions.negative.map((reaction) => (
                      <Button
                        key={reaction.type}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReaction(reaction.type)}
                        className={`text-xl p-2 hover:scale-125 transition-all ${
                          selectedReaction === reaction.type ? "bg-accent scale-110 ring-2 ring-primary" : ""
                        }`}
                        title={reaction.label}
                      >
                        {reaction.emoji}
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="special" className="mt-0">
                  <div className="grid grid-cols-7 gap-1">
                    {reactions.special.map((reaction) => (
                      <Button
                        key={reaction.type}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReaction(reaction.type)}
                        className={`text-xl p-2 hover:scale-125 transition-all ${
                          selectedReaction === reaction.type ? "bg-accent scale-110 ring-2 ring-primary" : ""
                        }`}
                        title={reaction.label}
                      >
                        {reaction.emoji}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {showComments && (
        <div className="p-4 pt-0 space-y-3 animate-accordion-down" onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px] text-sm"
            />
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                handleComment();
              }} 
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

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <DialogHeader className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
            <DialogTitle className="text-white">Image Preview</DialogTitle>
          </DialogHeader>
          <img
            src={selectedImage}
            alt="Full size"
            className="w-full h-auto max-h-[90vh] object-contain"
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PostCard;
