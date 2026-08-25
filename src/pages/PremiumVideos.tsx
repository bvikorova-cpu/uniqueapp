import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Info, Loader2, PlayCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PremiumVideoCard from "@/components/premiumVideos/PremiumVideoCard";
import UploadPremiumVideoDialog from "@/components/premiumVideos/UploadPremiumVideoDialog";
import { usePremiumVideos } from "@/hooks/usePremiumVideos";
import VideoCreditsPanel from "@/components/premiumVideos/VideoCreditsPanel";
import heroVideo from "@/assets/section-videos/unlock-videos.mp4.asset.json";

export default function PremiumVideos() {
  const { videos, loading, unlock, unlocking, addView, refetch } = usePremiumVideos();
  const [params, setParams] = useSearchParams();

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
        setParams(new URLSearchParams(), { replace: true });
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
        <div className="relative mb-6 overflow-hidden rounded-2xl border border-border/50 min-h-[220px] sm:min-h-[300px]">
          <video
            src={heroVideo.url}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/40 to-background/10" />
          <div className="relative z-10 flex min-h-[220px] flex-col justify-end gap-2 p-5 sm:min-h-[300px] sm:p-8">
            <Link
              to="/wall/videos"
              className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Wall Videos
            </Link>
            <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-4xl">
              <PlayCircle className="h-7 w-7 text-primary" /> Unlock Videos
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              First half free. Unlock the rest for 1 credit — creators keep 50%.
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
          <UploadPremiumVideoDialog onUploaded={refetch} />
        </div>

        <VideoCreditsPanel />

        <MyVideosPanel onChanged={refetch} />



        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4 text-primary" /> How it works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm text-muted-foreground">
            <p>1. Any member can upload a video — it is published instantly.</p>
            <p>2. Everyone watches the first 50% for free; playback then pauses.</p>
            <p>3. Unlocking the rest costs 1 video credit (own wallet: 10/€5, 20/€10, 30/€15), charged once per video.</p>
            <p>4. The creator receives 50% of every unlock in credits; the platform keeps 50%.</p>
            <p>5. Your own videos are always unlocked for you.</p>
            <p>
              6. Promote your video with credits: Quick Boost 5 (6h top of feed), Daily Top 12 (24h in “Hot”),
              Mega Boost 25 (“Featured” badge + priority for 3 days).
            </p>
          </CardContent>
        </Card>

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
      </main>
    </>
  );
}
