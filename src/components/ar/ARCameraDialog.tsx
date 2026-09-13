import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CircleStop, Loader2, RefreshCw, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { AR_FILTERS, type ArFilter } from "@/data/arFilters";
import { anchorsFromLandmarks, getFaceLandmarker } from "@/lib/arFaceTracker";

export type ArCaptureKind = "photo" | "video";

interface ARCameraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fires with the captured file (PNG photo or WebM video). */
  onCapture: (file: File, kind: ArCaptureKind) => void;
  /** Allow recording a short video (default true). */
  allowVideo?: boolean;
}

const MAX_RECORD_MS = 20_000;

/** Live AR camera with original Unique face filters for photos and short videos. */
export const ARCameraDialog = ({ open, onOpenChange, onCapture, allowVideo = true }: ARCameraDialogProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const filterRef = useRef<ArFilter>(AR_FILTERS[0]);
  const lastVideoTimeRef = useRef(-1);
  const anchorsRef = useRef<ReturnType<typeof anchorsFromLandmarks>[]>([]);

  const [filterId, setFilterId] = useState("sunglasses");
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [facingUser, setFacingUser] = useState(true);

  useEffect(() => {
    filterRef.current = AR_FILTERS.find((f) => f.id === filterId) ?? AR_FILTERS[0];
  }, [filterId]);

  /** Preloads overlay images once. */
  const loadImages = useCallback(() => {
    AR_FILTERS.flatMap((f) => f.overlays).forEach((o) => {
      if (imagesRef.current.has(o.src)) return;
      const img = new Image();
      img.src = o.src;
      imagesRef.current.set(o.src, img);
    });
  }, []);

  const stopAll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    recorderRef.current?.state === "recording" && recorderRef.current.stop();
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    lastVideoTimeRef.current = -1;
    anchorsRef.current = [];
  }, []);

  useEffect(() => {
    if (!open) {
      stopAll();
      return;
    }
    let cancelled = false;
    loadImages();
    setLoading(true);

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingUser ? "user" : "environment", width: { ideal: 1280 }, height: { ideal: 1280 } },
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        video.muted = true;
        video.setAttribute("playsinline", "true");
        video.setAttribute("webkit-playsinline", "true");
        try {
          await video.play();
        } catch {
          /* some mobile browsers resolve play only after metadata */
        }
        if (!video.videoWidth) {
          await new Promise<void>((resolve) => {
            const done = () => resolve();
            video.addEventListener("loadedmetadata", done, { once: true });
            window.setTimeout(done, 3000);
          });
          await video.play().catch(() => undefined);
        }

        let landmarker: Awaited<ReturnType<typeof getFaceLandmarker>> | null = null;
        try {
          landmarker = await getFaceLandmarker();
        } catch {
          toast.error("Face tracking could not start. You can still take a plain photo.");
        }
        if (cancelled) return;
        setLoading(false);

        const render = () => {
          rafRef.current = requestAnimationFrame(render);
          const canvas = canvasRef.current;
          const v = videoRef.current;
          if (!canvas || !v || !v.videoWidth) return;
          if (canvas.width !== v.videoWidth || canvas.height !== v.videoHeight) {
            canvas.width = v.videoWidth;
            canvas.height = v.videoHeight;
          }
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          ctx.save();
          if (facingUser) {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
          ctx.restore();

          if (landmarker && v.currentTime !== lastVideoTimeRef.current) {
            lastVideoTimeRef.current = v.currentTime;
            try {
              const result = landmarker.detectForVideo(v, performance.now());
              anchorsRef.current = (result.faceLandmarks ?? []).map((lm) =>
                anchorsFromLandmarks(lm, canvas.width, canvas.height),
              );
            } catch {
              /* keep last anchors */
            }
          }

          const filter = filterRef.current;
          if (!filter.overlays.length) return;

          for (const anchors of anchorsRef.current) {
            if (!anchors) continue;
            for (const overlay of filter.overlays) {
              const img = imagesRef.current.get(overlay.src);
              if (!img?.complete || !img.naturalWidth) continue;

              const base =
                overlay.anchor === "eyes"
                  ? { x: (anchors.eyeLeft.x + anchors.eyeRight.x) / 2, y: (anchors.eyeLeft.y + anchors.eyeRight.y) / 2 }
                  : overlay.anchor === "nose"
                    ? anchors.nose
                    : overlay.anchor === "mouth"
                      ? anchors.mouth
                      : anchors.forehead;

              const width = anchors.eyeDistance * overlay.widthFactor;
              const height = (img.naturalHeight / img.naturalWidth) * width;
              let cx = base.x;
              let cy = base.y + anchors.eyeDistance * overlay.offsetY;
              if (overlay.anchor === "above-head") cy -= height / 2;

              // Mirror horizontally for the front camera so overlays follow the face.
              if (facingUser) cx = canvas.width - cx;

              ctx.save();
              ctx.translate(cx, cy);
              ctx.rotate(facingUser ? -anchors.angle : anchors.angle);
              ctx.drawImage(img, -width / 2, -height / 2, width, height);
              ctx.restore();
            }
          }
        };
        render();
      } catch {
        setLoading(false);
        toast.error("Camera access was blocked. Allow the camera and try again.");
      }
    })();

    return () => {
      cancelled = true;
      stopAll();
    };
  }, [open, facingUser, loadImages, stopAll]);

  const takePhoto = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      onCapture(new File([blob], `unique-ar-${Date.now()}.png`, { type: "image/png" }), "photo");
      onOpenChange(false);
    }, "image/png");
  };

  const toggleRecording = () => {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const stream = canvas.captureStream(30);
    const audio = streamRef.current?.getAudioTracks()?.[0];
    if (audio) stream.addTrack(audio);
    const mime = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find((m) =>
      MediaRecorder.isTypeSupported(m),
    );
    if (!mime) {
      toast.error("Video recording is not supported in this browser.");
      return;
    }
    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4_000_000 });
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    recorder.onstop = () => {
      setRecording(false);
      const blob = new Blob(chunks, { type: "video/webm" });
      if (blob.size) {
        onCapture(new File([blob], `unique-ar-${Date.now()}.webm`, { type: "video/webm" }), "video");
        onOpenChange(false);
      }
    };
    recorderRef.current = recorder;
    recorder.start(200);
    setRecording(true);
    window.setTimeout(() => recorder.state === "recording" && recorder.stop(), MAX_RECORD_MS);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-4">
        <DialogHeader>
          <DialogTitle>AR camera filters</DialogTitle>
        </DialogHeader>

        <div className="relative overflow-hidden rounded-xl bg-muted aspect-square">
          {/* iOS Safari refuses to decode a display:none video, so keep it in layout but invisible. */}
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
          />
          <canvas ref={canvasRef} className="h-full w-full object-cover" />
          {loading && (
            <div className="absolute inset-0 grid place-items-center bg-background/70">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute right-2 top-2 h-8 w-8"
            onClick={() => setFacingUser((v) => !v)}
            title="Switch camera"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {AR_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterId(f.id)}
              className={`flex min-w-[64px] flex-col items-center gap-1 rounded-lg border p-2 text-[10px] ${
                filterId === f.id ? "border-primary bg-primary/10" : "border-border"
              }`}
            >
              <span className="text-xl">{f.emoji}</span>
              <span className="leading-tight text-center">{f.label}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button type="button" className="flex-1" onClick={takePhoto} disabled={loading || recording}>
            <Camera className="mr-2 h-4 w-4" /> Photo
          </Button>
          {allowVideo && (
            <Button
              type="button"
              variant={recording ? "destructive" : "secondary"}
              className="flex-1"
              onClick={toggleRecording}
              disabled={loading}
            >
              {recording ? <CircleStop className="mr-2 h-4 w-4" /> : <Video className="mr-2 h-4 w-4" />}
              {recording ? "Stop" : "Video"}
            </Button>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Videos are limited to 20 seconds. Filters are original Unique designs.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default ARCameraDialog;
