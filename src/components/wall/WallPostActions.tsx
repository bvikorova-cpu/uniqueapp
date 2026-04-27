import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface WallPostActionsProps {
  postId: string;
  initialLikesCount?: number;
  initialCommentsCount?: number;
  initialRepostsCount?: number;
  variant?: "compact" | "labeled";
}

interface CommentRow {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile?: { full_name: string | null; avatar_url: string | null } | null;
}

/**
 * Reusable post action bar (Like / Comment / Share) backed by real Supabase
 * tables: post_likes, post_comments, reposts. Used by GroupDetail and
 * PageDetail to replace previous "Coming soon" placeholders.
 */
export function WallPostActions({
  postId,
  initialLikesCount = 0,
  initialCommentsCount = 0,
  initialRepostsCount = 0,
  variant = "labeled",
}: WallPostActionsProps) {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
  const [repostsCount, setRepostsCount] = useState(initialRepostsCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [repostComment, setRepostComment] = useState("");
  const [reposting, setReposting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        const { data: existing } = await supabase
          .from("post_likes")
          .select("id")
          .eq("post_id", postId)
          .eq("user_id", uid)
          .maybeSingle();
        if (mounted) setLiked(!!existing);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [postId]);

  const requireAuth = () => {
    if (!userId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to interact with posts.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireAuth()) return;
    const next = !liked;
    setLiked(next);
    setLikesCount((c) => c + (next ? 1 : -1));
    try {
      if (next) {
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: userId! });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId!);
        if (error) throw error;
      }
    } catch (err: any) {
      // revert on failure
      setLiked(!next);
      setLikesCount((c) => c + (next ? -1 : 1));
      toast({
        title: "Error",
        description: err.message ?? "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from("post_comments")
        .select("id, content, created_at, user_id")
        .eq("post_id", postId)
        .order("created_at", { ascending: true })
        .limit(50);
      if (error) throw error;

      const userIds = Array.from(new Set((data ?? []).map((c) => c.user_id)));
      let profilesMap = new Map<
        string,
        { full_name: string | null; avatar_url: string | null }
      >();
      if (userIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);
        profilesMap = new Map(
          (profs ?? []).map((p) => [
            p.id,
            { full_name: p.full_name, avatar_url: p.avatar_url },
          ]),
        );
      }
      const enriched: CommentRow[] = (data ?? []).map((c) => ({
        ...c,
        profile: profilesMap.get(c.user_id) ?? null,
      }));
      setComments(enriched);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message ?? "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setLoadingComments(false);
    }
  };

  const toggleComments = () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments.length === 0) {
      fetchComments();
    }
  };

  const submitComment = async () => {
    if (!requireAuth()) return;
    const content = newComment.trim();
    if (!content) return;
    setSubmittingComment(true);
    try {
      const { error } = await supabase
        .from("post_comments")
        .insert({ post_id: postId, user_id: userId!, content });
      if (error) throw error;
      setNewComment("");
      setCommentsCount((c) => c + 1);
      await fetchComments();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message ?? "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const submitRepost = async () => {
    if (!requireAuth()) return;
    const comment = repostComment.trim();
    if (!comment) {
      toast({
        title: "Comment required",
        description: "Add a short comment to share this post.",
        variant: "destructive",
      });
      return;
    }
    setReposting(true);
    try {
      const { error } = await supabase.from("reposts").insert({
        user_id: userId!,
        original_post_id: postId,
        comment,
      });
      if (error) throw error;
      setRepostsCount((c) => c + 1);
      setShowShareDialog(false);
      setRepostComment("");
      toast({
        title: "Shared",
        description: "Post was shared to your profile.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message ?? "Failed to share post",
        variant: "destructive",
      });
    } finally {
      setReposting(false);
    }
  };

  const labeled = variant === "labeled";

  return (
    <>
      <div className="flex items-center gap-4 mt-4 pt-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          className={labeled ? "flex-1" : ""}
          onClick={handleLike}
        >
          <Heart
            className={`h-4 w-4 mr-1 ${liked ? "fill-red-500 text-red-500" : ""}`}
          />
          {labeled ? "Like" : likesCount}
          {labeled && likesCount > 0 ? ` (${likesCount})` : ""}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={labeled ? "flex-1" : ""}
          onClick={toggleComments}
        >
          <MessageCircle className="h-4 w-4 mr-1" />
          {labeled ? "Comment" : commentsCount}
          {labeled && commentsCount > 0 ? ` (${commentsCount})` : ""}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={labeled ? "flex-1" : ""}
          onClick={() => {
            if (!requireAuth()) return;
            setShowShareDialog(true);
          }}
        >
          <Share2 className="h-4 w-4 mr-1" />
          {labeled ? "Share" : repostsCount}
          {labeled && repostsCount > 0 ? ` (${repostsCount})` : ""}
        </Button>
      </div>

      {showComments && (
        <div className="mt-3 space-y-3 pl-2 border-l-2 border-border/40">
          {loadingComments ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading comments…
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-muted-foreground">No comments yet.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={c.profile?.avatar_url ?? undefined} />
                  <AvatarFallback>
                    {c.profile?.full_name?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-xs font-semibold">
                    {c.profile?.full_name ?? "User"}
                    <span className="ml-2 text-muted-foreground font-normal">
                      {format(new Date(c.created_at), "PPp")}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                </div>
              </div>
            ))
          )}

          <div className="flex gap-2 pt-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment…"
              rows={2}
              className="text-sm"
            />
            <Button
              size="sm"
              onClick={submitComment}
              disabled={submittingComment || !newComment.trim()}
            >
              {submittingComment ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share to your profile</DialogTitle>
          </DialogHeader>
          <Textarea
            value={repostComment}
            onChange={(e) => setRepostComment(e.target.value)}
            placeholder="Add a comment about this post…"
            rows={3}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowShareDialog(false)}
              disabled={reposting}
            >
              Cancel
            </Button>
            <Button onClick={submitRepost} disabled={reposting}>
              {reposting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sharing…
                </>
              ) : (
                "Share"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default WallPostActions;
