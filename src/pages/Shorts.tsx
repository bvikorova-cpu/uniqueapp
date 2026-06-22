import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Heart, MessageCircle, Share2, Volume2, VolumeX, Loader2, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface Short {
  id: string;
  video_url: string;
  title?: string | null;
  description?: string | null;
  user_id: string;
  likes_count?: number;
  views_count?: number;
  profile: { full_name: string | null; avatar_url: string | null };
}

function ShortItem({ short, active, muted, onToggleMute }: {
  short: Short; active: boolean; muted: boolean; onToggleMute: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(short.likes_count ?? 0);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [active]);

  const handleLike = () => {
    if (!user) { toast.error("Prihlás sa pre lajkovanie"); return; }
    setLiked(!liked);
    setLikes((n) => n + (liked ? -1 : 1));
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/shorts#${short.id}`;
    try {
      if (navigator.share) await navigator.share({ url, title: short.title || "Unique Short" });
      else { await navigator.clipboard.writeText(url); toast.success("Link skopírovaný"); }
    } catch {}
  };

  const name = short.profile.full_name || "Unique user";

  return (
    <div className="relative h-[100dvh] w-full snap-start snap-always bg-black flex items-center justify-center overflow-hidden">
      <video
        ref={ref}
        src={short.video_url}
        loop
        playsInline
        muted={muted}
        className="h-full w-full object-cover"
        onClick={onToggleMute}
      />
      {/* Right rail */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 text-white z-10">
        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
            <Heart className={`w-6 h-6 ${liked ? "fill-pink-500 text-pink-500" : ""}`} />
          </div>
          <span className="text-xs font-semibold">{likes}</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold">0</span>
        </button>
        <button onClick={handleShare} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
            <Share2 className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold">Zdielaj</span>
        </button>
        <button onClick={onToggleMute} className="w-12 h-12 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>
      {/* Bottom info */}
      <div className="absolute left-0 right-16 bottom-6 px-4 text-white z-10">
        <Link to={`/profile/${short.user_id}`} className="flex items-center gap-2 mb-2">
          <Avatar className="w-9 h-9 ring-2 ring-white">
            <AvatarImage src={short.profile.avatar_url || undefined} />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          <span className="font-semibold drop-shadow">@{name}</span>
        </Link>
        {short.title && <h2 className="font-bold text-base drop-shadow mb-1 line-clamp-2">{short.title}</h2>}
        {short.description && <p className="text-sm opacity-90 drop-shadow line-clamp-2">{short.description}</p>}
      </div>
      {/* Top gradient */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
    </div>
  );
}

export default function Shorts() {
  const [muted, setMuted] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: shorts = [], isLoading } = useQuery({
    queryKey: ["shorts-feed"],
    queryFn: async (): Promise<Short[]> => {
      // 1) standalone videos
      const { data: vids } = await supabase
        .from("videos").select("id,video_url,title,description,user_id,likes_count,views_count,created_at")
        .order("created_at", { ascending: false }).limit(50);
      // 2) posts with video media
      const { data: posts } = await supabase
        .from("posts").select("id,content,user_id,created_at,media!inner(file_url,file_type)")
        .ilike("media.file_type", "video/%").order("created_at", { ascending: false }).limit(50);

      const all: Short[] = [];
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

      // hydrate profiles
      const ids = Array.from(new Set(all.map((s) => s.user_id).filter(Boolean)));
      if (ids.length) {
        const { data: profs } = await (supabase as any)
          .from("public_profiles").select("id,full_name,avatar_url").in("id", ids);
        const map = new Map<string, any>((profs || []).map((p: any) => [p.id, p]));
        all.forEach((s) => { const p = map.get(s.user_id); if (p) s.profile = { full_name: p.full_name, avatar_url: p.avatar_url }; });
      }

      // shuffle for FYP feel
      return all.sort(() => Math.random() - 0.5);
    },
  });

  // Observe active video by scroll position
  useEffect(() => {
    const el = containerRef.current;
    if (!el || shorts.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.7) {
            const idx = Number((e.target as HTMLElement).dataset.idx);
            setActiveIdx(idx);
          }
        });
      },
      { root: el, threshold: [0.7] }
    );
    el.querySelectorAll("[data-idx]").forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, [shorts.length]);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  return (
    <>
      <Helmet>
        <title>Shorts — Unique</title>
        <meta name="description" content="Krátke vertikálne videá od kreatorov na Unique." />
      </Helmet>
      <div
        ref={containerRef}
        className="fixed inset-0 bg-black overflow-y-scroll snap-y snap-mandatory overscroll-contain"
        style={{ scrollbarWidth: "none" }}
      >
        {isLoading && (
          <div className="h-[100dvh] flex items-center justify-center text-white">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}
        {!isLoading && shorts.length === 0 && (
          <div className="h-[100dvh] flex flex-col items-center justify-center text-white gap-4 px-6 text-center">
            <h1 className="text-2xl font-bold">Ešte žiadne shorts</h1>
            <p className="opacity-80">Buď prvý kto nahrá krátke video.</p>
            <Button asChild variant="secondary"><Link to="/wall/videos">Nahraj video</Link></Button>
          </div>
        )}
        {shorts.map((s, i) => (
          <div key={s.id} data-idx={i}>
            <ShortItem short={s} active={i === activeIdx} muted={muted} onToggleMute={toggleMute} />
          </div>
        ))}
        {shorts.length > 0 && activeIdx === 0 && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 text-white/70 animate-bounce pointer-events-none">
            <ChevronUp className="w-6 h-6" />
            <span className="text-xs">Swipe</span>
          </div>
        )}
      </div>
    </>
  );
}
