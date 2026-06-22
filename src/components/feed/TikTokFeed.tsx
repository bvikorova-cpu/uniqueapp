import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef, useState, useCallback, ReactNode } from "react";
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Loader2, Music2, Play } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface ShortItem {
  id: string;
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

function VideoCard({ short, active, muted, onToggleMute }: {
  short: ShortItem; active: boolean; muted: boolean; onToggleMute: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(short.likes_count ?? 0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { toast.error("Prihlás sa pre lajkovanie"); return; }
    setLiked(!liked);
    setLikes((n) => n + (liked ? -1 : 1));
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/shorts#${short.id}`;
    try {
      if (navigator.share) await navigator.share({ url, title: short.title || "Unique" });
      else { await navigator.clipboard.writeText(url); toast.success("Link skopírovaný"); }
    } catch {}
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

      {/* Pause overlay icon */}
      {paused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Play className="w-20 h-20 text-white/80 fill-white/80 drop-shadow-2xl" />
        </div>
      )}

      {/* Right rail — TikTok style */}
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

        <button className="flex flex-col items-center gap-1 active:scale-90 transition-transform" onClick={(e) => e.stopPropagation()}>
          <MessageCircle className="w-10 h-10 drop-shadow-lg" strokeWidth={1.5} />
          <span className="text-xs font-semibold drop-shadow">{formatNum(short.comments_count ?? 0)}</span>
        </button>

        <button onClick={handleShare} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
          <Share2 className="w-10 h-10 drop-shadow-lg" strokeWidth={1.5} />
          <span className="text-xs font-semibold drop-shadow">Share</span>
        </button>

        <button onClick={(e) => { e.stopPropagation(); onToggleMute(); }} className="active:scale-90 transition-transform">
          {muted ? <VolumeX className="w-6 h-6 drop-shadow-lg" /> : <Volume2 className="w-6 h-6 drop-shadow-lg" />}
        </button>

        {/* Spinning music disc */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-black border-2 border-zinc-600 flex items-center justify-center animate-spin" style={{ animationDuration: "4s" }}>
          <Music2 className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Bottom info — TikTok style */}
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

      {/* Progress bar */}
      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-white/20 z-10">
        <div className="h-full bg-white" style={{ width: `${progress}%` }} />
      </div>

      {/* Gradients */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
    </div>
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
        id: v.id, video_url: v.video_url, title: v.title, description: v.description,
        user_id: v.user_id, likes_count: v.likes_count, views_count: v.views_count,
        profile: { full_name: null, avatar_url: null },
      }));
      (posts || []).forEach((p: any) => {
        const m = Array.isArray(p.media) ? p.media[0] : p.media;
        if (m?.file_url) all.push({
          id: `p-${p.id}`, video_url: m.file_url, title: null, description: p.content,
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
            <h1 className="text-2xl font-bold">Ešte žiadne videá</h1>
            <p className="opacity-80">Buď prvý kto nahrá krátke video.</p>
            {fabOverlay}
          </div>
        )}
        {shorts.map((s, i) => (
          <div key={s.id} data-idx={i}>
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
