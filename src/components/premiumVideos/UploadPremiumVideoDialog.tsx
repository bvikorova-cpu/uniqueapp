import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
import { Loader2, Upload } from "lucide-react";

export default function UploadPremiumVideoDialog({ onUploaded }: { onUploaded: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setTitle("");
    setDescription("");
    setFile(null);
  };

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

    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "mp4";
      const path = `${user.id}/premium-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("videos").upload(path, file, {
        cacheControl: "3600",
        contentType: file.type || "video/mp4",
      });
      if (upErr) throw upErr;

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
          await supabase.storage.from("videos").remove([path]);
          toast.error("Not enough video credits", {
            description: "Uploading a video costs 1 video credit. Top up in the credits panel.",
          });
          return;
        }
        throw new Error(String(data?.error ?? "publish_failed"));
      }

      window.dispatchEvent(new Event("video-credits-updated"));
      toast.success("Video published", { description: "1 credit charged. It locks automatically at 50%." });
      reset();
      setOpen(false);
      onUploaded();
    } catch (e: any) {
      toast.error("Upload failed", { description: e?.message });
    } finally {
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
          <Button onClick={submit} disabled={busy} className="w-full">
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Publish video (1 credit)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
