import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Share2,
  Loader2,
  Info,
  AlertCircle,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { trackChallengeAction } from "@/lib/trackChallenge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const REPOST_MIN = 3;
const REPOST_MAX = 280;

const repostSchema = z.object({
  comment: z
    .string()
    .trim()
    .min(REPOST_MIN, {
      message: `Add at least ${REPOST_MIN} characters so your followers get context.`,
    })
    .max(REPOST_MAX, {
      message: `Comment must be ${REPOST_MAX} characters or fewer.`,
    }),
});

function friendlyRepostError(err: { code?: string; message?: string } | null) {
  if (!err) return "Failed to share post. Please try again.";
  switch (err.code) {
    case "23505":
      return "You've already shared this post.";
    case "23503":
      return "This post is no longer available.";
    case "42501":
      return "You don't have permission to share this post.";
    case "PGRST301":
    case "401":
      return "Your session expired. Please sign in again.";
    default:
      return err.message ?? "Failed to share post. Please try again.";
  }
}


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
  const [repostError, setRepostError] = useState<string | null>(null);

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
        const { rateLimit } = await import("@/lib/scaleGuards");
        const ok = await rateLimit("like.toggle", 120, 60);
        if (!ok) throw new Error("Too many likes. Slow down.");
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: userId! });
        if (error) throw error;
        trackChallengeAction("reaction");
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
          .rpc("get_profiles_basic", { _ids: userIds });
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
      trackChallengeAction("comment", 10);
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
    setRepostError(null);
    if (!requireAuth()) {
      setRepostError("You must be signed in to share this post.");
      return;
    }

    const parsed = repostSchema.safeParse({ comment: repostComment });
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      setRepostError(firstIssue?.message ?? "Invalid comment.");
      return;
    }

    setReposting(true);
    try {
      const { error } = await supabase.from("reposts").insert({
        user_id: userId!,
        original_post_id: postId,
        comment: parsed.data.comment,
      });
      if (error) throw error;
      setRepostsCount((c) => c + 1);
      setShowShareDialog(false);
      setRepostComment("");
      setRepostError(null);
      toast({
        title: "Shared",
        description: "Post was shared to your profile.",
      });
    } catch (err: any) {
      const friendly = friendlyRepostError({
        code: err?.code,
        message: err?.message,
      });
      setRepostError(friendly);
      toast({
        title: "Couldn't share",
        description: friendly,
        variant: "destructive",
      });
    } finally {
      setReposting(false);
    }
  };

  const handleOpenShareDialog = () => {
    if (!requireAuth()) return;
    setRepostError(null);
    setShowShareDialog(true);
  };

  const handleShareDialogChange = (open: boolean) => {
    setShowShareDialog(open);
    if (!open) {
      setRepostError(null);
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
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={labeled ? "flex-1" : ""}
                onClick={handleOpenShareDialog}
                aria-label="Share this post to your profile"
              >
                <Share2 className="h-4 w-4 mr-1" />
                {labeled ? "Share" : repostsCount}
                {labeled && repostsCount > 0 ? ` (${repostsCount})` : ""}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              Share with a quick comment so your followers know why it matters.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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

      <Dialog open={showShareDialog} onOpenChange={handleShareDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Share to your profile
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Sharing tips"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    Add at least {REPOST_MIN} characters explaining why you're sharing.
                    Your followers will see your comment alongside the original post.
                    Maximum {REPOST_MAX} characters.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </DialogTitle>
            <DialogDescription>
              Your repost will appear on your profile with the original post embedded.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Textarea
              value={repostComment}
              onChange={(e) => {
                setRepostComment(e.target.value);
                if (repostError) setRepostError(null);
              }}
              placeholder="Add a comment about this post…"
              rows={3}
              maxLength={REPOST_MAX + 50}
              aria-invalid={!!repostError}
              aria-describedby={repostError ? "repost-error" : "repost-counter"}
              className={
                repostError
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
            />
            <div className="flex items-center justify-between text-xs">
              {repostError ? (
                <div
                  id="repost-error"
                  role="alert"
                  className="flex items-start gap-1.5 text-destructive flex-1"
                >
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{repostError}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">
                  Tip: explain why this post matters to your followers.
                </span>
              )}
              <span
                id="repost-counter"
                className={`tabular-nums ml-2 shrink-0 ${
                  repostComment.trim().length > REPOST_MAX
                    ? "text-destructive font-semibold"
                    : repostComment.trim().length >= REPOST_MIN
                      ? "text-muted-foreground"
                      : "text-muted-foreground/70"
                }`}
              >
                {repostComment.trim().length}/{REPOST_MAX}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleShareDialogChange(false)}
              disabled={reposting}
            >
              Cancel
            </Button>
            <Button onClick={submitRepost} disabled={reposting}>
              {reposting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sharing…
                </>
              ) : repostError ? (
                "Try again"
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
