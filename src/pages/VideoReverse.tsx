import { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, Rewind, Wand2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import VideoDropzone from "@/components/videoreverse/VideoDropzone";
import ReversedCanvasPlayer from "@/components/videoreverse/ReversedCanvasPlayer";
import DownloadActions from "@/components/videoreverse/DownloadActions";
import {
  MAX_VIDEO_BYTES,
  MAX_VIDEO_SECONDS,
  disposeFrames,
  extractFrames,
  loadVideoElement,
} from "@/lib/videoFrames";

type Stage = "idle" | "ready" | "processing" | "done";

interface ReversedClip {
  frames: ImageBitmap[];
  width: number;
  height: number;
  fps: number;
}

const FPS = 30;

export default function VideoReverse() {
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [clip, setClip] = useState<ReversedClip | null>(null);
  const abortRef = useRef(false);

  const reset = useCallback(() => {
    abortRef.current = true;
    if (clip) disposeFrames(clip.frames);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setClip(null);
    setObjectUrl(null);
    setProgress(0);
    setStage("idle");
  }, [clip, objectUrl]);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("video/")) {
        toast.error("That file is not a video", { description: "Please choose an MP4 or WebM clip." });
        return;
      }
      if (file.size > MAX_VIDEO_BYTES) {
        toast.error("This video is too large", {
          description: `Frame extraction happens in your browser, so files must stay under ${Math.round(
            MAX_VIDEO_BYTES / (1024 * 1024),
          )} MB.`,
        });
        return;
      }
      const url = URL.createObjectURL(file);
      try {
        const video = await loadVideoElement(url);
        if (video.duration > MAX_VIDEO_SECONDS + 0.5) {
          URL.revokeObjectURL(url);
          toast.error("This clip is too long", {
            description: `Longer clips need too much browser memory for frame extraction. Please use up to ${MAX_VIDEO_SECONDS} seconds.`,
          });
          return;
        }
        if (clip) disposeFrames(clip.frames);
        setClip(null);
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        setObjectUrl(url);
        setStage("ready");
      } catch (e) {
        URL.revokeObjectURL(url);
        toast.error("This video could not be opened", {
          description: e instanceof Error ? e.message : "Try a different MP4 or WebM file.",
        });
      }
    },
    [clip, objectUrl],
  );

  const reverseVideo = useCallback(async () => {
    if (!objectUrl) return;
    abortRef.current = false;
    setStage("processing");
    setProgress(0);
    try {
      const video = await loadVideoElement(objectUrl);
      const result = await extractFrames(video, {
        fps: FPS,
        maxSize: 720,
        onProgress: (r) => setProgress(Math.round(r * 100)),
        shouldAbort: () => abortRef.current,
      });
      if (abortRef.current) {
        disposeFrames(result.frames);
        return;
      }
      setClip({ frames: result.frames, width: result.width, height: result.height, fps: result.fps });
      setStage("done");
      toast.success("Reversed!", { description: `${result.frames.length} frames ready to play backwards.` });
    } catch (e) {
      setStage("ready");
      toast.error("Reversing failed", {
        description: e instanceof Error ? e.message : "Please try a shorter clip.",
      });
    }
  }, [objectUrl]);

  return (
    <>
      <Helmet>
        <title>Reverse Video — Play Your Clips Backwards | Unique</title>
        <meta
          name="description"
          content="Upload a short MP4 or WebM clip and play it backwards instantly in your browser, with custom playback controls and optional sound."
        />
        <meta property="og:title" content="Reverse Video — Play Your Clips Backwards" />
        <meta
          property="og:description"
          content="Reverse short videos right in your browser with frame-accurate playback controls."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-6">
        <header className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
            <Rewind className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Reverse Video</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Drop a short clip, tap reverse, and watch it play backwards frame by frame.
          </p>
        </header>

        {stage === "idle" && <VideoDropzone onFile={handleFile} />}

        {stage !== "idle" && objectUrl && (
          <Card className="overflow-hidden">
            <CardContent className="space-y-4 p-4">
              {stage !== "done" && (
                <video
                  src={objectUrl}
                  controls
                  playsInline
                  className="mx-auto block w-full rounded-2xl bg-black"
                />
              )}

              {stage === "ready" && (
                <div className="flex flex-wrap gap-2">
                  <Button className="flex-1 rounded-full" onClick={reverseVideo}>
                    <Wand2 className="mr-2 h-4 w-4" /> Reverse Video
                  </Button>
                  <Button variant="outline" className="rounded-full" onClick={reset}>
                    <Trash2 className="mr-2 h-4 w-4" /> Remove
                  </Button>
                </div>
              )}

              {stage === "processing" && (
                <div className="space-y-3 rounded-2xl border border-border bg-card/60 p-5 text-center">
                  <Loader2 className="mx-auto h-7 w-7 animate-spin text-primary" />
                  <p className="text-sm font-semibold">Processing frames: {progress}%…</p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      abortRef.current = true;
                      setStage("ready");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {stage === "done" && clip && (
                <div className="space-y-4">
                  <ReversedCanvasPlayer
                    frames={clip.frames}
                    width={clip.width}
                    height={clip.height}
                    fps={clip.fps}
                  />
                  <DownloadActions
                    frames={clip.frames}
                    width={clip.width}
                    height={clip.height}
                    fps={clip.fps}
                  />
                  <Button variant="outline" className="w-full rounded-full" onClick={reset}>
                    <Trash2 className="mr-2 h-4 w-4" /> Start over
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
