import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Coins,
  Flame,
  Info,
  Loader2,
  PlayCircle,
  Video,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PremiumVideoCard from "@/components/premiumVideos/PremiumVideoCard";
import UploadPremiumVideoDialog from "@/components/premiumVideos/UploadPremiumVideoDialog";
import { usePremiumVideos } from "@/hooks/usePremiumVideos";
import VideoCreditsPanel from "@/components/premiumVideos/VideoCreditsPanel";
import MyVideosPanel from "@/components/premiumVideos/MyVideosPanel";

import heroVideo from "@/assets/section-videos/unlock-videos.mp4.asset.json";

type TabKey = "feed" | "mine" | "credits" | "how";

const TABS: { key: TabKey; label: string; icon: typeof Video; desc: string }[] = [
  { key: "feed", label: "Feed", icon: Flame, desc: "Watch & unlock" },
  { key: "mine", label: "My videos", icon: Video, desc: "Manage & earnings" },
  { key: "credits", label: "Credits", icon: Coins, desc: "Top up your wallet" },
  { key: "how", label: "How it works", icon: Info, desc: "Rules & pricing" },
];

export default function PremiumVideos() {
  const { videos, loading, unlock, unlocking, addView, refetch } = usePremiumVideos();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<TabKey>(
    (TABS.find((t) => t.key === params.get("tab"))?.key ?? "feed") as TabKey,
  );

  const goTab = (key: TabKey) => {
    setTab(key);
    const next = new URLSearchParams(params);
    next.set("tab", key);
    setParams(next, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const sessionId = params.get("session_id");
    if (params.get("success") !== "true" || !sessionId) return;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-credits-payment", {
          body: { session_id: sessionId },
        });
        if (error) throw error;
        if (data?.success) {
          toast.success(
            data.credits_added ? `+${data.credits_added} video credits added` : "Payment already processed",
          );
          window.dispatchEvent(new Event("video-credits-updated"));
        }
      } catch (e: any) {
        toast.error("Could not verify payment", { description: e?.message });
      } finally {
        const next = new URLSearchParams();
        next.set("tab", "credits");
        setTab("credits");
        setParams(next, { replace: true });
      }
    })();
  }, [params, setParams]);

  return (
    <>
      <Helmet>
        <title>Unlock Videos — Watch Half Free | Unique</title>
        <meta
          name="description"
          content="Creator videos that play free up to the halfway point. Unlock the rest for 1 video credit — creators keep 50%."
        />
        <link rel="canonical" href="https://uniqueapp.fun/unlock-videos" />
        <meta property="og:title" content="Unlock Videos — Watch Half Free | Unique" />
        <meta
          property="og:description"
          content="Watch the first half free, unlock the rest for 1 credit."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Navbar />

      <main className="container mx-auto max-w-5xl px-4 pb-24 pt-6">
        {/* Hero video */}
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-gold/30 shadow-gold min-h-[240px] sm:min-h-[320px]">
          <video
            src={heroVideo.url}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/10" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative z-10 flex min-h-[240px] flex-col justify-end gap-3 p-5 sm:min-h-[320px] sm:p-8">
            <Link
              to="/wall/videos"
              className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Wall Videos
            </Link>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
              <Sparkles className="h-3.5 w-3.5" /> Creator gold rush
            </span>
            <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
              <PlayCircle className="h-8 w-8 text-gold" />
              <span className="bg-gradient-gold bg-clip-text text-transparent">Unlock Videos</span>
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              First half free. Unlock the rest for 1 credit — creators keep 50%.
            </p>
          </div>
        </div>

        {/* Sub-navigation */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => goTab(t.key)}
                aria-current={active ? "page" : undefined}
                className={`group relative overflow-hidden rounded-2xl border p-4 text-left backdrop-blur transition-all duration-300 ${
                  active
                    ? "border-gold/60 bg-gradient-gold text-gold-foreground shadow-gold"
                    : "border-border/60 bg-card/60 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-gold"
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                  <Icon className={`h-4 w-4 ${active ? "" : "text-gold"}`} />
                  {t.label}
                </span>
                <span
                  className={`mt-1 block text-xs ${active ? "text-gold-foreground/80" : "text-muted-foreground"}`}
                >
                  {t.desc}
                </span>
              </button>
            );
          })}
        </div>


        {tab === "feed" && (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
              <UploadPremiumVideoDialog onUploaded={refetch} />
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : videos.length === 0 ? (
              <p className="py-20 text-center text-muted-foreground">
                No videos yet — be the first to upload one.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {videos.map((v) => (
                  <PremiumVideoCard
                    key={v.id}
                    video={v}
                    unlocking={unlocking === v.id}
                    onUnlock={unlock}
                    onFirstPlay={addView}
                    onBoosted={refetch}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "mine" && (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
              <UploadPremiumVideoDialog onUploaded={refetch} />
            </div>
            <MyVideosPanel onChanged={refetch} />
          </>
        )}

        {tab === "credits" && <VideoCreditsPanel />}

        {tab === "how" && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4 text-primary" /> How it works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm text-muted-foreground">
              <p>1. Any member can upload a video — publishing costs 1 video credit and goes live instantly.</p>
              <p>2. Everyone watches the first 50% for free; playback then pauses.</p>
              <p>3. Unlocking the rest costs 1 video credit (own wallet: 10/€5, 20/€10, 30/€15), charged once per video.</p>
              <p>4. The creator receives 50% of every unlock in credits; the platform keeps 50%.</p>
              <p>5. Your own videos are always unlocked for you.</p>
              <p>
                6. Promote your video with credits: Quick Boost 5 (6h top of feed), Daily Top 12 (24h in “Hot”),
                Mega Boost 25 (“Featured” badge + priority for 3 days).
              </p>
              <div className="pt-3">
                <Button variant="outline" size="sm" onClick={() => goTab("credits")}>
                  <Coins className="mr-2 h-4 w-4" /> Top up credits
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
