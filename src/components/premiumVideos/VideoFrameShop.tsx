import { useEffect, useMemo, useState } from "react";
import { Check, Eye, Frame as FrameIcon, Loader2, Lock, Sparkles, Video, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VideoFrame from "@/components/premiumVideos/VideoFrame";
import { useMyPremiumVideos } from "@/hooks/useMyPremiumVideos";
import { useVideoFrames } from "@/hooks/useVideoFrames";
import { VIDEO_FRAMES } from "@/lib/videoFrameStyles";

export default function VideoFrameShop({ onChanged }: { onChanged?: () => void }) {
  const { videos, loading: videosLoading, refetch } = useMyPremiumVideos();
  const { owned, loading: framesLoading, busySlug, buy, applyFrame } = useVideoFrames();
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [applying, setApplying] = useState<string | null>(null);
  const [previewSlug, setPreviewSlug] = useState("vframe_none");

  useEffect(() => {
    if (!selectedVideoId && videos[0]?.id) setSelectedVideoId(videos[0].id);
  }, [selectedVideoId, videos]);

  const selectedVideo = useMemo(
    () => videos.find((video) => video.id === selectedVideoId),
    [selectedVideoId, videos],
  );
  const activeSlug = selectedVideo?.frame_slug || "vframe_none";
  const previewFrame = useMemo(
    () => VIDEO_FRAMES.find((frame) => frame.slug === previewSlug) ?? VIDEO_FRAMES[0],
    [previewSlug],
  );

  const handleFrame = async (slug: string) => {
    const isOwned = slug === "vframe_none" || owned.includes(slug);
    if (!isOwned) {
      await buy(slug);
      return;
    }

    if (!selectedVideoId) return;
    setApplying(slug);
    const ok = await applyFrame(selectedVideoId, slug);
    setApplying(null);
    if (ok) {
      await refetch();
      onChanged?.();
    }
  };

  return (
    <Card className="iri-card overflow-hidden rounded-3xl border-border/60">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="iri-mono mb-2 text-[10px] text-muted-foreground">// Video frame shop</p>
            <CardTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
              <FrameIcon className="h-5 w-5 text-primary" />
              <span className="iri-text">10 collectible frames</span>
            </CardTitle>
          </div>
          <div className="w-full sm:w-72">
            <Label className="text-xs text-muted-foreground">Apply to video</Label>
            <Select value={selectedVideoId} onValueChange={setSelectedVideoId} disabled={!videos.length}>
              <SelectTrigger className="mt-1 bg-background/70">
                <SelectValue placeholder={videosLoading ? "Loading videos…" : "Upload a video first"} />
              </SelectTrigger>
              <SelectContent>
                {videos.map((video) => (
                  <SelectItem key={video.id} value={video.id}>
                    {video.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-3xl border border-border/60 bg-background/45 p-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-black">Preview: {previewFrame.name}</p>
              <p className="text-xs text-muted-foreground">
                Preview is free. Buying and applying are separate actions.
              </p>
            </div>
            <Badge variant={activeSlug === previewSlug ? "secondary" : "outline"}>
              {activeSlug === previewSlug ? "Current" : previewSlug === "vframe_none" || owned.includes(previewSlug) ? "Owned" : `${previewFrame.credits} cr`}
            </Badge>
          </div>
          <div className="mx-auto max-w-md">
            <VideoFrame slug={previewSlug}>
              <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-foreground/90">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/25 to-secondary/30" />
                <div className="relative flex flex-col items-center gap-2 text-primary-foreground">
                  <Video className="h-10 w-10" />
                  <p className="iri-mono text-[10px]">LIVE FRAME PREVIEW</p>
                </div>
              </div>
            </VideoFrame>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {VIDEO_FRAMES.map((frame) => {
            const isDefault = frame.slug === "vframe_none";
            const isOwned = isDefault || owned.includes(frame.slug);
            const isActive = activeSlug === frame.slug;
            const isPreview = previewSlug === frame.slug;
            const busy = busySlug === frame.slug || applying === frame.slug;
            return (
              <div key={frame.slug} className="rounded-3xl border border-border/60 bg-background/45 p-3">
                <VideoFrame slug={frame.slug}>
                  <div className="flex aspect-video items-center justify-center bg-foreground/90 text-primary-foreground">
                    <Sparkles className="h-7 w-7" />
                  </div>
                </VideoFrame>
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">{frame.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {isDefault ? "Included" : `${frame.credits} video credits`}
                    </p>
                  </div>
                  {isActive ? (
                    <Badge variant="secondary" className="gap-1">
                      <Check className="h-3 w-3" /> Active
                    </Badge>
                  ) : isPreview ? (
                    <Badge variant="outline" className="gap-1">
                      <Eye className="h-3 w-3" /> Preview
                    </Badge>
                  ) : isOwned ? (
                    <Badge variant="outline">Owned</Badge>
                  ) : (
                    <Badge className="gap-1 bg-primary text-primary-foreground">
                      <Lock className="h-3 w-3" /> Buy
                    </Badge>
                  )}
                </div>
                <Button
                  className="mt-3 w-full"
                  variant="outline"
                  onClick={() => setPreviewSlug(frame.slug)}
                >
                  <Eye className="h-4 w-4" /> Preview
                </Button>
                <Button
                  className="mt-2 w-full"
                  variant={isActive ? "secondary" : isOwned ? "default" : "outline"}
                  disabled={busy || framesLoading || isActive || (!selectedVideoId && isOwned)}
                  onClick={() => handleFrame(frame.slug)}
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isActive
                    ? "In use"
                    : isOwned
                      ? selectedVideoId
                        ? isDefault
                          ? "Remove frame"
                          : "Apply frame"
                        : "Select video"
                      : selectedVideoId
                        ? `Buy ${frame.credits} cr`
                        : `Buy ${frame.credits} cr`}
                </Button>
              </div>
            );
          })}
        </div>
        {activeSlug !== "vframe_none" && selectedVideoId && (
          <Button variant="ghost" className="w-full gap-2" onClick={() => handleFrame("vframe_none")}>
            <X className="h-4 w-4" /> Remove frame from selected video
          </Button>
        )}
      </CardContent>
    </Card>
  );
}