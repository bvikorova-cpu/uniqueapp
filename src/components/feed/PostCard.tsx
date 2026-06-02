import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  Heart, 
  MessageCircle, 
  Share2, 
  Smile,
  Maximize2,
  Edit2,
  MoreVertical,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  Loader2,
  Bookmark,
  Flag,
  Pin,
  MapPin,
  Users
} from "lucide-react";
import { ReactionPicker } from "@/components/wall/ReactionPicker";
import { ReportDialog } from "@/components/wall/ReportDialog";
import { PinButton } from "@/components/wall/PinButton";
import { FollowButton } from "@/components/wall/FollowButton";
import { VerifiedFounderBadge, isVerifiedFounder } from "@/components/wall/VerifiedFounderBadge";
import { ProductCard } from "@/components/wall/ProductCard";
import { EnhancedCommentInput } from "./EnhancedCommentInput";
import { CommentItem } from "./CommentItem";
import { SensitiveOverlay } from "./SensitiveOverlay";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import type { Post } from "@/types/database";
import { getPostBackground } from "@/lib/postBackgrounds";

interface PostCardProps {
  post: Post;
  onDelete: () => void;
}

const MAX_POST_CONTENT = 5000;
const MAX_COMMENT_CONTENT = 1000;
const MAX_REPOST_COMMENT = 500;
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_FILES = 10;
const ALLOWED_IMG = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VID = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_EXT = new Set(["jpg","jpeg","png","webp","gif","mp4","webm","mov"]);


