import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import VideoFrame from "@/components/premiumVideos/VideoFrame";
import { useVideoFrames } from "@/hooks/useVideoFrames";
import { VIDEO_FRAMES } from "@/lib/videoFrameStyles";
import { Check, Frame as FrameIcon, Loader2, Lock, Upload } from "lucide-react";

export default function UploadPremiumVideoDialog({ onUploaded }: { onUploaded: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedFrame, setSelectedFrame] = useState("vframe_none");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { owned, busySlug, buy, applyFrame } = useVideoFrames();

  const frameMeta = useMemo(
    () => VIDEO_FRAMES.find((frame) => frame.slug === selectedFrame) ?? VIDEO_FRAMES[0],
    [selectedFrame],
  );
  const selectedFrameOwned = selectedFrame === "vframe_none" || owned.includes(selectedFrame);

  const reset = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setSelectedFrame("vframe_none");
  };

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const readDuration = (f: File) =>
    new Promise<number | null>((resolve) => {
      const el = document.createElement("video");
      el.preload = "metadata";
      el.onloadedmetadata = () => resolve(Number.isFinite(el.duration) ? Math.round(el.duration) : null);
      el.onerror = () => resolve(null);
      el.src = URL.createObjectURL(f);
    });

  const submit = async () => {
    if (!user) return toast.error("Sign in required");
    if (!title.trim()) return toast.error("Add a title");
    if (!file) return toast.error("Choose a video file");
    if (file.size > 200 * 1024 * 1024) return toast.error("Max file size is 200 MB");
    if (!selectedFrameOwned) {
      return toast.error("Buy this frame first", {
        description: "Preview is free, but a frame must be owned before it can be used on an uploaded video.",
      });
    }

    setBusy(true);
    let uploadedPath: string | null = null;
    let published = false;
    try {
      const { screenMediaFile, NSFW_BLOCK_MESSAGE } = await import("@/lib/mediaModeration");
      const verdict = await screenMediaFile(file);
      if (!verdict.allowed) throw new Error(NSFW_BLOCK_MESSAGE);

      const ext = file.name.split(".").pop() || "mp4";
      const path = `${user.id}/premium-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("videos").upload(path, file, {
        cacheControl: "3600",
        contentType: file.type || "video/mp4",
      });
      if (upErr) throw upErr;
      uploadedPath = path;

      const { data: pub } = supabase.storage.from("videos").getPublicUrl(path);
      const duration = await readDuration(file);

      const { data, error } = await (supabase as any).rpc("publish_premium_video", {
        _title: title.trim(),
        _video_url: pub.publicUrl,
        _description: description.trim() || null,
        _duration_seconds: duration,
      });
      if (error) throw error;
      if (!data?.ok) {
        if (data?.error === "insufficient") {
          toast.error("Not enough video credits", {
            description: "Uploading a video costs 1 video credit. Top up in the credits panel.",
          });
          return;
        }
        throw new Error(String(data?.error ?? "publish_failed"));
      }

      published = true;
      if (selectedFrame !== "vframe_none" && data?.id) {
        const framed = await applyFrame(data.id, selectedFrame);
        if (!framed) {
          toast.warning("Video published without frame", {
            description: "You can apply the frame later from My videos or Frames.",
          });
        }
      }
      window.dispatchEvent(new Event("video-credits-updated"));
      toast.success("Video published", { description: "1 credit charged. It locks automatically at 50%." });
      reset();
      setOpen(false);
      onUploaded();
    } catch (e: any) {
      toast.error("Upload failed", { description: e?.message });
    } finally {
      // Nothing is charged unless the Storage upload AND the publish RPC both succeed.
      // If we bailed out after uploading, remove the orphaned file.
      if (uploadedPath && !published) {
        await supabase.storage.from("videos").remove([uploadedPath]).catch(() => {});
      }
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" /> Upload video
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload a locked video</DialogTitle>
          <DialogDescription>
            Publishing costs 1 video credit. Viewers watch the first half for free — unlocking the rest costs them 1 credit, and you keep 50% of it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pv-title">Title</Label>
            <Input
              id="pv-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="What is this video about?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pv-desc">Description (optional)</Label>
            <Textarea
              id="pv-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pv-file">Video file (max 200 MB)</Label>
            <Input
              id="pv-file"
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-3 rounded-2xl border border-border/60 bg-background/50 p-3">
            <div className="flex items-center justify-between gap-2">
              <Label className="flex items-center gap-2">
                <FrameIcon className="h-4 w-4 text-primary" /> Frame preview
              </Label>
              <Badge variant={selectedFrameOwned ? "secondary" : "outline"}>
                {selectedFrameOwned ? "Owned" : `${frameMeta.credits} credits`}
              </Badge>
            </div>
            <VideoFrame slug={selectedFrame}>
              {previewUrl ? (
                <video src={previewUrl} controls muted playsInline className="aspect-video w-full bg-foreground object-contain" />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-foreground/90 text-primary-foreground">
                  <Upload className="h-8 w-8" />
                </div>
              )}
            </VideoFrame>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {VIDEO_FRAMES.map((frame) => {
                const ownedFrame = frame.slug === "vframe_none" || owned.includes(frame.slug);
                const active = selectedFrame === frame.slug;
                return (
                  <Button
                    key={frame.slug}
                    type="button"
                    size="sm"
                    variant={active ? "default" : "outline"}
                    className="h-auto min-h-10 justify-between px-2 py-2 text-xs"
                    onClick={() => setSelectedFrame(frame.slug)}
                  >
                    <span className="truncate">{frame.name}</span>
                    {ownedFrame ? <Check className="h-3.5 w-3.5" /> : <span>{frame.credits} cr</span>}
                  </Button>
                );
              })}
            </div>
            {!selectedFrameOwned && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={busySlug === selectedFrame}
                onClick={() => buy(selectedFrame)}
              >
                {busySlug === selectedFrame ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                Buy {frameMeta.name} for {frameMeta.credits} credits
              </Button>
            )}
          </div>
          <Button onClick={submit} disabled={busy || !selectedFrameOwned} className="w-full">
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Publish video (1 credit{selectedFrameOwned && selectedFrame !== "vframe_none" ? " + selected frame" : ""})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
