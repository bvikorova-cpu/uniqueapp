import { useMemo, useState } from "react";
import { Check, Eye, Frame as FrameIcon, Loader2, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import VideoFrame from "@/components/premiumVideos/VideoFrame";
import { VIDEO_FRAMES } from "@/lib/videoFrameStyles";
import { useVideoFrames } from "@/hooks/useVideoFrames";

interface Props {
  videoId: string;
  currentSlug?: string | null;
  onChanged?: () => void;
}

export default function VideoFrameDialog({ videoId, currentSlug, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const { owned, busySlug, buy, applyFrame } = useVideoFrames();
  const [applying, setApplying] = useState<string | null>(null);
  const [previewSlug, setPreviewSlug] = useState(currentSlug || "vframe_none");
  const active = currentSlug || "vframe_none";
  const previewFrame = useMemo(
    () => VIDEO_FRAMES.find((frame) => frame.slug === previewSlug) ?? VIDEO_FRAMES[0],
    [previewSlug],
  );

  const handle = async (slug: string) => {
    const isOwned = slug === "vframe_none" || owned.includes(slug);
    if (!isOwned) {
      await buy(slug);
      return;
    }
    setApplying(slug);
    const ok = await applyFrame(videoId, slug);
    setApplying(null);
    if (ok) {
      onChanged?.();
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <FrameIcon className="h-3.5 w-3.5" /> Frame
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Video frames</DialogTitle>
          <DialogDescription>
            Preview is free. Credits are charged only when you tap Buy; owned frames can be applied, changed, or removed anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border border-border/60 bg-background/45 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Preview: {previewFrame.name}</p>
            <Badge variant={active === previewSlug ? "secondary" : "outline"}>
              {active === previewSlug ? "Current" : previewSlug === "vframe_none" || owned.includes(previewSlug) ? "Owned" : `${previewFrame.credits} cr`}
            </Badge>
          </div>
          <VideoFrame slug={previewSlug}>
            <div className="flex aspect-video items-center justify-center bg-foreground/90 text-[10px] font-mono uppercase tracking-widest text-primary-foreground/70">
              preview before purchase
            </div>
          </VideoFrame>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {VIDEO_FRAMES.map((f) => {
            const isOwned = f.slug === "vframe_none" || owned.includes(f.slug);
            const isActive = active === f.slug;
            const isPreview = previewSlug === f.slug;
            const busy = busySlug === f.slug || applying === f.slug;
            return (
              <div
                key={f.slug}
                className="space-y-2 rounded-xl border border-border/60 bg-card/50 p-2.5"
              >
                <VideoFrame slug={f.slug}>
                  <div className="flex aspect-video items-center justify-center bg-black/80 text-[10px] font-mono uppercase tracking-widest text-white/60">
                    preview
                  </div>
                </VideoFrame>
                <div className="flex items-center justify-between gap-1">
                  <p className="truncate text-xs font-semibold">{f.name}</p>
                  {isActive ? (
                    <Badge variant="secondary" className="gap-1 text-[10px]">
                      <Check className="h-3 w-3" /> Active
                    </Badge>
                  ) : isPreview ? (
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <Eye className="h-3 w-3" /> Preview
                    </Badge>
                  ) : (
                    <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                      {isOwned ? "Owned" : `${f.credits} cr`}
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-1 text-xs"
                  onClick={() => setPreviewSlug(f.slug)}
                >
                  <Eye className="h-3.5 w-3.5" /> Preview
                </Button>
                <Button
                  size="sm"
                  variant={isActive ? "secondary" : isOwned ? "default" : "outline"}
                  className="w-full gap-1 text-xs"
                  disabled={busy || isActive}
                  onClick={() => handle(f.slug)}
                >
                  {busy ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isOwned ? null : (
                    <Lock className="h-3.5 w-3.5" />
                  )}
                  {isActive ? "In use" : isOwned ? (f.slug === "vframe_none" ? "Remove" : "Apply") : `Buy ${f.credits} cr`}
                </Button>
              </div>
            );
          })}
        </div>
        {active !== "vframe_none" && (
          <Button variant="ghost" className="w-full gap-2" onClick={() => handle("vframe_none")}>
            <X className="h-4 w-4" /> Remove frame from this video
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
