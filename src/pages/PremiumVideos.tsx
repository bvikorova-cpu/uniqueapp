import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Coins,
  Flame,
  Frame,
  Info,
  Loader2,
  PlayCircle,
  Sparkles,
  Video,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import PremiumVideoCard from "@/components/premiumVideos/PremiumVideoCard";
import UploadPremiumVideoDialog from "@/components/premiumVideos/UploadPremiumVideoDialog";
import { usePremiumVideos } from "@/hooks/usePremiumVideos";
import VideoCreditsPanel from "@/components/premiumVideos/VideoCreditsPanel";
import MyVideosPanel from "@/components/premiumVideos/MyVideosPanel";
import VideoFrameShop from "@/components/premiumVideos/VideoFrameShop";

import heroVideo from "@/assets/section-videos/unlock-videos.mp4.asset.json";
import demoVideo from "@/assets/section-videos/unlock-videos-demo.mp4.asset.json";

type TabKey = "feed" | "mine" | "frames" | "credits" | "how";

const TABS: { key: TabKey; label: string; icon: typeof Video; desc: string }[] = [
  { key: "feed", label: "Feed", icon: Flame, desc: "Watch & unlock" },
  { key: "mine", label: "My videos", icon: Video, desc: "Manage & earnings" },
  { key: "frames", label: "Frames", icon: Frame, desc: "Buy video frames" },
  { key: "credits", label: "Credits", icon: Coins, desc: "Top up your wallet" },
  { key: "how", label: "How it works", icon: Info, desc: "Rules & pricing" },
];

export default function PremiumVideos() {
  const { videos, loading, unlock, unlocking, addView, refetch } = usePremiumVideos();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<TabKey>(
    (TABS.find((t) => t.key === params.get("tab"))?.key ?? "feed") as TabKey,
  );

  const stats = useMemo(() => {
    const views = videos.reduce((s, v) => s + (v.views_count || 0), 0);
    const unlocks = videos.reduce((s, v) => s + (v.unlocks_count || 0), 0);
    const fmt = (n: number) =>
      n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
    return [
      { value: fmt(videos.length), label: "Videos live" },
      { value: fmt(views), label: "Views" },
      { value: fmt(unlocks), label: "Unlocks" },
      { value: "50%", label: "Free preview" },
    ];
  }, [videos]);

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

      <div className="iri-surface min-h-screen">
        <main className="container mx-auto max-w-5xl px-4 pb-24 pt-6">
          {/* Hero */}
          <div className="iri-card relative mb-5 overflow-hidden rounded-[28px] min-h-[260px] sm:min-h-[340px]">
            <video
              src={heroVideo.url}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover opacity-60 saturate-150"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/55 to-white/20" />
            <div className="relative z-10 flex min-h-[260px] flex-col justify-end gap-3 p-5 sm:min-h-[340px] sm:p-8">
              <Link
                to="/wall/videos"
                className="iri-mono inline-flex w-fit items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Wall Videos
              </Link>
              <span className="iri-chip iri-mono inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold">
                <Sparkles className="h-3.5 w-3.5" /> Half free · half unlocked
              </span>
              <h1 className="flex flex-wrap items-center gap-2 text-4xl font-black tracking-tight sm:text-6xl">
                <PlayCircle className="h-9 w-9 text-primary" />
                <span className="iri-text">UNLOCK//VIDEOS</span>
              </h1>
              <p className="max-w-xl text-sm text-foreground/70 sm:text-base">
                First half free. Unlock the rest for 1 credit — creators keep 50%.
              </p>
            </div>
          </div>

          {/* Stat chrome cards */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="iri-card rounded-3xl px-4 py-5 text-center">
                <p className="iri-text text-3xl font-black italic tracking-tight sm:text-4xl">{s.value}</p>
                <p className="iri-mono mt-1 text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Demo video */}
          <div className="iri-card mb-6 overflow-hidden rounded-3xl p-4 sm:p-5">
            <p className="iri-mono mb-3 text-[10px] text-muted-foreground">// See it in action</p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <video
                src={demoVideo.url}
                autoPlay
                loop
                muted
                playsInline
                controls
                className="w-full rounded-2xl border border-white/60 shadow-lg sm:max-w-[220px]"
              />
              <div className="space-y-2 text-sm text-foreground/75">
                <h2 className="text-2xl font-black tracking-tight">
                  Three taps to the <span className="iri-text italic">full video.</span>
                </h2>
                <p>1. Play any video — the first 50% is always free.</p>
                <p>2. At the halfway point the paywall slides in.</p>
                <p>3. Tap unlock — 1 video credit, and it plays to the end forever.</p>
              </div>
            </div>
          </div>

          {/* Sub-navigation */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => goTab(t.key)}
                  aria-current={active ? "page" : undefined}
                  className={`iri-card rounded-3xl p-4 text-left transition-all duration-300 ${
                    active ? "iri-active" : "hover:-translate-y-0.5"
                  }`}
                >
                  <span className="iri-mono flex items-center gap-2 text-xs font-bold">
                    <Icon className={`h-4 w-4 ${active ? "" : "text-primary"}`} />
                    {t.label}
                  </span>
                  <span className={`mt-1 block text-xs ${active ? "opacity-80" : "text-muted-foreground"}`}>
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

          {tab === "frames" && <VideoFrameShop onChanged={refetch} />}

          {tab === "how" && (
            <div className="iri-card rounded-3xl p-5 sm:p-7">
              <p className="iri-mono mb-2 text-[10px] text-muted-foreground">// How it works</p>
              <h2 className="mb-4 text-2xl font-black tracking-tight">
                Watch half. <span className="iri-text italic">Unlock the rest.</span>
              </h2>
              <div className="space-y-1.5 text-sm text-foreground/75">
                <p>1. Any member can upload a video — publishing costs 1 video credit and goes live instantly.</p>
                <p>2. Everyone watches the first 50% for free; playback then pauses.</p>
                <p>3. Unlocking the rest costs 1 video credit (own wallet: 10/€5, 20/€10, 30/€15), charged once per video.</p>
                <p>4. The creator receives 50% of every unlock in credits; the platform keeps 50%.</p>
                <p>5. Your own videos are always unlocked for you.</p>
                <p>
                  6. Promote your video with credits: Quick Boost 5 (6h top of feed), Daily Top 12 (24h in “Hot”),
                  Mega Boost 25 (“Featured” badge + priority for 3 days).
                </p>
              </div>
              <div className="pt-4">
                <Button variant="outline" size="sm" onClick={() => goTab("credits")}>
                  <Coins className="mr-2 h-4 w-4" /> Top up credits
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
