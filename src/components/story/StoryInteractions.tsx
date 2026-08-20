import { useEffect, useState, useCallback } from "react";
import { Heart, MessageCircle, Share2, Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { canonicalUrl } from "@/lib/canonicalUrl";
import { toast } from "sonner";

interface Reply {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  name: string;
  avatar: string | null;
}

interface Props {
  storyId: string;
  authorId: string;
}

export const StoryInteractions = ({ storyId, authorId }: Props) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const loadLikes = useCallback(async () => {
    const { data } = await (supabase as any)
      .from("story_reactions")
      .select("user_id")
      .eq("story_id", storyId)
      .eq("reaction", "like");
    const rows = (data || []) as { user_id: string }[];
    setLikeCount(rows.length);
    setLiked(!!user && rows.some((r) => r.user_id === user.id));
  }, [storyId, user]);

  const loadReplies = useCallback(async () => {
    setLoadingReplies(true);
    try {
      const { data } = await (supabase as any)
        .from("story_replies")
        .select("id, content, created_at, sender_id")
        .eq("story_id", storyId)
        .order("created_at", { ascending: true });
      const rows = (data || []) as Omit<Reply, "name" | "avatar">[];
      const ids = [...new Set(rows.map((r) => r.sender_id))];
      let profiles: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      if (ids.length) {
        const { data: profs } = await (supabase as any)
          .from("profiles_public")
          .select("id, full_name, avatar_url")
          .in("id", ids);
        (profs || []).forEach((p: any) => { profiles[p.id] = p; });
      }
      setReplies(
        rows.map((r) => ({
          ...r,
          name: profiles[r.sender_id]?.full_name || "User",
          avatar: profiles[r.sender_id]?.avatar_url || null,
        })),
      );
    } finally {
      setLoadingReplies(false);
    }
  }, [storyId]);

  useEffect(() => { loadLikes(); }, [loadLikes]);
  useEffect(() => { if (showComments) loadReplies(); }, [showComments, loadReplies]);

  const toggleLike = async () => {
    if (!user) { toast.error("Sign in to like stories"); return; }
    if (liked) {
      setLiked(false); setLikeCount((c) => Math.max(0, c - 1));
      const { error } = await (supabase as any)
        .from("story_reactions").delete()
        .eq("story_id", storyId).eq("user_id", user.id).eq("reaction", "like");
      if (error) { toast.error("Could not remove like"); loadLikes(); }
    } else {
      setLiked(true); setLikeCount((c) => c + 1);
      const { error } = await (supabase as any)
        .from("story_reactions")
        .insert({ story_id: storyId, user_id: user.id, reaction: "like" });
      if (error) { toast.error("Could not like story"); loadLikes(); }
    }
  };

  const sendReply = async () => {
    if (!user) { toast.error("Sign in to comment"); return; }
    const content = text.trim();
    if (!content) return;
    setSending(true);
    try {
      const { error } = await (supabase as any).from("story_replies").insert({
        story_id: storyId,
        sender_id: user.id,
        recipient_id: authorId,
        content,
      });
      if (error) throw error;
      setText("");
      await loadReplies();
      toast.success("Comment sent");
    } catch {
      toast.error("Could not send comment");
    } finally {
      setSending(false);
    }
  };

  const share = async () => {
    const url = canonicalUrl(`/wall?story=${storyId}`);
    try {
      if (navigator.share) await navigator.share({ title: "Story on Unique", url });
      else { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
    } catch { /* user cancelled */ }
  };

  return (
    <div onClick={(e) => e.stopPropagation()} className="w-full">
      {showComments && (
        <div className="mb-3 max-h-[35vh] overflow-y-auto rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 p-3 space-y-3">
          {loadingReplies ? (
            <div className="flex justify-center py-3"><Loader2 className="w-4 h-4 animate-spin text-white/70" /></div>
          ) : replies.length === 0 ? (
            <p className="text-xs text-white/60 text-center py-2">No comments yet. Be the first.</p>
          ) : (
            replies.map((r) => (
              <div key={r.id} className="flex gap-2 items-start">
                <Avatar className="w-7 h-7">
                  <AvatarImage src={r.avatar || undefined} />
                  <AvatarFallback className="text-[10px]">{r.name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-white/90">{r.name}</p>
                  <p className="text-xs text-white/80 break-words">{r.content}</p>
                </div>
              </div>
            ))
          )}
          <div className="flex gap-2 items-center pt-1">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendReply(); }}
              placeholder="Write a comment..."
              className="h-9 bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm"
            />
            <Button size="icon" className="h-9 w-9 shrink-0" onClick={sendReply} disabled={sending}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button onClick={toggleLike} className="flex items-center gap-1.5 text-white" aria-label="Like story">
          <Heart className={`w-6 h-6 ${liked ? "fill-red-500 text-red-500" : ""}`} />
          <span className="text-sm">{likeCount}</span>
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-white"
          aria-label="Comments"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-sm">{showComments ? "Hide" : "Comment"}</span>
        </button>
        <button onClick={share} className="flex items-center gap-1.5 text-white" aria-label="Share story">
          <Share2 className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
