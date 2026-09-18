import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Clapperboard, Lock, Play, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ReelItem {
  id: string;
  video_url: string;
  thumbnail_url: string | null;
  title: string | null;
  premium: boolean;
  views_count: number | null;
  _ts: number;
}

function formatNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

/**
 * Compact horizontal "Videos" strip injected between Wall Feed posts.
 * Shows the newest clips from Wall Videos; tapping opens the vertical feed.
 */
export default function WallVideosReelsRow({ offset = 0 }: { offset?: number }) {
  const { data: reels = [] } = useQuery({
    queryKey: ["wall-videos-reels-row"],
    staleTime: 60_000,
    queryFn: async (): Promise<ReelItem[]> => {
      const [vidsRes, premiumRes] = await Promise.all([
        supabase
          .from("videos")
          .select("id,video_url,title,views_count,created_at")
          .order("created_at", { ascending: false })
          .limit(12),
        (supabase as any)
          .from("premium_videos")
          .select("id,video_url,thumbnail_url,title,views_count,created_at")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(12),
      ]);

      const items: ReelItem[] = [];
      ((premiumRes as any).data || []).forEach((p: any) => {
        if (p.video_url)
          items.push({
            id: p.id,
            video_url: p.video_url,
            thumbnail_url: p.thumbnail_url ?? null,
            title: p.title ?? null,
            premium: true,
            views_count: p.views_count ?? null,
            _ts: new Date(p.created_at).getTime(),
          });
      });
      const premiumUrls = new Set(items.map((i) => i.video_url));
      (vidsRes.data || []).forEach((v: any) => {
        if (v.video_url && !premiumUrls.has(v.video_url))
          items.push({
            id: v.id,
            video_url: v.video_url,
            thumbnail_url: null,
            title: v.title ?? null,
            premium: false,
            views_count: v.views_count ?? null,
            _ts: new Date(v.created_at).getTime(),
          });
      });
      return items.sort((a, b) => b._ts - a._ts);
    },
  });

  if (reels.length === 0) return null;

  // Rotate the window so each injected strip shows different clips.
  const start = (offset * 4) % reels.length;
  const window = [...reels.slice(start), ...reels.slice(0, start)].slice(0, 8);

  return (
    <section className="glass-post-card overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <Clapperboard className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-bold">Videos</h2>
        </div>
        <Link
          to="/wall/videos"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          See all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {window.map((r) => (
          <Link
            key={`${r.premium ? "p" : "v"}-${r.id}`}
            to="/wall/videos"
            className="relative shrink-0 snap-start overflow-hidden rounded-xl border border-border/60 bg-muted"
            style={{ width: 116, aspectRatio: "9 / 16" }}
          >
            {r.thumbnail_url ? (
              <img
                src={r.thumbnail_url}
                alt={r.title || "Video"}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <video
                src={r.video_url}
                muted
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

            {r.premium && (
              <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-primary/90 px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                <Lock className="h-2.5 w-2.5" /> Unlock
              </span>
            )}

            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm">
                <Play className="h-4 w-4 translate-x-[1px] text-white" fill="currentColor" />
              </span>
            </span>

            <span className="absolute inset-x-1.5 bottom-1.5 space-y-0.5">
              {r.title && (
                <span className="block truncate text-[11px] font-semibold text-white drop-shadow">
                  {r.title}
                </span>
              )}
              {typeof r.views_count === "number" && r.views_count > 0 && (
                <span className="block text-[10px] text-white/80">
                  {formatNum(r.views_count)} views
                </span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
