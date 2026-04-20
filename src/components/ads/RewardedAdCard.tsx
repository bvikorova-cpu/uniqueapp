import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Play, Check, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import AdBanner from "./AdBanner";

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
  const [phase, setPhase] = useState<"idle" | "watching" | "ready" | "claimed" | "limit">("idle");
  const [secondsLeft, setSecondsLeft] = useState(WATCH_SECONDS);
  const [viewsToday, setViewsToday] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const v = getLocalViews(sectionKey);
    setViewsToday(v);
    if (v >= 3) setPhase("limit");
  }, [sectionKey]);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startWatch = () => {
    setPhase("watching");
    setSecondsLeft(WATCH_SECONDS);
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

      if (error || (data as { error?: string })?.error) {
        const msg = (data as { error?: string })?.error || error?.message || "Failed to claim";
        if (msg.toLowerCase().includes("limit")) {
          setPhase("limit");
          toast({
            title: "Daily limit reached",
            description: "Come back tomorrow for more XP!",
          });
          return;
        }
        throw new Error(msg);
      }

      bumpLocalViews(sectionKey);
      const newCount = viewsToday + 1;
      setViewsToday(newCount);
      setPhase(newCount >= 3 ? "limit" : "claimed");
      toast({
        title: "+5 XP earned! ✨",
        description: `You can watch ${Math.max(0, 3 - newCount)} more video(s) today.`,
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
    <Card className={`relative overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-xl ${className}`}>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm sm:text-base text-foreground">Watch & Earn 5 XP</p>
              <p className="text-xs text-muted-foreground">{viewsToday}/3 watched today</p>
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
          {phase === "limit" && (
            <Button disabled size="sm" variant="outline">
              Limit reached
            </Button>
          )}
        </div>

        {(phase === "watching" || phase === "ready") && (
          <div className="rounded-lg overflow-hidden border border-border/50 bg-background/50">
            <AdBanner adSlot={adSlot} format="auto" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RewardedAdCard;
