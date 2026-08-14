import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InfluencerPostCommentsProps {
  postId: string;
  userId: string;
}

interface CommentRow {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: { full_name: string | null; avatar_url: string | null } | null;
}

export function InfluencerPostComments({ postId, userId }: InfluencerPostCommentsProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ["influencerPostComments", postId];

  const { data: comments = [], isLoading } = useQuery({
    queryKey,
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencer_post_comments")
        .select("id, user_id, content, created_at")
        .eq("post_id", postId)
        .order("created_at", { ascending: true })
        .limit(100);
      if (error) throw error;

      const userIds = Array.from(new Set((data ?? []).map((comment) => comment.user_id)));
      const profiles = new Map<string, { full_name: string | null; avatar_url: string | null }>();
      if (userIds.length > 0) {
        const { data: profileRows } = await supabase.rpc("get_profiles_basic", { _ids: userIds });
        (profileRows ?? []).forEach((profile) => {
          profiles.set(profile.id, { full_name: profile.full_name, avatar_url: profile.avatar_url });
        });
      }

      return (data ?? []).map((comment) => ({
        ...comment,
        profile: profiles.get(comment.user_id) ?? null,
      })) as CommentRow[];
    },
  });

  const createComment = useMutation({
    mutationFn: async (message: string) => {
      const { error } = await supabase.from("influencer_post_comments").insert({
        post_id: postId,
        user_id: userId,
        content: message,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      setContent("");
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      toast({ title: "Comment could not be posted", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const message = content.trim();
    if (!message || message.length > 1000) return;
    createComment.mutate(message);
  };

  return (
    <div className="border-t border-border/60 pt-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <MessageCircle className="h-4 w-4" />
        Comment{comments.length > 0 ? ` (${comments.length})` : ""}
      </Button>

      {open && (
        <div className="mt-3 space-y-3">
          {isLoading ? (
            <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading comments…
            </div>
          ) : comments.length === 0 ? (
            <p className="py-1 text-xs text-muted-foreground">Be the first to comment.</p>
          ) : (
            <div className="max-h-52 space-y-3 overflow-y-auto pr-1">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={comment.profile?.avatar_url ?? undefined} />
                    <AvatarFallback>{comment.profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 rounded-md bg-muted/60 px-3 py-2">
                    <div className="flex flex-wrap items-center gap-x-2 text-xs">
                      <span className="font-semibold">{comment.profile?.full_name || "User"}</span>
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-1 break-words text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex min-w-0 gap-2">
            <Input
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write a comment…"
              maxLength={1000}
              className="min-w-0"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!content.trim() || createComment.isPending}
              aria-label="Post comment"
            >
              {createComment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}