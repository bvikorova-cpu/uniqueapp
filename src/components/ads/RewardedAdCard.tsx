import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Play, Check, Clock, Gift, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MONETAG_ZONE_IDS, trackMonetagEvent } from "@/lib/monetag";
import adVideo from "@/assets/video-ad-hero.mp4.asset.json";

interface RewardedAdCardProps {
  sectionKey: string;
  adSlot: string;
  className?: string;
}

const WATCH_SECONDS = 15;
const STORAGE_KEY = "rewarded_ad_views_local";

type LocalViews = Record<string, { date: string; count: number }>;

function getLocalViews(sectionKey: string): number {
  try {
    const today = new Date().toISOString().split("T")[0];
    const all: LocalViews = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const row = all[sectionKey];
    if (!row || row.date !== today) return 0;
    return row.count;
  } catch {
    return 0;
  }
}

function bumpLocalViews(sectionKey: string) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const all: LocalViews = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const row = all[sectionKey];
    all[sectionKey] = {
      date: today,
      count: row?.date === today ? row.count + 1 : 1,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

const RewardedAdCard = ({ sectionKey, adSlot, className = "" }: RewardedAdCardProps) => {
  // Unlimited XP — no daily cap. Users can keep watching & earning forever.
  const [phase, setPhase] = useState<"idle" | "watching" | "ready" | "claimed">("idle");
  const [secondsLeft, setSecondsLeft] = useState(WATCH_SECONDS);
  const [viewsToday, setViewsToday] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setViewsToday(getLocalViews(sectionKey));
  }, [sectionKey]);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const cancelWatch = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    videoRef.current?.pause();
    setPhase("idle");
    setSecondsLeft(WATCH_SECONDS);
  };

  const startWatch = () => {
    MONETAG_ZONE_IDS.forEach((zoneId) => {
      trackMonetagEvent("click", zoneId, sectionKey);
      trackMonetagEvent("impression", zoneId, sectionKey);
    });
    setPhase("watching");
    setSecondsLeft(WATCH_SECONDS);
    window.setTimeout(() => {
      void videoRef.current?.play().catch(() => undefined);
    }, 0);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setPhase("ready");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const claim = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to earn XP rewards.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("claim-rewarded-ad-xp", {
        body: { section_key: sectionKey },
      });

      // Supabase SDK surfaces non-2xx as `error`. For 429 we need to read the body from error.context.
      let bodyErr = (data as { error?: string; retry_after?: number } | null)?.error;
      let retryAfter = (data as { retry_after?: number } | null)?.retry_after;

      if (!bodyErr && error) {
        try {
          const ctx = (error as { context?: Response }).context;
          if (ctx && typeof (ctx as Response).json === "function") {
            const parsed = await (ctx as Response).clone().json();
            bodyErr = parsed?.error;
            retryAfter = parsed?.retry_after;
          }
        } catch {
          /* ignore */
        }
        // Fallback: detect 429 from error message string
        if (!bodyErr && /429|too fast/i.test(error.message ?? "")) {
          bodyErr = "Too fast";
        }
      }

      if (bodyErr || error) {
        if (bodyErr === "Too fast") {
          const wait = retryAfter ?? 10;
          toast({
            title: "Slow down ⏱️",
            description: `Please wait ${wait}s before claiming again.`,
          });
          setPhase("idle");
          return;
        }
        throw new Error(bodyErr || error?.message || "Failed to claim");
      }


      bumpLocalViews(sectionKey);
      const newCount = viewsToday + 1;
      setViewsToday(newCount);
      setPhase("claimed");
      toast({
        title: "+5 XP earned! ✨",
        description: "Watch another video to earn more — no daily limit!",
      });
    } catch (e) {
      toast({
        title: "Could not claim XP",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card data-rewarded-ad-card className={`relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-xl ${className}`}>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm sm:text-base text-foreground">Watch & Earn 5 XP</p>
              <p className="text-xs text-muted-foreground">
                {viewsToday} watched today · <span className="text-primary font-semibold">unlimited</span>
              </p>
            </div>
          </div>

          {phase === "idle" && (
            <Button onClick={startWatch} size="sm" className="bg-gradient-to-r from-primary to-accent text-white">
              <Play className="w-4 h-4 mr-1" /> Watch Ad
            </Button>
          )}
          {phase === "watching" && (
            <Button disabled size="sm" variant="secondary">
              <Clock className="w-4 h-4 mr-1" /> {secondsLeft}s
            </Button>
          )}
          {phase === "ready" && (
            <Button onClick={claim} size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <Sparkles className="w-4 h-4 mr-1" /> Claim 5 XP
            </Button>
          )}
          {phase === "claimed" && (
            <Button onClick={() => setPhase("idle")} size="sm" variant="outline">
              <Check className="w-4 h-4 mr-1" /> Watch another
            </Button>
          )}
        </div>

        {phase === "watching" && (
          <div className="rounded-md border border-border/50 bg-muted/30 p-3 text-center text-xs text-muted-foreground">
            Video reklama beží v bezpečnom okne. Počkaj {secondsLeft}s a potom si vyzdvihni XP.
          </div>
        )}
      </CardContent>
      <Dialog open={phase === "watching"} onOpenChange={(open) => { if (!open && phase === "watching") cancelWatch(); }}>
        <DialogContent className="!w-screen !h-screen !max-w-none !max-h-none p-0 m-0 border-0 !rounded-none bg-black !left-0 !top-0 !translate-x-0 !translate-y-0 !inset-0 sm:!rounded-none overflow-hidden flex">
          <div className="sr-only">
            <DialogTitle>Sponsored video</DialogTitle>
            <DialogDescription>Watch the sponsored video until the countdown finishes to claim XP.</DialogDescription>
          </div>
          <div className="relative w-full h-full bg-black">
            <video
              ref={videoRef}
              src={adVideo.url}
              muted
              playsInline
              autoPlay
              loop
              className="absolute inset-0 h-full w-full object-contain"
            />
            <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-3 z-10">
              <div className="flex items-center gap-2 rounded-full bg-background/80 backdrop-blur px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary border border-primary/30">
                <ShieldCheck className="h-4 w-4" /> Sponsored video
              </div>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-primary/50 bg-background/80 backdrop-blur text-xl font-black text-primary">
                {secondsLeft}
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-6 z-10">
              <p className="text-base sm:text-lg font-bold text-white mb-2">Unique partner spotlight</p>
              <Progress value={((WATCH_SECONDS - secondsLeft) / WATCH_SECONDS) * 100} className="h-2 mb-3" />
              <div className="flex items-center justify-between gap-3 text-xs text-white/80">
                <span className="flex items-center gap-1.5"><Gift className="h-4 w-4 text-primary" /> Reward unlocks after the video.</span>
                <span>No popups · no redirects</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </Card>
  );
};

export default RewardedAdCard;
