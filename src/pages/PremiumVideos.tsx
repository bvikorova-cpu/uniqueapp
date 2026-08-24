import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Info, Loader2, PlayCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PremiumVideoCard from "@/components/premiumVideos/PremiumVideoCard";
import UploadPremiumVideoDialog from "@/components/premiumVideos/UploadPremiumVideoDialog";
import { usePremiumVideos } from "@/hooks/usePremiumVideos";

export default function PremiumVideos() {
  const { videos, loading, unlock, unlocking, addView, refetch } = usePremiumVideos();

  return (
    <>
      <Helmet>
        <title>Unlock Videos — Watch Half Free | Unique</title>
        <meta
          name="description"
          content="Creator videos that play free up to the halfway point. Unlock the rest for 1 credit — creators keep 50%."
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


        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4 text-primary" /> How it works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm text-muted-foreground">
            <p>1. Any member can upload a video — it is published instantly.</p>
            <p>2. Everyone watches the first 50% for free; playback then pauses.</p>
            <p>3. Unlocking the rest costs 1 AI credit, charged once per video.</p>
            <p>4. The creator receives 50% of every unlock in credits; the platform keeps 50%.</p>
            <p>5. Your own videos are always unlocked for you.</p>
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
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
