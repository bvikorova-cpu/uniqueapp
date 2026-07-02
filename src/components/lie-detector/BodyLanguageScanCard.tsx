import { useState } from "react";
import { Video, Loader2, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBodyLanguageScan } from "@/hooks/useLieDetectorPro";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

async function extractKeyframes(file: File, count = 5): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = async () => {
      const dur = video.duration;
      const frames: string[] = [];
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      for (let i = 0; i < count; i++) {
        const t = (dur / (count + 1)) * (i + 1);
        await new Promise<void>((r) => { video.currentTime = t; video.onseeked = () => r(); });
        canvas.width = Math.min(video.videoWidth, 480);
        canvas.height = Math.round((canvas.width / video.videoWidth) * video.videoHeight);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        frames.push(dataUrl.split(",")[1]);
      }
      URL.revokeObjectURL(video.src);
      resolve(frames);
    };
    video.onerror = () => reject(new Error("Failed to load video"));
  });
}

export function BodyLanguageScanCard() {
  const [busy, setBusy] = useState(false);
  const m = useBodyLanguageScan();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { toast.error("Max 50MB video"); return; }
    setBusy(true);
    try {
      const frames = await extractKeyframes(file, 5);
      m.mutate({ frames_base64: frames, mime: "image/jpeg", context: file.name });
    } catch (err: any) { toast.error(err.message); }
    finally { setBusy(false); e.target.value = ""; }
  };

  return (
    <>
      <FloatingHowItWorks title={"Body Language Scan Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Body Language Scan Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Body Language Scan Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 text-purple-400">
          <Video className="w-5 h-5" /> Body Language Video Scan
          <Badge variant="outline" className="ml-auto text-[10px] border-purple-500/40 text-purple-300">25 cr</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="block">
          <Button asChild disabled={busy || m.isPending} className="w-full bg-purple-600 hover:bg-purple-700 text-white cursor-pointer">
            <span>
              {busy || m.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Extracting frames...</> : <><Upload className="w-4 h-4 mr-2" /> Upload Video (25 cr)</>}
            </span>
          </Button>
          <input type="file" accept="video/*" onChange={onFile} hidden disabled={busy || m.isPending} />
        </label>
        {m.data && (
          <div className="space-y-2 pt-2 border-t border-purple-500/20 text-xs">
            <div className="font-bold text-purple-400">Deception Score: {m.data.overall_score}%</div>
            <div><span className="text-muted-foreground">Blink rate:</span> <span className="text-purple-300">{m.data.blink_rate}</span></div>
            <div><span className="text-muted-foreground">Gaze:</span> <span className="text-purple-300">{m.data.gaze_pattern}</span></div>
            {m.data.deception_indicators?.length > 0 && (
              <ul className="space-y-1 pt-2 border-t border-purple-500/20">
                {m.data.deception_indicators.slice(0, 4).map((d: string, i: number) => <li key={i}>• {d}</li>)}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}