const PostCard = ({ post, onDelete }: PostCardProps) => {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [showComments, setShowComments] = useState(false);
  
  // Provide default values for optional fields
  const postMedia = post.media || [];
  const postProfiles = post.profiles || { id: post.user_id, full_name: "Unknown User", avatar_url: null };
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingMedia, setExistingMedia] = useState(post.media || []);
  const [mediaToDelete, setMediaToDelete] = useState<string[]>([]);
  const [showRepostDialog, setShowRepostDialog] = useState(false);
  const [repostComment, setRepostComment] = useState("");
  const [reposting, setReposting] = useState(false);
  const [repostsCount, setRepostsCount] = useState(post.reposts_count || 0);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  // Action locks against rapid double-clicks (React batching can let 2 clicks through `useState` flags)
  const likeLockRef = useRef(false);
  const saveLockRef = useRef(false);
  const reactionLockRef = useRef(false);
  const commentLockRef = useRef(false);
  const repostLockRef = useRef(false);
  const editLockRef = useRef(false);

  // Stable object URL previews for new-file edit grid, with revoke on unmount/change
  const newFilePreviews = useMemo(
    () => newFiles.map((f) => (f.type.startsWith("image/") ? URL.createObjectURL(f) : null)),
    [newFiles]
  );
  useEffect(() => {
    return () => { newFilePreviews.forEach((u) => u && URL.revokeObjectURL(u)); };
  }, [newFilePreviews]);

  // Get current user and check if post is saved
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        
        // Check if post is saved
        const { data } = await supabase
          .from("saved_posts")
          .select("id")
          .eq("user_id", user.id)
          .eq("post_id", post.id)
          .maybeSingle();
        
        setSaved(!!data);
      }
    };
    init();
  }, [post.id]);

  // Realtime sync for likes / comments / reposts counts on this post
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const refreshCounts = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        const { data } = await supabase
          .from("posts")
          .select("likes_count, comments_count, reposts_count")
          .eq("id", post.id)
          .maybeSingle();
        if (data) {
          setLikesCount(data.likes_count ?? 0);
          setCommentsCount(data.comments_count ?? 0);
          setRepostsCount(data.reposts_count ?? 0);
        }
      }, 400);
    };

    const channel = supabase
      .channel(`post-counts-${post.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "post_likes", filter: `post_id=eq.${post.id}` }, refreshCounts)
      .on("postgres_changes", { event: "*", schema: "public", table: "post_comments", filter: `post_id=eq.${post.id}` }, refreshCounts)
      .on("postgres_changes", { event: "*", schema: "public", table: "reposts", filter: `original_post_id=eq.${post.id}` }, refreshCounts)
      .subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [post.id]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);
    const accepted: File[] = [];
    for (const f of incoming) {
      const okType = ALLOWED_IMG.includes(f.type) || ALLOWED_VID.includes(f.type);
      const okSize = f.size <= MAX_FILE_BYTES;
      if (!okType || !okSize) {
        toast({
          title: "File rejected",
          description: `${f.name}: ${!okType ? "unsupported type" : "exceeds 25 MB"}`,
          variant: "destructive",
        });
        continue;
      }
      accepted.push(f);
    }
    setNewFiles((prev) => {
      const merged = [...prev, ...accepted];
      if (merged.length > MAX_FILES) {
        toast({ title: "Too many files", description: `Max ${MAX_FILES}`, variant: "destructive" });
        return merged.slice(0, MAX_FILES);
      }
      return merged;
    });
    e.target.value = "";
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingMedia = (mediaId: string) => {
    setMediaToDelete((prev) => [...prev, mediaId]);
    setExistingMedia((prev) => prev.filter((m) => m.id !== mediaId));
  };

  const handleUserClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    navigate(`/profile/${userId}`);
  };

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

  const handleEdit = async () => {
    if (editLockRef.current) return;
    const trimmed = editContent.trim();
    if (!trimmed && existingMedia.length === 0 && newFiles.length === 0) {
      toast({ title: "Error", description: "Post must contain text or images", variant: "destructive" });
      return;
    }
    if (trimmed.length > MAX_POST_CONTENT) {
      toast({ title: "Too long", description: `Max ${MAX_POST_CONTENT} chars`, variant: "destructive" });
      return;
    }
    editLockRef.current = true;
    setSaving(true);
    const uploadedPaths: string[] = [];
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You are not logged in");
      if (user.id !== post.user_id) throw new Error("You can only edit your own posts");

      const { error: updateError } = await supabase
        .from("posts")
        .update({ content: trimmed })
        .eq("id", post.id);
      if (updateError) throw updateError;

      // Delete marked media — derive bucket-relative path safely
      for (const mediaId of mediaToDelete) {
        const media = post.media.find((m) => m.id === mediaId);
        if (!media) continue;
        try {
          const marker = "/media/";
          const idx = media.file_url.indexOf(marker);
          const path = idx >= 0 ? media.file_url.slice(idx + marker.length) : null;
          if (path) await supabase.storage.from("media").remove([path]);
        } catch {}
        await supabase.from("media").delete().eq("id", mediaId);
      }

      // Upload new files with hardened path + whitelist
      for (const file of newFiles) {
        const ext = (file.name.split(".").pop() || "").toLowerCase();
        if (!ALLOWED_EXT.has(ext)) throw new Error(`Rejected extension: .${ext}`);
        if (!(ALLOWED_IMG.includes(file.type) || ALLOWED_VID.includes(file.type))) {
          throw new Error(`Rejected MIME: ${file.type}`);
        }
        if (file.size > MAX_FILE_BYTES) throw new Error(`${file.name} exceeds 25 MB`);

        const safeName = `${user.id}/${post.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
        const fileType = ALLOWED_IMG.includes(file.type) ? "image" : "video";

        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(safeName, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;
        uploadedPaths.push(safeName);

        const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(safeName);
        const { error: mediaError } = await supabase.from("media").insert({
          post_id: post.id,
          file_url: publicUrl,
          file_type: fileType,
          file_name: file.name,
        });
        if (mediaError) throw mediaError;
      }

      toast({ title: "Success", description: "Post was updated" });
      setShowEditDialog(false);
      setNewFiles([]);
      setMediaToDelete([]);
      onDelete();
    } catch (error: any) {
      if (uploadedPaths.length) {
        try { await supabase.storage.from("media").remove(uploadedPaths); } catch {}
      }
      toast({ title: "Error", description: error?.message ?? "Edit failed", variant: "destructive" });
    } finally {
      editLockRef.current = false;
      setSaving(false);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (likeLockRef.current) return;
    likeLockRef.current = true;
    const wasLiked = liked;
    // Optimistic update
    setLiked(!wasLiked);
    setLikesCount((prev) => prev + (wasLiked ? -1 : 1));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = wasLiked
        ? await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user.id)
        : await supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id });
      if (error) throw error;
    } catch (error: any) {
      // Rollback
      setLiked(wasLiked);
      setLikesCount((prev) => prev + (wasLiked ? 1 : -1));
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      likeLockRef.current = false;
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saveLockRef.current) return;
    saveLockRef.current = true;
    const wasSaved = saved;
    setSaved(!wasSaved); // Optimistic
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSaved(wasSaved);
        toast({ title: "Login required", description: "Please login to save posts", variant: "destructive" });
        return;
      }
      const { error } = wasSaved
        ? await supabase.from("saved_posts").delete().eq("post_id", post.id).eq("user_id", user.id)
        : await supabase.from("saved_posts").insert({ post_id: post.id, user_id: user.id });
      if (error) throw error;
      toast({
        title: wasSaved ? "Removed" : "Saved",
        description: wasSaved ? "Post removed from bookmarks" : "Post saved to bookmarks",
      });
    } catch (error: any) {
      setSaved(wasSaved); // Rollback
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      saveLockRef.current = false;
    }
  };

  const handleReaction = async (reactionType: string) => {
    if (reactionLockRef.current) return;
    reactionLockRef.current = true;
    const prevReaction = selectedReaction;
    const next = prevReaction === reactionType ? null : reactionType;
    setSelectedReaction(next); // Optimistic
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      // Always wipe existing reaction (single-row-per-user pattern) then insert new
      await supabase.from("post_reactions")
        .delete().eq("post_id", post.id).eq("user_id", user.id);
      if (next) {
        const { error } = await supabase.from("post_reactions")
          .insert({ post_id: post.id, user_id: user.id, reaction_type: next });
        if (error) throw error;
      }
    } catch (error: any) {
      setSelectedReaction(prevReaction); // Rollback
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      reactionLockRef.current = false;
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

      const commentUserIds = Array.from(new Set((commentsData || []).map((c: any) => c.user_id)));
      const { data: profilesBatch } = commentUserIds.length
        ? await supabase.rpc("get_profiles_basic", { _ids: commentUserIds })
        : { data: [] as any[] };
      const profMap = new Map((profilesBatch || []).map((p: any) => [p.id, p]));
      const commentsWithProfiles = (commentsData || []).map((comment: any) => ({
        ...comment,
        profiles: profMap.get(comment.user_id) || { id: comment.user_id, full_name: null, avatar_url: null },
      }));

      setComments(commentsWithProfiles);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoadingComments(false);
    }
  };

  const handleComment = async () => {
    if (commentLockRef.current) return;
    const trimmed = newComment.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_COMMENT_CONTENT) {
      toast({ title: "Too long", description: `Max ${MAX_COMMENT_CONTENT} chars`, variant: "destructive" });
      return;
    }
    commentLockRef.current = true;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("post_comments")
        .insert({ post_id: post.id, user_id: user.id, content: trimmed });
      if (error) throw error;

      setNewComment("");
      setCommentsCount((prev) => prev + 1);
      fetchComments();
      toast({ title: "Success", description: "Comment was added" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      commentLockRef.current = false;
    }
  };

  const handleRepost = async () => {
    if (repostLockRef.current) return;
    const trimmed = repostComment.trim();
    if (!trimmed) {
      toast({ title: "Error", description: "Add a comment to the repost", variant: "destructive" });
      return;
    }
    if (trimmed.length > MAX_REPOST_COMMENT) {
      toast({ title: "Too long", description: `Max ${MAX_REPOST_COMMENT} chars`, variant: "destructive" });
      return;
    }
    repostLockRef.current = true;
    setReposting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Error", description: "You must be logged in", variant: "destructive" });
        return;
      }
      if (user.id === post.user_id) {
        toast({ title: "Error", description: "You can't repost your own post", variant: "destructive" });
        return;
      }

      const { error } = await supabase.from("reposts").insert({
        user_id: user.id,
        original_post_id: post.id,
        comment: trimmed,
      });
      if (error) throw error;

      toast({ title: "Success", description: "Post was shared to your profile" });
      setShowRepostDialog(false);
      setRepostComment("");
      setRepostsCount((prev) => prev + 1);
      onDelete();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      repostLockRef.current = false;
      setReposting(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRepostDialog(true);
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
    <div 
      className={`glass-post-card overflow-hidden group hover:scale-[1.01] transition-all duration-500 border-l-4 ${getAccentColor()} cursor-pointer`}
      onClick={() => navigate(`/post/${post.id}`)}
    >
      {/* Media First - Pinterest Style (with sensitive blur + carousel for multi-image) */}
      {post.media && post.media.length > 0 && (
        <SensitiveOverlay isSensitive={post.is_sensitive} reason={post.sensitive_reason}>
          <div className="relative overflow-hidden">
            {post.media.length === 1 ? (
              <div className="relative overflow-hidden group/image cursor-pointer"
                   onClick={(e) => {
                     e.stopPropagation();
                     if (post.media![0].file_type === "image") {
                       setSelectedImage(post.media![0].file_url);
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
              <Carousel
                className="w-full"
                opts={{ loop: false, align: "start" }}
                onClick={(e) => e.stopPropagation()}
              >
                <CarouselContent>
                  {post.media.map((media, idx) => (
                    <CarouselItem key={media.id} className="basis-full">
                      <div
                        className="relative overflow-hidden bg-black aspect-square cursor-pointer group/image"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (media.file_type === "image") {
                            setSelectedImage(media.file_url);
                            setShowImageModal(true);
                          }
                        }}
                      >
                        {media.file_type === "image" ? (
                          <>
                            <img
                              src={media.file_url}
                              alt={`Post media ${idx + 1}`}
                              className="w-full h-full object-contain transition-transform duration-500 group-hover/image:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                              <Maximize2 className="h-6 w-6 text-white drop-shadow-lg" />
                            </div>
                          </>
                        ) : (
                          <video
                            src={media.file_url}
                            controls
                            className="w-full h-full object-contain"
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                          {idx + 1}/{post.media!.length}
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" onClick={(e) => e.stopPropagation()} />
                <CarouselNext className="right-2" onClick={(e) => e.stopPropagation()} />
              </Carousel>
            )}
          </div>
        </SensitiveOverlay>
      )}

      <div className="p-6 space-y-4">
        {/* Author Info */}
        <div className="flex items-center gap-3">
          <Avatar 
            className="h-10 w-10 ring-2 ring-primary/10 cursor-pointer hover:ring-primary/30 transition-all"
            onClick={(e) => handleUserClick(e, post.user_id)}
          >
            <AvatarImage src={post.profiles?.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {post.profiles?.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p 
                className="font-semibold text-base truncate cursor-pointer hover:underline" 
                onClick={(e) => handleUserClick(e, post.user_id)}
              >
                {post.profiles?.full_name || "User"}
              </p>
              <VerifiedFounderBadge 
                userName={post.profiles?.full_name || ""} 
                size="sm"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: enUS,
                })}
              </span>
              {post.feeling && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    {post.feeling}
                  </span>
                </>
              )}
              {post.location && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    📍 {post.location}
                  </span>
                </>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-60 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {currentUserId === post.user_id ? (
                <>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEditDialog(true);
                    }}
                    className="gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={deleting}
                    className="gap-2 text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              ) : (
                <ReportDialog
                  postId={post.id}
                  trigger={
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                    >
                      <Flag className="h-4 w-4" />
                      Report post
                    </DropdownMenuItem>
                  }
                />
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        {post.content && (() => {
          const bg = (post as any).background_style && (!post.media || post.media.length === 0)
            ? getPostBackground((post as any).background_style)
            : null;
          return bg ? (
            <div className={`rounded-xl p-8 mb-4 min-h-[220px] flex items-center justify-center ${bg.className}`}>
              <p className={`whitespace-pre-wrap break-words ${bg.textClassName}`}>
                {post.content}
              </p>
            </div>
          ) : (
            <p className="text-base text-foreground mb-4 leading-relaxed whitespace-pre-wrap line-clamp-6">
              {post.content}
            </p>
          );
        })()}


        {/* Interaction Buttons */}
        <div className="flex items-center gap-2 pt-4 border-t">
          <div onClick={(e) => e.stopPropagation()}>
            <ReactionPicker postId={post.id} />
          </div>

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
            onClick={(e) => {
              e.stopPropagation();
              handleShare(e);
            }}
            className="gap-1.5 flex-1 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span className="text-xs font-medium">{repostsCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="gap-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors"
            title={saved ? "Remove from bookmarks" : "Save to bookmarks"}
          >
            <Bookmark className={`h-4 w-4 transition-all ${saved ? "fill-purple-500 text-purple-500" : ""}`} />
          </Button>
        </div>

        {/* Additional Actions */}
        <div className="flex items-center gap-2 pt-2 border-t mt-2">
          {currentUserId !== post.user_id && (
            <>
              <FollowButton userId={post.user_id} variant="ghost" size="sm" />
              <ReportDialog postId={post.id} variant="ghost" />
            </>
          )}
          {currentUserId === post.user_id && (
            <PinButton postId={post.id} userId={post.user_id} />
          )}
        </div>
      </div>

      {showComments && (
        <div className="p-4 pt-0 space-y-3 animate-accordion-down" onClick={(e) => e.stopPropagation()}>
          <EnhancedCommentInput 
            postId={post.id} 
            onCommentAdded={() => {
              setCommentsCount((prev) => prev + 1);
              fetchComments();
            }} 
          />

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {loadingComments ? (
              <p className="text-xs text-muted-foreground text-center py-2">Loading...</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">No comments yet</p>
            ) : (
              comments
                .filter((comment) => !comment.parent_comment_id)
                .map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    postId={post.id}
                    onImageClick={(url) => {
                      setSelectedImage(url);
                      setShowImageModal(true);
                    }}
                    onReplyAdded={() => {
                      setCommentsCount((prev) => prev + 1);
                      fetchComments();
                    }}
                    replies={comments}
                  />
                ))
            )}
          </div>
        </div>
      )}

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-0" onClick={(e) => e.stopPropagation()}>
          <img
            src={selectedImage}
            alt="Full size"
            className="w-full h-auto max-h-[90vh] object-contain"
          />
        </DialogContent>
      </Dialog>

      {/* Repost Dialog */}
      <Dialog open={showRepostDialog} onOpenChange={setShowRepostDialog}>
        <DialogContent className="sm:max-w-[525px]" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Share Post</DialogTitle>
            <DialogDescription>
              Add your comment to this post
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={repostComment}
              onChange={(e) => setRepostComment(e.target.value.slice(0, MAX_REPOST_COMMENT))}
              maxLength={MAX_REPOST_COMMENT}
              placeholder="What do you think?"
              className="min-h-[100px]"
            />
            <div className="text-xs text-muted-foreground text-right">{repostComment.length} / {MAX_REPOST_COMMENT}</div>
            
            {/* Preview of original post */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {post.profiles?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">
                    {post.profiles?.full_name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), {
                      addSuffix: true,
                      locale: enUS,
                    })}
                  </p>
                </div>
              </div>
              {post.content && (
                <p className="text-sm line-clamp-3">{post.content}</p>
              )}
              {post.media && post.media.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  📷 {post.media.length} {post.media.length === 1 ? "image" : "images"}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRepostDialog(false);
                setRepostComment("");
              }}
              disabled={reposting}
            >
              Cancel
            </Button>
            <Button onClick={handleRepost} disabled={reposting || !repostComment.trim()}>
              {reposting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                "Share"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        setShowEditDialog(open);
        if (!open) {
          setEditContent(post.content);
          setNewFiles([]);
          setExistingMedia(post.media || []);
          setMediaToDelete([]);
        }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Edit the text or images of your post
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value.slice(0, MAX_POST_CONTENT))}
              maxLength={MAX_POST_CONTENT}
              placeholder="What's on your mind?"
              className="min-h-[100px]"
            />
            <div className="text-xs text-muted-foreground text-right">{editContent.length} / {MAX_POST_CONTENT}</div>

            {/* Existing Media */}
            {existingMedia.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Existing images:</p>
                <div className="grid grid-cols-2 gap-2">
                  {existingMedia.map((media) => (
                    <div key={media.id} className="relative">
                      <div className="aspect-video bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
                        {media.file_type === "image" ? (
                          <img
                            src={media.file_url}
                            alt="Media"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <VideoIcon className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => removeExistingMedia(media.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Files */}
            {newFiles.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">New images:</p>
                <div className="grid grid-cols-2 gap-2">
                  {newFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <div className="aspect-video bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
                        {file.type.startsWith("image/") && newFilePreviews[index] ? (
                          <img
                            src={newFilePreviews[index]!}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <VideoIcon className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => removeNewFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("edit-image-upload")?.click()}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Add images
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("edit-video-upload")?.click()}
              >
                <VideoIcon className="h-4 w-4 mr-2" />
                Add video
              </Button>
              <input
                id="edit-image-upload"
                type="file"
                accept={ALLOWED_IMG.join(",")}
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <input
                id="edit-video-upload"
                type="file"
                accept={ALLOWED_VID.join(",")}
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* (duplicate image modal removed — single modal at top of card) */}

      {/* Report Dialog */}
      {/* Report functionality handled via dropdown menu */}
    </div>
  );
};

export default PostCard;
