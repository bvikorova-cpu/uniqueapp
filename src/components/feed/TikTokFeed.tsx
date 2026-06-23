import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef, useState, useCallback, ReactNode } from "react";
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Loader2, Music2, Play, Send, MoreVertical, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

export interface ShortItem {
  id: string;          // raw id (uuid)
  kind: "video" | "post" | "story";
  video_url: string;
  title?: string | null;
  description?: string | null;
  user_id: string;
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  profile: { full_name: string | null; avatar_url: string | null };
}

function formatNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function tables(kind: "video" | "post") {
  return kind === "video"
    ? { likes: "video_likes", comments: "video_comments", fk: "video_id" as const }
    : { likes: "post_likes", comments: "post_comments", fk: "post_id" as const };
}

function CommentsSheet({ open, onOpenChange, short, onCountChange }: {
  open: boolean; onOpenChange: (v: boolean) => void; short: ShortItem; onCountChange: (n: number) => void;
}) {
  const { user } = useAuth();
  const { comments: table, fk } = tables(short.kind);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from(table).select("id,content,user_id,created_at")
      .eq(fk, short.id).order("created_at", { ascending: false }).limit(100);
    const rows = data || [];
    const ids = Array.from(new Set(rows.map((r: any) => r.user_id).filter(Boolean)));
    let map = new Map<string, any>();
    if (ids.length) {
      const { data: profs } = await (supabase as any)
        .from("public_profiles").select("id,full_name,avatar_url").in("id", ids);
      map = new Map((profs || []).map((p: any) => [p.id, p]));
    }
    setItems(rows.map((r: any) => ({ ...r, profile: map.get(r.user_id) })));
    setLoading(false);
  }, [table, fk, short.id]);

  useEffect(() => { if (open) load(); }, [open, load]);

  const submit = async () => {
    if (!user) { toast.error("Sign in to comment"); return; }
    const c = text.trim();
    if (!c) return;
    setSending(true);
    const { error } = await (supabase as any)
      .from(table).insert({ [fk]: short.id, user_id: user.id, content: c });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setText("");
    onCountChange(items.length + 1);
    load();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[75dvh] p-0 flex flex-col rounded-t-2xl">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle className="text-center text-sm font-semibold">{items.length} comments</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {loading && <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div>}
          {!loading && items.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">Be the first to comment</p>
          )}
          {items.map((c) => (
            <div key={c.id} className="flex gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={c.profile?.avatar_url || undefined} />
                <AvatarFallback>{(c.profile?.full_name || "U")[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold">{c.profile?.full_name || "user"}</div>
                <div className="text-sm break-words">{c.content}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t p-3 flex gap-2 items-center bg-background">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={user ? "Add a comment…" : "Sign in to comment"}
            disabled={!user || sending}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          />
          <Button size="icon" onClick={submit} disabled={!user || sending || !text.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function VideoCard({ short, active, muted, onToggleMute }: {
  short: ShortItem; active: boolean; muted: boolean; onToggleMute: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(short.likes_count ?? 0);
  const [comments, setComments] = useState(short.comments_count ?? 0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [busyLike, setBusyLike] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const qc = useQueryClient();
  const isOwner = !!user && user.id === short.user_id;

  const { likes: likesTable, comments: commentsTable, fk } = tables(short.kind);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const tbl = short.kind === "video" ? "videos" : "posts";
      const { error } = await (supabase as any).from(tbl).delete().eq("id", short.id);
      if (error) throw error;
      toast.success("Video deleted");
      qc.invalidateQueries({ queryKey: ["tiktok-feed"] });
    } catch (e: any) {
      toast.error(e?.message || "Could not delete");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  // Load like state + accurate counts
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ count: lc }, { count: cc }] = await Promise.all([
        (supabase as any).from(likesTable).select("id", { count: "exact", head: true }).eq(fk, short.id),
        (supabase as any).from(commentsTable).select("id", { count: "exact", head: true }).eq(fk, short.id),
      ]);
      if (cancelled) return;
      if (typeof lc === "number") setLikes(lc);
      if (typeof cc === "number") setComments(cc);
      if (user) {
        const { data } = await (supabase as any)
          .from(likesTable).select("id").eq(fk, short.id).eq("user_id", user.id).maybeSingle();
        if (!cancelled) setLiked(!!data);
      }
    })();
    return () => { cancelled = true; };
  }, [short.id, user?.id, likesTable, commentsTable, fk]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) {
      v.currentTime = 0;
      v.play().then(() => setPaused(false)).catch(() => setPaused(true));
    } else {
      v.pause();
    }
  }, [active]);

  const togglePlay = () => {
    const v = ref.current; if (!v) return;
    if (v.paused) { v.play(); setPaused(false); } else { v.pause(); setPaused(true); }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { toast.error("Sign in to like"); return; }
    if (busyLike) return;
    setBusyLike(true);
    const next = !liked;
    setLiked(next);
    setLikes((n) => n + (next ? 1 : -1));
    try {
      if (next) {
        const { error } = await (supabase as any)
          .from(likesTable).insert({ [fk]: short.id, user_id: user.id });
        if (error && !String(error.message).includes("duplicate")) throw error;
      } else {
        const { error } = await (supabase as any)
          .from(likesTable).delete().eq(fk, short.id).eq("user_id", user.id);
        if (error) throw error;
      }
    } catch (err: any) {
      // rollback
      setLiked(!next);
      setLikes((n) => n + (next ? -1 : 1));
      toast.error(err?.message || "Could not update like");
    } finally {
      setBusyLike(false);
    }
  };

  const [shareOpen, setShareOpen] = useState(false);
  const PUBLIC_HOST = "https://www.uniqueapp.fun";
  const origin = typeof window !== "undefined" && /(?:^|\.)uniqueapp\.fun$/.test(window.location.hostname)
    ? window.location.origin
    : PUBLIC_HOST;
  const shareUrl = `${origin}/shorts#${short.kind}-${short.id}`;
  const shareText = short.title || short.description || "Check out this video on Unique";

  const openShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShareOpen(true);
  };

  const shareTo = (target: "facebook" | "twitter" | "whatsapp" | "telegram" | "messenger" | "linkedin" | "reddit" | "email" | "native") => {
    const u = encodeURIComponent(shareUrl);
    const t = encodeURIComponent(shareText);
    let href = "";
    switch (target) {
      case "facebook":  href = `https://www.facebook.com/sharer/sharer.php?u=${u}`; break;
      case "twitter":   href = `https://twitter.com/intent/tweet?url=${u}&text=${t}`; break;
      case "whatsapp":  href = `https://wa.me/?text=${t}%20${u}`; break;
      case "telegram":  href = `https://t.me/share/url?url=${u}&text=${t}`; break;
      case "messenger": href = `https://www.facebook.com/dialog/send?link=${u}&app_id=140586622674265&redirect_uri=${u}`; break;
      case "linkedin":  href = `https://www.linkedin.com/sharing/share-offsite/?url=${u}`; break;
      case "reddit":    href = `https://www.reddit.com/submit?url=${u}&title=${t}`; break;
      case "email":     href = `mailto:?subject=${t}&body=${u}`; break;
      case "native":
        if (navigator.share) {
          navigator.share({ url: shareUrl, title: shareText }).catch(() => {});
        }
        setShareOpen(false);
        return;
    }
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=600");
    setShareOpen(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy");
    }
    setShareOpen(false);
  };

  const openInstagram = () => {
    // Instagram has no web share intent. Copy link + deep-link to app.
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    toast.success("Link copied — paste it in Instagram");
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    setShareOpen(false);
  };

  const name = short.profile.full_name || "unique";

  return (
    <div className="relative h-[100dvh] w-full snap-start snap-always bg-black flex items-center justify-center overflow-hidden">
      <video
        ref={ref}
        src={short.video_url}
        loop
        playsInline
        muted={muted}
        preload="metadata"
        className="h-full w-full object-cover"
        onClick={togglePlay}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (v.duration) setProgress((v.currentTime / v.duration) * 100);
        }}
      />

      {paused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Play className="w-20 h-20 text-white/80 fill-white/80 drop-shadow-2xl" />
        </div>
      )}

      {/* Top-right menu (owner only) */}
      {isOwner && (
        <div className="absolute top-3 right-3 z-30">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white active:scale-90"
                aria-label="Video options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this video?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The video will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      <div className="absolute right-2 bottom-32 flex flex-col items-center gap-6 text-white z-20">
        <Link to={`/profile/${short.user_id}`} className="relative" onClick={(e) => e.stopPropagation()}>
          <Avatar className="w-12 h-12 ring-2 ring-white">
            <AvatarImage src={short.profile.avatar_url || undefined} />
            <AvatarFallback>{name[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-pink-500 text-white text-lg flex items-center justify-center font-bold leading-none">+</span>
        </Link>

        <button onClick={handleLike} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
          <Heart className={`w-10 h-10 drop-shadow-lg ${liked ? "fill-red-500 text-red-500" : "text-white"}`} strokeWidth={1.5} />
          <span className="text-xs font-semibold drop-shadow">{formatNum(likes)}</span>
        </button>

        <button
          className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
          onClick={(e) => { e.stopPropagation(); setCommentsOpen(true); }}
        >
          <MessageCircle className="w-10 h-10 drop-shadow-lg" strokeWidth={1.5} />
          <span className="text-xs font-semibold drop-shadow">{formatNum(comments)}</span>
        </button>

        <button onClick={openShare} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
          <Share2 className="w-10 h-10 drop-shadow-lg" strokeWidth={1.5} />
          <span className="text-xs font-semibold drop-shadow">Share</span>
        </button>

        <button onClick={(e) => { e.stopPropagation(); onToggleMute(); }} className="active:scale-90 transition-transform">
          {muted ? <VolumeX className="w-6 h-6 drop-shadow-lg" /> : <Volume2 className="w-6 h-6 drop-shadow-lg" />}
        </button>

        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-black border-2 border-zinc-600 flex items-center justify-center animate-spin" style={{ animationDuration: "4s" }}>
          <Music2 className="w-4 h-4 text-white" />
        </div>
      </div>

      <div className="absolute left-0 right-20 bottom-6 px-3 text-white z-10 space-y-2">
        <Link to={`/profile/${short.user_id}`} onClick={(e) => e.stopPropagation()}>
          <span className="font-bold text-base drop-shadow-lg">@{name}</span>
        </Link>
        {short.description && (
          <p className="text-sm drop-shadow-lg line-clamp-2 leading-snug">{short.description}</p>
        )}
        <div className="flex items-center gap-2 text-xs opacity-90">
          <Music2 className="w-3 h-3" />
          <div className="overflow-hidden whitespace-nowrap">
            <span className="inline-block animate-[marquee_12s_linear_infinite]">
              Original sound · {name} · Original sound · {name}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-white/20 z-10">
        <div className="h-full bg-white" style={{ width: `${progress}%` }} />
      </div>

      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

      <CommentsSheet
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
        short={short}
        onCountChange={setComments}
      />

      <Sheet open={shareOpen} onOpenChange={setShareOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl p-0">
          <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle className="text-center text-sm font-semibold">Share to</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-4 gap-3 p-4">
            {typeof navigator !== "undefined" && (navigator as any).share && (
              <ShareBtn label="More" emoji="📲" onClick={() => shareTo("native")} />
            )}
            <ShareBtn label="Facebook" emoji="📘" onClick={() => shareTo("facebook")} />
            <ShareBtn label="Instagram" emoji="📷" onClick={openInstagram} />
            <ShareBtn label="WhatsApp" emoji="💬" onClick={() => shareTo("whatsapp")} />
            <ShareBtn label="Messenger" emoji="💌" onClick={() => shareTo("messenger")} />
            <ShareBtn label="X / Twitter" emoji="🐦" onClick={() => shareTo("twitter")} />
            <ShareBtn label="Telegram" emoji="✈️" onClick={() => shareTo("telegram")} />
            <ShareBtn label="LinkedIn" emoji="💼" onClick={() => shareTo("linkedin")} />
            <ShareBtn label="Reddit" emoji="👽" onClick={() => shareTo("reddit")} />
            <ShareBtn label="Email" emoji="✉️" onClick={() => shareTo("email")} />
            <ShareBtn label="Copy link" emoji="🔗" onClick={copyLink} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ShareBtn({ label, emoji, onClick }: { label: string; emoji: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 text-center active:scale-95 transition-transform"
    >
      <span className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">{emoji}</span>
      <span className="text-[11px] leading-tight">{label}</span>
    </button>
  );
}


export default function TikTokFeed({ topOverlay, fabOverlay }: { topOverlay?: ReactNode; fabOverlay?: ReactNode }) {
  const [muted, setMuted] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: shorts = [], isLoading } = useQuery({
    queryKey: ["tiktok-feed"],
    queryFn: async (): Promise<ShortItem[]> => {
      const { data: vids } = await supabase
        .from("videos").select("id,video_url,title,description,user_id,likes_count,views_count,created_at")
        .order("created_at", { ascending: false }).limit(50);
      const { data: posts } = await supabase
        .from("posts").select("id,content,user_id,created_at,media!inner(file_url,file_type)")
        .ilike("media.file_type", "video/%").order("created_at", { ascending: false }).limit(50);

      const all: ShortItem[] = [];
      (vids || []).forEach((v: any) => v.video_url && all.push({
        id: v.id, kind: "video", video_url: v.video_url, title: v.title, description: v.description,
        user_id: v.user_id, likes_count: v.likes_count, views_count: v.views_count,
        profile: { full_name: null, avatar_url: null },
      }));
      (posts || []).forEach((p: any) => {
        const m = Array.isArray(p.media) ? p.media[0] : p.media;
        if (m?.file_url) all.push({
          id: p.id, kind: "post", video_url: m.file_url, title: null, description: p.content,
          user_id: p.user_id, profile: { full_name: null, avatar_url: null },
        });
      });

      const ids = Array.from(new Set(all.map((s) => s.user_id).filter(Boolean)));
      if (ids.length) {
        const { data: profs } = await (supabase as any)
          .from("public_profiles").select("id,full_name,avatar_url").in("id", ids);
        const map = new Map<string, any>((profs || []).map((p: any) => [p.id, p]));
        all.forEach((s) => {
          const p = map.get(s.user_id);
          if (p) s.profile = { full_name: p.full_name, avatar_url: p.avatar_url };
        });
      }
      return all.sort(() => Math.random() - 0.5);
    },
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el || shorts.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.6) {
            const idx = Number((e.target as HTMLElement).dataset.idx);
            setActiveIdx(idx);
          }
        });
      },
      { root: el, threshold: [0.6] }
    );
    el.querySelectorAll("[data-idx]").forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, [shorts.length]);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  return (
    <div className="fixed inset-0 bg-black">
      {topOverlay && (
        <div className="absolute top-0 inset-x-0 z-30 pt-3 px-4 flex items-center justify-center text-white pointer-events-none">
          <div className="pointer-events-auto">{topOverlay}</div>
        </div>
      )}

      <div
        ref={containerRef}
        className="absolute inset-0 overflow-y-scroll snap-y snap-mandatory overscroll-contain scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        <style>{`
          .scrollbar-none::-webkit-scrollbar { display: none; }
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>

        {isLoading && (
          <div className="h-[100dvh] flex items-center justify-center text-white">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}
        {!isLoading && shorts.length === 0 && (
          <div className="h-[100dvh] flex flex-col items-center justify-center text-white gap-4 px-6 text-center">
            <h1 className="text-2xl font-bold">No videos yet</h1>
            <p className="opacity-80">Be the first to upload a short video.</p>
            {fabOverlay}
          </div>
        )}
        {shorts.map((s, i) => (
          <div key={`${s.kind}-${s.id}`} data-idx={i}>
            <VideoCard short={s} active={i === activeIdx} muted={muted} onToggleMute={toggleMute} />
          </div>
        ))}
      </div>

      {fabOverlay && shorts.length > 0 && (
        <div className="absolute bottom-24 right-4 z-30">{fabOverlay}</div>
      )}
    </div>
  );
}
