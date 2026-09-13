import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { exportReversedVideo } from "@/lib/exportReversedVideo";

export const CLEAN_EXPORT_COST = 2;

interface DownloadActionsProps {
  frames: ImageBitmap[];
  width: number;
  height: number;
  fps: number;
}

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export default function DownloadActions({ frames, width, height, fps }: DownloadActionsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<"free" | "clean" | null>(null);
  const [progress, setProgress] = useState(0);

  const runExport = async (watermark: boolean) => {
    setProgress(0);
    const blob = await exportReversedVideo({
      frames,
      width,
      height,
      fps,
      watermark,
      onProgress: (r) => setProgress(Math.round(r * 100)),
    });
    const ext = blob.type.includes("mp4") ? "mp4" : "webm";
    saveBlob(blob, `reversed-${watermark ? "watermarked" : "clean"}.${ext}`);
  };

  const downloadFree = async () => {
    setBusy("free");
    try {
      await runExport(true);
      toast.success("Download ready", { description: "Your reversed video includes the Unique watermark." });
    } catch (e) {
      toast.error("Download failed", { description: e instanceof Error ? e.message : "Please try again." });
    } finally {
      setBusy(null);
    }
  };

  const downloadClean = async () => {
    if (!user) {
      toast.error("Sign in required", { description: "Please log in to download without the watermark." });
      return;
    }
    setBusy("clean");
    try {
      const { data, error } = await (supabase as any).rpc("spend_ai_credits", {
        _amount: CLEAN_EXPORT_COST,
        _reason: "video_reverse_clean_export",
        _source: "video_reverse",
      });
      if (error) throw error;
      if (!(data as any)?.ok) {
        toast.error("Not enough credits", {
          description: `A watermark-free download costs ${CLEAN_EXPORT_COST} credits.`,
          action: { label: "Buy credits", onClick: () => navigate("/ai-credits") },
          duration: 6000,
        });
        setBusy(null);
        navigate("/ai-credits");
        return;
      }
      await runExport(false);
      toast.success("Clean download ready", { description: `${CLEAN_EXPORT_COST} credits used.` });
    } catch (e) {
      toast.error("Download failed", { description: e instanceof Error ? e.message : "Please try again." });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="outline"
          className="flex-1 rounded-full"
          disabled={busy !== null}
          onClick={downloadFree}
        >
          {busy === "free" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download free with watermark
        </Button>
        <Button className="flex-1 rounded-full" disabled={busy !== null} onClick={downloadClean}>
          {busy === "clean" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Download without watermark ({CLEAN_EXPORT_COST} credits)
        </Button>
      </div>
      {busy !== null && (
        <p className="text-center text-xs text-muted-foreground">Rendering video: {progress}%…</p>
      )}
    </div>
  );
}
