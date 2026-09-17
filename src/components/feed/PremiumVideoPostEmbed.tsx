import { useEffect, useRef, useState } from "react";
import { Loader2, Lock, Unlock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface PremiumVideoData {
  id: string;
  user_id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  unlock_cost: number;
  is_published: boolean;
}

/**
 * Renders a paid ("unlock") video shared into the Wall feed.
 * Plays free until 50%, then requires 1 video credit to continue.
 */
export default function PremiumVideoPostEmbed({ videoId }: { videoId: string }) {
  const { user } = useAuth();
  const ref = useRef<HTMLVideoElement>(null);
  const [video, setVideo] = useState<PremiumVideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [locked, setLocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("premium_videos")
        .select("id,user_id,title,video_url,thumbnail_url,unlock_cost,is_published")
        .eq("id", videoId)
        .maybeSingle();
      if (!active) return;
      setVideo((data as PremiumVideoData) || null);
      if (data && user?.id) {
        if (data.user_id === user.id) {
          setUnlocked(true);
        } else {
          const { data: unlock } = await supabase
            .from("premium_video_unlocks")
            .select("id")
            .eq("video_id", videoId)
            .eq("user_id", user.id)
            .maybeSingle();
          if (active) setUnlocked(!!unlock);
        }
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [videoId, user?.id]);

  const effectiveDuration = (el: HTMLVideoElement): number => {
    if (Number.isFinite(el.duration) && el.duration > 0) return el.duration;
    try {
      if (el.seekable.length) {
        const end = el.seekable.end(el.seekable.length - 1);
        if (Number.isFinite(end) && end > 0) return end;
      }
    } catch { /* ignore */ }
    return 0;
  };

  const enforceGate = (el: HTMLVideoElement | null, strictlyAfter = false) => {
    if (!el || unlocked) return;
    const dur = effectiveDuration(el);
    if (!dur) return;
    const half = dur / 2;
    if (strictlyAfter ? el.currentTime > half : el.currentTime >= half) {
      el.pause();
      try { el.currentTime = half; } catch { /* ignore */ }
      setLocked(true);
    }
  };

  const handleUnlock = async () => {
    if (!video) return;
    if (!user) {
      toast.error("Sign in to unlock this video");
      return;
    }
    setUnlocking(true);
    try {
      const { data, error } = await (supabase as any).rpc("unlock_premium_video", {
        _video_id: video.id,
      });
      if (error) throw error;
      if (!data?.ok) {
        if (data?.error === "insufficient") {
          toast.error("Not enough video credits", {
            description: "Buy video credits in Unlock Videos to continue watching.",
          });
        } else {
          toast.error("Could not unlock this video");
        }
        return;
      }
      setUnlocked(true);
      setLocked(false);
      window.dispatchEvent(new Event("video-credits-updated"));
      ref.current?.play().catch(() => {});
    } catch (e: any) {
      toast.error(e?.message || "Could not unlock this video");
    } finally {
      setUnlocking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl bg-muted/40">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!video || (!video.is_published && video.user_id !== user?.id)) return null;

  const cost = video.unlock_cost || 1;

  return (
    <div className="overflow-hidden rounded-xl border border-border/60">
      <div className="relative aspect-video bg-black">
        <video
          ref={ref}
          src={video.video_url}
          poster={video.thumbnail_url || undefined}
          controls={!locked}
          playsInline
          preload="metadata"
          className="h-full w-full object-contain"
          onTimeUpdate={handleTimeUpdate}
        />

        {locked && !unlocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/85 px-6 text-center backdrop-blur-md">
            <div className="rounded-full bg-primary/15 p-3">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <p className="font-semibold">You reached the halfway point</p>
            <p className="text-sm text-muted-foreground">
              Unlock the rest for {cost} video credit{cost > 1 ? "s" : ""}. Half goes to the creator.
            </p>
            <Button onClick={handleUnlock} disabled={unlocking} className="mt-1">
              {unlocking ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Unlock className="mr-2 h-4 w-4" />
              )}
              Unlock for {cost} credit{cost > 1 ? "s" : ""}
            </Button>
            <Link to="/unlock-videos" className="text-xs underline text-muted-foreground">
              Buy video credits
            </Link>
          </div>
        )}

        {!unlocked && !locked && (
          <Badge className="absolute left-3 top-3 gap-1 bg-primary/90">
            <Sparkles className="h-3 w-3" /> Locks at 50%
          </Badge>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 p-3">
        <p className="min-w-0 truncate text-sm font-semibold">{video.title}</p>
        <Badge variant="outline" className="shrink-0 gap-1">
          <Lock className="h-3 w-3" /> {cost} credit{cost > 1 ? "s" : ""}
        </Badge>
      </div>
    </div>
  );
}
